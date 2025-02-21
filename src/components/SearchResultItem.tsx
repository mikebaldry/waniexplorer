import clsx from "clsx";
import { SearchResult, SearchResultCharactersType } from "../gen/search_result";

import styles from "./SearchResultItem.module.scss";

type SearchResultItemProps = { searchResult: SearchResult, selected: boolean, onClick: () => void, onSelect: () => void };

function SearchResultItem({ searchResult, selected, onClick, onSelect }: SearchResultItemProps) {
  return (
    <button type="button" className={clsx('list-group-item list-group-item-action', styles.button, styles[searchResult.type], selected && styles.selected)} onClick={onClick} onMouseMove={onSelect}>
      <div className="search-item__level">{searchResult.level}</div>
      <div className="search-item__characters">
        {searchResult.characters.type == SearchResultCharactersType.TEXT && <span>{searchResult.characters.value}</span>}
        {searchResult.characters.type == SearchResultCharactersType.SVG && <div className="radical-svg" dangerouslySetInnerHTML={ { __html: searchResult.characters.value } } />}
      </div>
      <div className="search-item__description">{searchResult.description} ({searchResult.related.radical.length}) ({searchResult.related.kanji.length}) ({searchResult.related.vocabulary.length})</div>
    </button>
  );
}

export default SearchResultItem;