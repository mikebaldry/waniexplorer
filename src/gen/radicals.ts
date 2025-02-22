import * as WK from "./wanikani_subjects";
import * as DB from "./subjects";
import { SearchDocument, SearchResultCharactersType, SearchResultType } from "./search_result";
import uniq from "lodash-es/uniq";

export default async function handle(subject: WK.RadicalSubject, subjectsById: Record<number, WK.Subject>): Promise<[SearchDocument, DB.RadicalSubject]> {
  const primaryMeaning = subject.data.meanings.find((m) => m.primary);

  if (!primaryMeaning) {
    throw `No primary meaning for ${subject.id}`;
  }

  let characters = { type: SearchResultCharactersType.TEXT, value: subject.data.characters! };
  if (!characters.value) {
    const svgImage = subject.data.character_images.find((i) => i.content_type == "image/svg+xml");

    if (!svgImage) {
      throw `No svg for radical without characters for ${subject.id}`;
    }

    const svgData = await WK.loadSvg(subject.id, svgImage.url);
    characters = { type: SearchResultCharactersType.SVG, value: svgData }
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

  const dbSubject = {
    id: subject.id,
    type: DB.SubjectType.RADICAL
  } as DB.RadicalSubject;

  return [searchResult, dbSubject];
}