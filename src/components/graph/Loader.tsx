import { useParams } from "react-router";
import db, { View as DBView } from "../../db/db";
import { useEffect, useMemo, useState } from "react";
import View from "./View";
import { useAppState } from "../AppState";

function loadView(type: string, id: number): Promise<DBView> {
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
  const { view, setView } = useAppState();

  useEffect(() => {
    setError(false);
    setLoading(false);
  }, [type, id, setLoading, setError]);

  useEffect(() => {
    if (view && id && view.primarySubject.id === id) {
      setLoading(false);
      return;
    }

    if (!type || !id || isNaN(id)) {
      setError(true);
      setLoading(false);
      setView(undefined);
      return;
    }

    if (error) {
      return;
    }

    if (!loading) {
      setLoading(true);

      const performLoad = async () => {
        try {
          const view = await loadView(type, id);
          setView(view);
        } catch {
          setError(true);
          setView(undefined);
        }
  
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
        <View view={view} />
      )}
    </>
  );
}

export default Loader;
