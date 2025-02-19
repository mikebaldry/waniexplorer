import { ChangeEventHandler, KeyboardEventHandler, useCallback, useEffect, useRef, useState } from 'react'
import './Search.scss'
import db, {  SearchResult } from './services/db.ts'
import { useNavigate, useParams } from 'react-router'
import { useKey } from 'react-use';
import { SearchResultCharactersType } from './gen/search_result.ts';

function Search() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  let { id } = useParams();
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [setOpen]);

  useEffect(() => {
    async function doIt() {
      if (id) {
        // const kanji = await db.kanji(parseInt(id));
        // setSelectedResult(kanji);
      }
    }
    doIt();
  }, [id]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setQuery(e.currentTarget.value)
    setResults(db.search(e.currentTarget.value));
    setSelectedResultIndex(0);
    setOpen(true);
  }, [setQuery, setResults])

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, [setOpen, setResults]);

  const handleClose = useCallback(() => {
    setOpen(false);
    handleClear();
  }, [setOpen, handleClear]);

  const handleClearSelected = useCallback(() => {
    setSelectedResult(null);
    setSelectedResultIndex(0);
    setQuery('');
    setOpen(false);
    setResults([]);
  }, [setSelectedResult, setSelectedResultIndex, setQuery, setOpen, setResults])

  const openSelected = useCallback(() => {
    handleClearSelected();
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchRef, handleClearSelected]);

  const handleOpenResult = useCallback((searchResult: SearchResult) => {
    navigate(`/kanji/${searchResult.id}`);
    setOpen(false);
  }, [navigate, setOpen]);

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === 'Return') {
        openSelected();
        
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
        handleOpenResult(results[selectedResultIndex]);

        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'Escape') {
        if (results.length > 0) {
          handleClear();
        } else {
          handleClose();
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, [openSelected, open, selectedResultIndex, setSelectedResultIndex, results, handleClear]);

  useKey('Enter', handleOpen);
  useKey('Escape', handleClose);

  return (
    <div className="search-container">
      {!open && (
        <button className="btn btn-link search-handle" onClick={handleOpen} title="Open search">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" className="search-handle__border"></path> 
            <path d="M14 14L16 16" className="search-handle__magnify" /> 
            <path d="M15 11.5C15 13.433 13.433 15 11.5 15C9.567 15 8 13.433 8 11.5C8 9.567 9.567 8 11.5 8C13.433 8 15 9.567 15 11.5Z" className="search-handle__magnify"></path>
            <path d="m 10.787169,10.744883 v -0.473126 c 0,-0.05319 -0.03639,-0.08119 -0.103584,-0.08119 -0.06159,0 -0.100784,0.028 -0.100784,0.08119 v 0.473126 h -0.268758 c -0.05039,0 -0.07559,0.03919 -0.07559,0.09519 0,0.05599 0.0252,0.09798 0.07559,0.09798 h 0.268758 v 0.607505 c -0.09798,0.0336 -0.198769,0.06719 -0.299553,0.09519 -0.0336,0.0112 -0.05599,0.04479 -0.05599,0.08959 0,0.0112 0,0.0224 0.0028,0.0336 0.0168,0.05039 0.05039,0.07279 0.08679,0.07279 0.0112,0 0.0196,-0.0028 0.03079,-0.0056 0.07839,-0.0224 0.156776,-0.05039 0.235164,-0.07839 v 0.725086 c 0,0.06999 -0.014,0.08959 -0.09798,0.08959 -0.04479,0 -0.120381,-0.0084 -0.159575,-0.0196 -0.0056,-0.0028 -0.0084,-0.0028 -0.014,-0.0028 -0.0336,0 -0.06439,0.0252 -0.07279,0.08119 -0.0028,0.0084 -0.0028,0.0196 -0.0028,0.028 0,0.04759 0.0224,0.07839 0.06439,0.08959 0.05319,0.0112 0.142777,0.0224 0.212766,0.0224 0.184772,0 0.274358,-0.06719 0.274358,-0.246361 V 11.67433 c 0.07559,-0.03079 0.148376,-0.06439 0.218365,-0.100785 0.03639,-0.0196 0.05319,-0.04759 0.05319,-0.08399 0,-0.0112 -0.0028,-0.0252 -0.0056,-0.03919 -0.014,-0.03919 -0.04199,-0.05879 -0.07279,-0.05879 -0.0112,0 -0.0252,0.0028 -0.03639,0.0084 -0.05039,0.0224 -0.100784,0.04479 -0.156775,0.06719 v -0.529119 h 0.170773 c 0.05039,0 0.07839,-0.04199 0.07839,-0.09798 0,-0.05599 -0.028,-0.09519 -0.07839,-0.09519 z m 1.201012,0.971448 v -0.229564 h 0.475926 c 0.153975,0 0.235163,-0.07279 0.235163,-0.235163 v -0.585109 c 0,-0.159575 -0.08119,-0.235163 -0.235163,-0.235163 h -0.475926 v -0.170774 c 0,-0.05039 -0.0336,-0.07559 -0.09798,-0.07559 -0.06439,0 -0.09519,0.0252 -0.09519,0.07559 v 0.170774 H 11.35828 c -0.156776,0 -0.235164,0.07279 -0.235164,0.235163 v 0.585109 c 0,0.162374 0.07839,0.235163 0.235164,0.235163 h 0.436732 v 0.229564 h -0.688693 c -0.04759,0 -0.07279,0.03919 -0.07279,0.08959 0,0.05319 0.0252,0.09239 0.07279,0.09239 h 0.176372 c 0.109183,0.19037 0.26036,0.349945 0.436732,0.478725 -0.215566,0.09519 -0.459128,0.159575 -0.70269,0.195969 -0.05319,0.0084 -0.08399,0.05039 -0.08399,0.100784 0,0.0084 0,0.0196 0.0028,0.028 0.014,0.05319 0.05319,0.08399 0.103584,0.08399 0.0084,0 0.0168,0 0.0252,-0.0028 0.285555,-0.04759 0.582309,-0.145577 0.845468,-0.282755 0.240762,0.137178 0.50672,0.229564 0.769878,0.277156 0.0112,0.0028 0.0224,0.0028 0.03079,0.0028 0.05599,0 0.09799,-0.028 0.106384,-0.08679 0.0028,-0.0084 0.0028,-0.0168 0.0028,-0.0252 0,-0.05319 -0.03079,-0.09519 -0.08679,-0.103584 -0.215558,-0.0336 -0.428324,-0.08959 -0.624293,-0.176373 0.170773,-0.109183 0.31915,-0.235163 0.428332,-0.375141 0.0364,-0.04759 0.05599,-0.100784 0.05599,-0.145577 0,-0.08399 -0.06159,-0.151177 -0.19037,-0.151177 z m 0,-0.405937 v -0.268758 h 0.51512 v 0.184771 c 0,0.05599 -0.0168,0.08399 -0.08119,0.08399 z m 0,-0.442331 v -0.260359 h 0.433932 c 0.06439,0 0.08119,0.0252 0.08119,0.08119 v 0.179172 z m -0.193169,-0.260359 v 0.260359 h -0.475926 v -0.179172 c 0,-0.05599 0.0196,-0.08119 0.08399,-0.08119 z m 0,0.433932 v 0.268758 h -0.391939 c -0.06439,0 -0.08399,-0.028 -0.08399,-0.08399 v -0.184771 z m 0.489923,0.856667 c 0.0336,0 0.05039,0.0084 0.05039,0.0224 0,0.0112 -0.0056,0.0224 -0.0196,0.03919 -0.100784,0.12318 -0.240762,0.232364 -0.405936,0.324749 -0.159576,-0.09799 -0.307952,-0.226765 -0.408737,-0.38634 z" className="search-handle__kanji" />
          </svg>
        </button>
      )}

      {open && (
        <div className="search">
          <input 
            type="text" 
            className="form-control form-control-lg fs-2" 
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
              ref={searchRef}
          />

          {results.length === 0 && (
            <div className="card">
              <div className="card-body">
                <strong>Tip:</strong> You can search meanings, like <kbd>car</kbd> kanji like <kbd>車</kbd> readings like <kbd>くるま</kbd> or romaji like <kbd>kuruma</kbd>.
              </div>
            </div>
          )}

          <div className="list-group search__results">
            {results.map((result, i) => (
              <button key={result.id} type="button" className={`list-group-item list-group-item-action search-item search-item--${result.type}${selectedResultIndex == i ? ' search-item--active' : ''}`} onClick={() => handleOpenResult(result)}>
                <div className="search-item__level">{result.level}</div>
                <div className="search-item__characters">
                  {result.characters.type == SearchResultCharactersType.TEXT && <span>{result.characters.value}</span>}
                  {result.characters.type == SearchResultCharactersType.SVG && <div className="radical-svg" dangerouslySetInnerHTML={ { __html: result.characters.value } } />}
                </div>
                <div className="search-item__description">{result.description}</div>
              </button>
            ))}
          </div>

          <div className="card p-4">
            Hello
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
