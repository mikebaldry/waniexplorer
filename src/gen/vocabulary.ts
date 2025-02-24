import * as WK from "./wanikani_subjects";
import * as DB from "../db/subjects";
import { SearchDocument, SearchResultType } from "../db/search_result";
import uniq from "lodash-es/uniq";
import { CharactersType, TextCharacters } from "../db/characters";

export default async function handle(subject: WK.VocabularySubject, subjectsById: Record<number, WK.Subject>): Promise<[SearchDocument, DB.VocabularySubject]> {
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

  const relatedKanjiIds = subject.data.component_subject_ids;
  const relatedRadicalIds = uniq(relatedKanjiIds.flatMap((kanjiId) => (subjectsById[kanjiId] as WK.KanjiSubject).data.component_subject_ids));
  const characters: TextCharacters = { type: CharactersType.TEXT, value: subject.data.characters };
  const searchResult = {
    id: subject.id,
    type: SearchResultType.VOCABULARY,
    level: subject.data.level,
    primarySearch: [primaryMeaning.meaning, primaryReading.reading],
    secondarySearch: [...otherMeanings, ...otherReadings],
    characters: characters,
    description: primaryMeaning.meaning,
    related: {
      radical: relatedRadicalIds,
      kanji: relatedKanjiIds,
      vocabulary: []
    }
  };

  const dbSubject: DB.VocabularySubject = {
    id: subject.id,
    type: DB.SubjectType.VOCABULARY,
    level: subject.data.level,
    characters: characters,
    primaryMeaning: primaryMeaning.meaning,
    meaningMnemonic: subject.data.meaning_mnemonic,
    primaryReading: primaryReading.reading,
    readingMnemonic: subject.data.reading_mnemonic,
    otherMeanings: subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning),
    otherReadings: otherReadings,
    wkSlug: subject.data.slug,
    related: {
      radicals: relatedRadicalIds,
      kanjis: relatedKanjiIds
    }
  };
  

  return [searchResult, dbSubject];
}
