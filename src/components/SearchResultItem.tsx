import clsx from "clsx";
import { SearchResult } from "../db/search_result";
import { CharactersType } from "../db/characters";

import styles from "./SearchResultItem.module.scss";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useMedia } from "react-use";

type SearchResultItemProps = { searchResult: SearchResult, selected: boolean, onClick: () => void, onSelect: () => void };

function SearchResultItem({ searchResult, selected, onClick, onSelect }: SearchResultItemProps) {
  const cantHover = useMedia('(hover: none)');
  const { ref, inView, entry } = useInView({ threshold: 1 });
  
  useEffect(() => {
    // if the user can't hover over items, they don't become selected as scroll moves, 
    // then the scroll jumps around because the selected item isn't in view.
    if (!cantHover && selected && !inView) {
      entry?.target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [selected, inView, entry])

  return (
    <button ref={ref} type="button" className={clsx('list-group-item list-group-item-action', styles.button, styles[searchResult.type], selected && styles.selected)} onClick={onClick} onMouseMove={onSelect}>
      <div className={styles.information}>
        <div className={styles.description}>{searchResult.description}</div>
        <div className={styles.sub}>
          <span className={clsx("badge text-bg-secondary", styles.badge, styles.levelBadge)}>{searchResult.level}</span>
          {searchResult.related.radical.length > 0 && (<span className={clsx("badge", styles.badge, styles.radicalBadge)}>{searchResult.related.radical.length}</span>)}
          {searchResult.related.kanji.length > 0 && (<span className={clsx("badge", styles.badge, styles.kanjiBadge)}>{searchResult.related.kanji.length}</span>)}
          {searchResult.related.vocabulary.length > 0 && (<span className={clsx("badge", styles.badge, styles.vocabularyBadge)}>{searchResult.related.vocabulary.length}</span>)}
        </div>
        
      </div>
      <div className={styles.characters}>
        {searchResult.characters.type == CharactersType.TEXT && <span>{searchResult.characters.value}</span>}
        {searchResult.characters.type == CharactersType.SVG && <div className={styles.radicalSvg} dangerouslySetInnerHTML={ { __html: searchResult.characters.value } } />}
      </div>
    </button>
  );
}

export default SearchResultItem;