import { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, RefObject, useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useKey } from 'react-use';

import db, {  SearchResult } from '../services/db.ts'

import SearchResultItem from './SearchResultItem.tsx';
import KeyboardShortcuts from './KeyboardShortcuts.tsx';
import FloatingSearchButton from './FloatingSearchButton.tsx';

import styles from './SearchOverlay.module.scss'
import clsx from 'clsx';

function SearchOverlay() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => {
    if (!open) {
      setOpen(true);
      searchRef.current?.focus();
    }
  }, [open, setOpen, searchRef]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setQuery(e.currentTarget.value)
    setResults(db.search(e.currentTarget.value));
    setSelectedResultIndex(0);
    setOpen(true);
  }, [setQuery, setResults, setOpen, setSelectedResultIndex])

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, [setOpen, setResults]);

  const handleClose = useCallback(() => {
    setOpen(false);
    handleClear();
  }, [setOpen, handleClear]);

  const handleOpenResult = useCallback((searchResult: SearchResult) => {
    navigate(`/kanji/${searchResult.id}`);
    setOpen(false);
  }, [navigate, setOpen]);

  const handleClickBackdrop : MouseEventHandler = useCallback((e) => {
    if (e.currentTarget === e.target) {
      handleClose();
    } else {
      searchRef.current?.focus();
    }
  }, [handleClose]);

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
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
      const result = results[selectedResultIndex];
      if (result) {
        handleOpenResult(result);
      }

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
  }, [selectedResultIndex, setSelectedResultIndex, results, handleClear, handleClose]);

  useKey('Enter', handleOpen);
  useKey(' ', handleOpen);
  useKey('Escape', handleClose);

  return (
    <div className={styles.container}>
        {!open && <FloatingSearchButton onClick={handleOpen}/>}

        {open && (
          <div className={styles.backdrop} onClick={handleClickBackdrop}>
            <div className={styles.search}>
              <div className={styles.inputArea}>
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
                  <div className={styles.tips}>
                    <strong>Tip:</strong> You can search meanings, like <kbd>car</kbd> kanji like <kbd>車</kbd> readings like <kbd>くるま</kbd> or romaji like <kbd>kuruma</kbd>.
                  </div>
                )}
              </div>
              
              <div className={clsx("list-group", styles.searchResults)}>
                {results.map((result, i) => (
                  <SearchResultItem
                    key={result.id} 
                    searchResult={result} 
                    onClick={() => handleOpenResult(result)} 
                    onSelect={() => setSelectedResultIndex(i)}
                    selected={i === selectedResultIndex}
                  />
                ))}
              </div>
              
              <KeyboardShortcuts />
            </div>
          </div>
        )}
    </div>
  )
}

export default SearchOverlay
