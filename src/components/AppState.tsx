import { useState, createContext, useContext, PropsWithChildren, useCallback } from "react";
import { Ordering, View as DBView } from "../db/db";
import { Subject } from "../db/subjects";
import chunk from "lodash-es/chunk";
import minBy from "lodash-es/minBy";

export type AppState = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  view?: View;
  setView: (view?: DBView) => void;
  setFocussedSubject: (subject?: Subject) => void;
};

type Neighbours = {
  above?: Subject;
  below?: Subject;
  left?: Subject;
  right?: Subject;
};

export type View = {
  rows: Subject[][];
  primarySubject: Subject;
  focussedSubject?: Subject;
  neighbours: Neighbours
}

type positionalCache = { [key: string]: { row: number, column: number }};
type ViewWithPositionalCache = View & {
  positionalCache: positionalCache
}

const AppState = createContext<AppState | null>(null);

const Provider = ({ children }: PropsWithChildren) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [viewState, setViewState] = useState<ViewWithPositionalCache | undefined>();

  const recalculateNeighbours = (view: Omit<ViewWithPositionalCache, "neighbours">): ViewWithPositionalCache => {
    const neighbours: Neighbours = {
      above: undefined,
      below: undefined,
      left: undefined,
      right: undefined
    };

    if (!view.focussedSubject) {
      return { ...view, neighbours };
    }

    const focussedPosition = view.positionalCache[view.focussedSubject?.id.toString()];
    const srcRow = view.rows[focussedPosition.row];

    const closestSubjectInRow = (srcRow: Subject[], destRow: Subject[], srcColumn: number): Subject | undefined => {
      const normalizePosition = (index: number, row: Subject[]) => index - (row.length / 2);
      const srcPosition = normalizePosition(srcColumn, srcRow);
      const destPositions = destRow.map((subject, i) => ({ distance: Math.abs(srcPosition - normalizePosition(i, destRow)), subject }));

      return minBy(destPositions, (item) => item.distance)?.subject;
    };

    if (focussedPosition.row > 0) {
      neighbours.above = closestSubjectInRow(srcRow, view.rows[focussedPosition.row - 1], focussedPosition.column);
    }

    if (focussedPosition.row < view.rows.length - 1) {
      neighbours.below = closestSubjectInRow(srcRow, view.rows[focussedPosition.row + 1], focussedPosition.column);
    }

    if (focussedPosition.column > 0) {
      neighbours.left = srcRow[focussedPosition.column - 1];
    }

    if (focussedPosition.column < srcRow.length - 1) {
      neighbours.right = srcRow[focussedPosition.column + 1];
    }

    return { ...view, neighbours };
  };

  const setView = useCallback((view?: DBView) => {
    if (!view) {
      setViewState(undefined);
      return;
    }

    const maxNodesPerRow = 20;

    const radicalNodes = chunk(
      view.radicals as Subject[],
      Math.max(6, Math.min(maxNodesPerRow, view.radicals.length / maxNodesPerRow)),
    );
  
    const kanjiNodes = chunk(
      view.kanjis as Subject[],
      Math.max(6, Math.min(maxNodesPerRow, view.kanjis.length / maxNodesPerRow)),
    );
  
    const vocabularyNodes = chunk(
      view.vocabularies as Subject[],
      Math.max(6, Math.min(maxNodesPerRow, view.vocabularies.length / maxNodesPerRow)),
    );

    let rows;
    if (view.ordering == Ordering.RadicalKanjiVocabulary) {
      rows = [...radicalNodes, ...kanjiNodes, ...vocabularyNodes];
    } else {
      rows = [...vocabularyNodes, ...kanjiNodes, ...radicalNodes];
    }

    const positionalCache: positionalCache = {};

    rows.forEach((cols, rowIndex) => {
      cols.forEach((subject, colIndex) => {
        positionalCache[subject.id.toString()] = { row: rowIndex, column: colIndex };
      });
    });

    setViewState(recalculateNeighbours({ rows, primarySubject: view.primarySubject, focussedSubject: view.primarySubject, positionalCache }));
  }, [setViewState]);

  const setFocussedSubject = useCallback((subject?: Subject) => {
    setViewState((prev) => {
      if (!prev) {
        throw "Can't set focussed subject without a view loaded";
      }

      return recalculateNeighbours({ ...prev, focussedSubject: subject });
    });
  }, [setViewState]);

  const value = {
    menuOpen,
    setMenuOpen,
    view: viewState,
    setView,
    setFocussedSubject
  }

  return (
    <AppState.Provider value={value}>
      {children}
    </AppState.Provider>
  );
};

export const useAppState = (): AppState => {
  const result = useContext(AppState);

  if (!result) {
    throw "No AppState available, not wrapped in AppState.Provider";
  }

  return result;
}

export default Provider;