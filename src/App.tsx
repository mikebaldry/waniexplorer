import { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import db, { KanjiResult, KanjiSubject } from './services/db.ts'
import { Outlet, useNavigate, useParams } from 'react-router'
import { useKey } from 'react-use';

function App() {
  const navigate = useNavigate();
  const [resultsOpen, setResultsOpen] = useState(false);
  let { id } = useParams();
  const [selectedKanji, setSelectedKanji] = useState<KanjiSubject | null>(null);
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KanjiResult[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function doIt() {
      if (id) {
        const kanji = await db.kanji(parseInt(id));
        setSelectedKanji(kanji);
      }
    }
    doIt();
  }, [id]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setQuery(e.currentTarget.value)
    setResults(db.search(e.currentTarget.value).slice(0, 10));
    setSelectedResultIndex(0);
    setResultsOpen(true);
  }, [setQuery, setResults])

  const handleClearSelected = useCallback(() => {
    setSelectedKanji(null);
    setSelectedResultIndex(0);
    setQuery('');
    setResultsOpen(false);
    setResults([]);
  }, [setSelectedKanji, setSelectedResultIndex, setQuery, setResultsOpen, setResults])

  const enterSearch = useCallback(() => {
    handleClearSelected();
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [handleClearSelected]);

  const handleKanjiClick: MouseEventHandler<HTMLButtonElement> = useCallback((id) => {
    navigate(`/kanji/${id}`);
    setResultsOpen(false);
  }, [navigate, setResultsOpen]);

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
    if (!resultsOpen) {
      if (e.key === 'Enter' || e.key === 'Return') {
        enterSearch();
        e.preventDefault();
        e.stopPropagation();
      }
    } else {
      const looper = (x: number, m: number) => ((x % m) + m) % m;
      if (e.key === 'ArrowDown') {
        setSelectedResultIndex((i) => looper(i + 1, results.length));
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'ArrowUp') {
        setSelectedResultIndex((i) => looper(i - 1, results.length));
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'Enter' || e.key === 'Return') {
        handleKanjiClick(results[selectedResultIndex].id)
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, [enterSearch, resultsOpen, selectedResultIndex, setSelectedResultIndex, results]);

  useKey('Enter', enterSearch);

  return (
    <>
      <div className="position-absolute px-3 py-3 z-1">
        <div className="input-group">
          <input 
            type="text" 
            className="form-control form-control-lg fs-2" 
            readOnly={!!selectedKanji} 
            value={selectedKanji ? `${selectedKanji.character}: ${selectedKanji.primaryMeaning}` : query}
            placeholder='Kanji search' 
            onChange={handleChange} 
            onClick={handleClearSelected}
            onKeyDown={handleKeyDown}
            autoFocus
            ref={searchRef}
          />
        </div>

        {resultsOpen && (
          <div className="list-group py-3">
            {results.slice(0, 10).map((result, i) => (
              <button key={result.id} type="button" className={`list-group-item list-group-item-action${selectedResultIndex == i ? ' active' : ''}`} onClick={() => handleKanjiClick(result.id)}>
                {result.character} - {result.primaryMeaning} - {result.primaryReading} - {result.vocabularyIds.length} vocabulary words
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="position-absolute vw-100 vh-100 top-0 start-0 z-0">
        <Outlet />
      </div>
    </>
  )
}

export default App
