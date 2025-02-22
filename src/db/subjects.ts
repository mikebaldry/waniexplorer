import { SvgCharacters, TextCharacters } from "./characters";

export type Subject = RadicalSubject | KanjiSubject | VocabularySubject;
export enum SubjectType { 
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary"
};

export type RadicalSubject = {
  id: number,
  type: SubjectType.RADICAL,
  level: number,
  primaryMeaning: string,
  otherMeanings: string[],
  characters: TextCharacters | SvgCharacters,
  meaningMnemonic: string,
  urls: {
    wanikani: string
  }
}

export type KanjiReading = {
  reading: string,
  primary: boolean,
  type: "onyomi" | "kunyomi" | "nanori"
}

export type KanjiSubject = {
  id: number,
  type: SubjectType.KANJI,
  level: number,
  characters: TextCharacters,
  primaryMeaning: string,
  otherMeanings: string[],
  primaryReading: string,
  readings: KanjiReading[],
  readingMnemonic: string,
  meaningMnemonic: string,
  urls: {
    wanikani: string
  },
  related: {
    radicals: number[],
    vocabularies: number[]
  }
}

export type VocabularySubject = {
  id: number,
  type: SubjectType.VOCABULARY,
  level: number,
  characters: TextCharacters,
  primaryMeaning: string,
  otherMeanings: string[],
  primaryReading: string,
  otherReadings: string[],
  readingMnemonic: string,
  meaningMnemonic: string,
  urls: {
    wanikani: string,
  }
}
