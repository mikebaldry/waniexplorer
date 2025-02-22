export type Subject = RadicalSubject | KanjiSubject | VocabularySubject;
export enum SubjectType { 
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary"
};

export type RadicalSubject = {
  id: number,
  type: SubjectType.RADICAL
}

export type KanjiSubject = {
  id: number,
  type: SubjectType.KANJI
}

export type VocabularySubject = {
  id: number,
  type: SubjectType.VOCABULARY
}
