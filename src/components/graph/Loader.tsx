import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import db from "../../db/db";
import { Suspense, useMemo } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import StandardView, { StandardViewOrdering } from "./StandardView";

function DataLoader() {
  let { id: idParam, type } = useParams();
  const id = useMemo(() => parseInt(idParam!), [idParam]);

  const { data: view } = useSuspenseQuery({ 
    queryKey: [type, id], 
    queryFn: () => {
      switch (type) {
        case "radical": 
          return db.radicalView(id);
        case "kanji":
          return db.kanjiView(id);
        case "vocabulary":
          return db.vocabularyView(id);
      }
    }
  });
  
  return (
    (view && <StandardView view={view} primarySubjectId={id} ordering={StandardViewOrdering.RADICAL_KANJI_VOCABULARY} />)
  )
}

function Loader() {
  return (
    <Suspense fallback="Loading...">
      <ReactFlowProvider>
        <DataLoader />
      </ReactFlowProvider>
    </Suspense>
  )
}

export default Loader
