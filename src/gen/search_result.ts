import avro from "avsc";

export type SearchResult = {
  id: number
  type: SearchResultType,
  level: number,

  characters: SearchResultTextCharacters | SearchResultSvgCharacters,
  description: string
  related: {
    radical: number[],
    kanji: number[],
    vocabulary: number[]
  }
};

export type SearchDocument = SearchResult & {
  primarySearch: string[],
  secondarySearch: string[],
};

export type SearchResultTextCharacters = {
  type: SearchResultCharactersType.TEXT,
  value: string
}

export type SearchResultSvgCharacters = {
  type: SearchResultCharactersType.SVG,
  value: string
}

export enum SearchResultCharactersType {
  TEXT = "text",
  SVG = "svg"
}

export enum SearchResultType {
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary"
}

export const avroType = avro.Type.forSchema(
  {
    type: "array",
    items: {
      type: "record",
      name: "SearchResult",
      fields: [
        { name: "id", type: "int" },
        { name: "type", type: { type: "enum", name: "SearchResultType", symbols: [SearchResultType.RADICAL, SearchResultType.KANJI, SearchResultType.VOCABULARY] } },
        { name: "level", type: "int" },
        { name: "primarySearch", type: { type: "array", "items": "string" } },
        { name: "secondarySearch", type: { type: "array", "items": "string" } },
        { 
          name: "characters", 
          type: {
            type: "record",
            name: "SearchResultCharacters",
            fields: [
              { name: "type", type: { type: "enum", name: "SearchResultCharactersTypeText", symbols: [SearchResultCharactersType.TEXT, SearchResultCharactersType.SVG] } },
              { name: "value", type: "string" }
            ]
          }
        },
        { name: "description", type: "string" },
        { 
          name: "related", 
          type: {
            type: "record",
            name: "SearchResultRelated",
            fields: [
              { name: "radical", type: { type: "array", "items": "int" } },
              { name: "kanji", type: { type: "array", "items": "int" } },
              { name: "vocabulary", type: { type: "array", "items": "int" } },
            ]
          }
        },
      ]
    }
  }
);
