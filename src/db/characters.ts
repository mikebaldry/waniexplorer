export enum CharactersType {
  TEXT = "text",
  SVG = "svg",
}

export type TextCharacters = {
  type: CharactersType.TEXT;
  value: string;
};

export type SvgCharacters = {
  type: CharactersType.SVG;
  value: string;
};

export type Characters = TextCharacters | SvgCharacters;
