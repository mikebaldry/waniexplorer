import getSubjectUrl from "virtual:subject_map";

import { SearchResult } from "./search_result";
export type { SearchResult } from "./search_result";
import MiniSearch from "minisearch";
import {
  KanjiSubject,
  RadicalSubject,
  Subject,
  SubjectType,
  VocabularySubject,
} from "./subjects";
import { unpack } from "msgpackr/unpack";

import searchDataUrl from "../assets/search.wasm?url";
import { searchOpts } from "./search_opts";
import parseQueryMiniSearch from "./query_parser";

export enum Ordering {
  RadicalKanjiVocabulary,
  VocabularyKanjiRadical,
}

export type View = {
  primarySubject: Subject;
  ordering: Ordering;
  radicals: RadicalSubject[];
  kanjis: KanjiSubject[];
  vocabularies: VocabularySubject[];
};

class Db {
  private _miniSearch: Promise<MiniSearch<SearchResult>>;

  constructor() {
    this._miniSearch = loadIndex();
  }

  public async search(textQuery: string): Promise<SearchResult[]> {
    const query = parseQueryMiniSearch(textQuery);

    const miniSearch = await this._miniSearch;
    const results = miniSearch
      .search(query, { prefix: true, combineWith: "AND" })
      .slice(0, 15);

    return results.map((result) => {
      return {
        id: result.id,
        type: result.type,
        level: result.level,
        characters: result.characters,
        description: result.description,
        related: result.related,
      } as SearchResult;
    });
  }

  public async radicalView(id: number): Promise<View> {
    const subject = await loadId(id);
    if (subject.type !== SubjectType.RADICAL) {
      throw `Subject ${id} is not a radical`;
    }
    const radical = subject as RadicalSubject;

    const kanjiPromises = radical.related.kanjis.map(loadId);
    const vocabularyPromises = radical.related.vocabularies.map(loadId);
    const [kanjis, vocabularies] = await Promise.all([
      Promise.all(kanjiPromises),
      Promise.all(vocabularyPromises),
    ]);

    return {
      primarySubject: subject,
      ordering: Ordering.RadicalKanjiVocabulary,
      radicals: [radical],
      kanjis: kanjis as KanjiSubject[],
      vocabularies: vocabularies as VocabularySubject[],
    };
  }

  public async kanjiView(id: number): Promise<View> {
    const subject = await loadId(id);
    if (subject.type !== SubjectType.KANJI) {
      throw `Subject ${id} is not a kanji`;
    }
    const kanji = subject as KanjiSubject;

    const radicalPromises = kanji.related.radicals.map(loadId);
    const vocabularyPromises = kanji.related.vocabularies.map(loadId);
    const [radicals, vocabularies] = await Promise.all([
      Promise.all(radicalPromises),
      Promise.all(vocabularyPromises),
    ]);

    return {
      primarySubject: subject,
      ordering: Ordering.RadicalKanjiVocabulary,
      kanjis: [kanji],
      radicals: radicals as RadicalSubject[],
      vocabularies: vocabularies as VocabularySubject[],
    };
  }

  public async vocabularyView(id: number): Promise<View> {
    const subject = await loadId(id);
    if (subject.type !== SubjectType.VOCABULARY) {
      throw `Subject ${id} is not a vocabulary`;
    }
    const vocabulary = subject as VocabularySubject;

    const radicalPromises = vocabulary.related.radicals.map(loadId);
    const kanjiPromises = vocabulary.related.kanjis.map(loadId);
    const [radicals, kanjis] = await Promise.all([
      Promise.all(radicalPromises),
      Promise.all(kanjiPromises),
    ]);

    return {
      primarySubject: subject,
      ordering: Ordering.VocabularyKanjiRadical,
      vocabularies: [vocabulary],
      radicals: radicals as RadicalSubject[],
      kanjis: kanjis as KanjiSubject[],
    };
  }
}

async function loadIndex(): Promise<MiniSearch<SearchResult>> {
  const response = await fetch(searchDataUrl);
  const buffer = new Uint8Array(await response.arrayBuffer());
  const searchData = unpack(buffer);

  return MiniSearch.loadJS<SearchResult>(searchData, searchOpts);
}

async function loadId(id: number): Promise<Subject> {
  const subjectUrl = getSubjectUrl(id);

  const response = await fetch(subjectUrl);

  return await response.json();
}

const db = new Db();
export default db;
