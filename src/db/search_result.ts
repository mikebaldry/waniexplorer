import { SvgCharacters, TextCharacters } from "./characters";

export type SearchResult = {
  id: number;
  type: SearchResultType;
  level: number;

  characters: TextCharacters | SvgCharacters;
  description: string;
  related: {
    radical: number[];
    kanji: number[];
    vocabulary: number[];
  };
};

export type SearchDocument = SearchResult & {
  primarySearch: string[];
  secondarySearch: string[];
};

export enum SearchResultType {
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary",
}
