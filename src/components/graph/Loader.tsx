import { useParams } from "react-router";
import db, { View } from "../../db/db";
import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import StandardView, { StandardViewOrdering } from "./StandardView";


function loadView(type: string, id: number): Promise<View> {
  switch (type) {
    case "radical":
      return db.radicalView(id);
    case "kanji":
      return db.kanjiView(id);
    case "vocabulary":
      return db.vocabularyView(id);
  }

  throw `Invalid type: ${type}`;
}

function Loader() {
  const { id: idParam, type } = useParams();
  const id = useMemo(() => parseInt(idParam!), [idParam]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    setError(false);
    setLoading(false);
  }, [type, id, setLoading, setError]);

  useEffect(() => {
    if (view && id && view.primarySubjectId === id) {
      setLoading(false);
      return;
    }

    if (!type || !id || isNaN(id)) {
      setError(true);
      setLoading(false);
      setView(null);
      return;
    }

    if (error) {
      return;
    }

    if (!loading) {
      setLoading(true);

      const performLoad = async () => {
        let view = null;
  
        try {
          view = await loadView(type, id);
        } catch {
          setError(true);
        }
  
        setView(view);
        setLoading(false);
      };

      performLoad();
    }
  }, [type, id, view, loading, setView, setLoading, setError]);

  return (
    <>
      {error && (<div id="root-loader">There was an error :(</div>)}
      {loading && !error && (<div id="root-loader">Loading...</div>)}

      {view && !error && !loading && (
        <ReactFlowProvider>
          <StandardView
            view={view}
            primarySubjectId={id}
            ordering={
              type === "vocabulary"
                ? StandardViewOrdering.VOCABULARY_KANJI_RADICAL
                : StandardViewOrdering.RADICAL_KANJI_VOCABULARY
            }
          />
        </ReactFlowProvider>
      )}
    </>
  );
}

export default Loader;
