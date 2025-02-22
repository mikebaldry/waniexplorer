import * as WK from "./wanikani_subjects";
import * as DB from "../db/subjects";
import { SearchDocument, SearchResultType } from "../db/search_result";
import uniq from "lodash-es/uniq";
import { CharactersType } from "../db/characters";

export default async function handle(subject: WK.RadicalSubject, subjectsById: Record<number, WK.Subject>): Promise<[SearchDocument, DB.RadicalSubject]> {
  const primaryMeaning = subject.data.meanings.find((m) => m.primary);
  const otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning);

  if (!primaryMeaning) {
    throw `No primary meaning for ${subject.id}`;
  }

  let characters = { type: CharactersType.TEXT, value: subject.data.characters! };
  if (!characters.value) {
    const svgImage = subject.data.character_images.find((i) => i.content_type == "image/svg+xml");

    if (!svgImage) {
      throw `No svg for radical without characters for ${subject.id}`;
    }

    const svgData = await WK.loadSvg(subject.id, svgImage.url);
    characters = { type: CharactersType.SVG, value: svgData }
  }

  const relatedKanjiIds = subject.data.amalgamation_subject_ids;
  const relatedVocabularyIds = uniq(relatedKanjiIds.flatMap((kanjiId) => (subjectsById[kanjiId] as WK.KanjiSubject).data.amalgamation_subject_ids));

  const searchResult = {
    id: subject.id,
    type: SearchResultType.RADICAL,
    level: subject.data.level,
    primarySearch: [primaryMeaning.meaning],
    secondarySearch: [],
    characters: characters,
    description: primaryMeaning.meaning,
    related: {
      radical: [],
      kanji: relatedKanjiIds,
      vocabulary: relatedVocabularyIds
    }
  };

  const dbSubject: DB.RadicalSubject = {
    id: subject.id,
    type: DB.SubjectType.RADICAL,
    level: subject.data.level,
    characters: characters,
    primaryMeaning: primaryMeaning.meaning,
    otherMeanings: otherMeanings,
    meaningMnemonic: subject.data.meaning_mnemonic,
    urls: {
      wanikani: subject.data.document_url
    }
  };

  return [searchResult, dbSubject];
}