import { Characters, TextCharacters } from "./characters";

export type Subject = RadicalSubject | KanjiSubject | VocabularySubject;
export enum SubjectType {
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary",
}

export type BasicSubject = {
  id: number;
  type: SubjectType;
  level: number;
  primaryMeaning: string;
  otherMeanings: string[];
  characters: Characters;
  wkSlug: string;
};

export type RadicalSubject = BasicSubject & {
  type: SubjectType.RADICAL;

  meaningMnemonic: string;

  related: {
    kanjis: number[];
    vocabularies: number[];
  };
};

export type KanjiReading = {
  reading: string;
  primary: boolean;
  type: "onyomi" | "kunyomi" | "nanori";
};

export type KanjiSubject = BasicSubject & {
  type: SubjectType.KANJI;
  characters: TextCharacters;
  primaryReading: string;
  readings: KanjiReading[];
  readingMnemonic: string;
  meaningMnemonic: string;
  related: {
    radicals: number[];
    vocabularies: number[];
  };
};

export type VocabularySubject = BasicSubject & {
  type: SubjectType.VOCABULARY;
  characters: TextCharacters;
  primaryReading: string;
  otherReadings: string[];
  readingMnemonic: string;
  meaningMnemonic: string;
  related: {
    radicals: number[];
    kanjis: number[];
  };
  readingAudio: VocabularyReadingAudio[];
};

export type VocabularyReadingAudio = {
  reading: string;
  url: string;
};
