import clsx from "clsx";
import { SearchResult, SearchResultCharactersType } from "../gen/search_result";

import styles from "./SearchResultItem.module.scss";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

type SearchResultItemProps = { searchResult: SearchResult, selected: boolean, onClick: () => void, onSelect: () => void };

function SearchResultItem({ searchResult, selected, onClick, onSelect }: SearchResultItemProps) {
  const { ref, inView, entry } = useInView({ threshold: 1 });
  
  useEffect(() => {
    if (selected && !inView) {
      entry?.target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [selected, inView, entry])

  return (
    <button ref={ref} type="button" className={clsx('list-group-item list-group-item-action', styles.button, styles[searchResult.type], selected && styles.selected)} onClick={onClick} onMouseMove={onSelect}>
      <div className={styles.information}>
        <div className={styles.description}>{searchResult.description}</div>
        <div className={styles.level}>{searchResult.level}</div>
      </div>
      <div className={styles.characters}>
        {searchResult.characters.type == SearchResultCharactersType.TEXT && <span>{searchResult.characters.value}</span>}
        {searchResult.characters.type == SearchResultCharactersType.SVG && <div className={styles.radicalSvg} dangerouslySetInnerHTML={ { __html: searchResult.characters.value } } />}
      </div>
    </button>
  );
}

export default SearchResultItem;