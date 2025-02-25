import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";

import db, { SearchResult } from "../db/db.ts";

import SearchResultItem from "./SearchResultItem.tsx";
import KeyboardShortcuts from "./KeyboardShortcuts.tsx";
import FloatingSearchButton from "./FloatingSearchButton.tsx";

import styles from "./SearchOverlay.module.scss";
import clsx from "clsx";
import { useKeyboardEvent, useMediaQuery } from "@react-hookz/web";
import debounce from "lodash-es/debounce";

function SearchOverlay() {
  const navigate = useNavigate();
  const isRealKeyboard = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      setOpen(true);
    }
  }, [location.pathname]);

  const handleOpen = useCallback(() => {
    if (!open) {
      setOpen(true);
      searchRef.current?.focus();
    }
  }, [open, setOpen, searchRef]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setQuery(e.currentTarget.value);
      db.search(e.currentTarget.value).then((results) => {
        setResults(results);
        setSelectedResultIndex(0);
      });
    },
    [setQuery, setResults, setSelectedResultIndex],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setSelectedResultIndex(0);
  }, [setQuery, setResults, setSelectedResultIndex]);

  const handleClose = useCallback(() => {
    setOpen(false);
    handleClear();
  }, [setOpen, handleClear]);

  const handleOpenResult = useCallback(
    (searchResult: SearchResult) => {
      navigate(`/${searchResult.type}/${searchResult.id}`);
      handleClose();
    },
    [navigate, handleClose],
  );

  const handleClickBackdrop: MouseEventHandler = useCallback(
    (e) => {
      if (e.currentTarget === e.target) {
        handleClose();
      } else {
        searchRef.current?.focus();
      }
    },
    [handleClose],
  );

  const handleToggle = useCallback(() => {
    if (open) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [open, handleOpen, handleClose]);

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const looper = (x: number, m: number) => ((x % m) + m) % m;
      if (e.key === "ArrowDown") {
        setSelectedResultIndex((i) => looper(i + 1, results.length));

        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "ArrowUp") {
        setSelectedResultIndex((i) => looper(i - 1, results.length));

        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "Enter" || e.key === "Return") {
        if (!isRealKeyboard) {
          searchRef.current?.blur();
        } else {
          const result = results[selectedResultIndex];
          if (result) {
            handleOpenResult(result);
          }
        }

        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "Escape") {
        if (results.length > 0) {
          handleClear();
        } else {
          handleClose();
        }

        e.preventDefault();
        e.stopPropagation();
      }
    },
    [
      selectedResultIndex,
      setSelectedResultIndex,
      results,
      handleClear,
      handleClose,
      handleOpenResult,
      isRealKeyboard,
    ],
  );

  useKeyboardEvent("Enter", handleOpen);
  useKeyboardEvent(" ", handleOpen);
  useKeyboardEvent("Escape", handleClose);

  const [scrolling, setScrolling] = useState(false);

  const handleEndScroll = useMemo(() => {
    return debounce(() => {
      setScrolling(false);
    }, 500);
  }, [setScrolling]);

  const handleScroll = useCallback(() => {
    setScrolling(true);
    handleEndScroll();
  }, [setScrolling, handleEndScroll]);

  return (
    <div className={styles.container}>
      <FloatingSearchButton onClick={handleToggle} showKanji={open} />

      {open && (
        <div className={styles.backdrop} onClick={handleClickBackdrop}>
          <div className={styles.search}>
            <div className={styles.inputArea}>
              <input
                name="query"
                type="text"
                className="form-control form-control-lg fs-2"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="false"
                autoCorrect="false"
                autoFocus
                ref={searchRef}
              />

              {results.length === 0 && (
                <div className={styles.tips}>
                  <strong>Tip:</strong> You can search meanings, like{" "}
                  <kbd>car</kbd> kanji like <kbd>車</kbd> readings like{" "}
                  <kbd>くるま</kbd> or romaji like <kbd>kuruma</kbd>.
                </div>
              )}
            </div>

            <div
              className={clsx("list-group", styles.searchResults)}
              onWheel={handleScroll}
            >
              {results.map((result, i) => (
                <SearchResultItem
                  key={result.id}
                  searchResult={result}
                  onClick={() => handleOpenResult(result)}
                  onSelect={() => setSelectedResultIndex(i)}
                  selected={i === selectedResultIndex}
                  scrolling={scrolling}
                />
              ))}
            </div>

            <KeyboardShortcuts />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchOverlay;
