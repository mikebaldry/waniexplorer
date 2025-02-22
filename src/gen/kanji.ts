import * as WK from "./wanikani_subjects";
import * as DB from "../db/subjects";
import { SearchDocument, SearchResultType } from "../db/search_result";
import { CharactersType, TextCharacters } from "../db/characters";

export default async function handle(subject: WK.KanjiSubject): Promise<[SearchDocument, DB.KanjiSubject]> {
  const primaryMeaning = subject.data.meanings.find((m) => m.primary);
  const primaryReading = subject.data.readings.find((r) => r.primary);

  if (!primaryMeaning) {
    throw `No primary meaning for ${subject.id}`;
  }

  if (!primaryReading) {
    throw `No primary reading for ${subject.id}`;
  }

  let otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning);
  otherMeanings = [...otherMeanings, ...subject.data.auxiliary_meanings.filter((am) => am.type == "whitelist").map((am) => am.meaning)];

  let otherReadings = subject.data.readings.filter((r) => !r.primary).map((r) => r.reading);

  const relatedRadicalIds = subject.data.component_subject_ids;
  const relatedVocabularyIds = subject.data.amalgamation_subject_ids;

  const characters: TextCharacters = { type: CharactersType.TEXT, value: subject.data.characters };

  const searchResult = {
    id: subject.id,
    type: SearchResultType.KANJI,
    level: subject.data.level,
    primarySearch: [primaryMeaning.meaning, primaryReading.reading, subject.data.characters],
    secondarySearch: [...otherMeanings, ...otherReadings],
    characters: characters,
    description: primaryMeaning.meaning,
    related: {
      radical: relatedRadicalIds,
      kanji: [],
      vocabulary: relatedVocabularyIds
    }
  };

  const dbSubject: DB.KanjiSubject = {
    id: subject.id,
    type: DB.SubjectType.KANJI,
    level: subject.data.level,
    characters: characters,
    primaryReading: primaryReading.reading,
    readings: subject.data.readings.map((r) => { return { primary: r.primary, reading: r.reading, type: r.type } }),
    primaryMeaning: primaryMeaning.meaning,
    otherMeanings: subject.data.meanings.filter((m) => !m.primary).map((m) => { return m.meaning }),
    meaningMnemonic: subject.data.meaning_mnemonic,
    readingMnemonic: subject.data.reading_mnemonic,
    urls: {
      wanikani: subject.data.document_url,
      graph: `/v/kanji/${subject.id}`
    },
    related: {
      radicals: relatedRadicalIds,
      vocabularies: relatedVocabularyIds
    }
  };

  return [searchResult, dbSubject];
}