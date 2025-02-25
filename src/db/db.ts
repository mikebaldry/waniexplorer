import SubjectMap from "virtual:subject_map";

import { SearchResult } from "./search_result";
export type { SearchResult } from "./search_result";
import MiniSearch from "minisearch";
import {
  KanjiSubject,
  RadicalSubject,
  Subject,
  VocabularySubject,
} from "./subjects";
import { unpack } from "msgpackr/unpack";

import searchDataUrl from "../assets/search.wasm?url";
import { searchOpts } from "./search_opts";
import parseQueryMiniSearch from "./query_parser";

export type View = {
  radicals: RadicalSubject[];
  kanjis: KanjiSubject[];
  vocabularies: VocabularySubject[];
};

export type RadicalView = {
  radical: RadicalSubject;
  relatedKanji: KanjiSubject[];
  relatedVocabulary: VocabularySubject[];
};

export type KanjiView = {
  relatedRadicals: RadicalSubject[];
  kanji: KanjiSubject;
  relatedVocabulary: VocabularySubject[];
};

export type VocabularyView = {
  relatedRadicals: RadicalSubject[];
  relatedKanji: KanjiSubject[];
  vocabulary: VocabularySubject;
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
    const radical = (await loadId(id)) as RadicalSubject;
    const kanjiPromises = radical.related.kanjis.map(loadId);
    const vocabularyPromises = radical.related.vocabularies.map(loadId);
    const [kanjis, vocabularies] = await Promise.all([
      Promise.all(kanjiPromises),
      Promise.all(vocabularyPromises),
    ]);

    return {
      radicals: [radical],
      kanjis: kanjis as KanjiSubject[],
      vocabularies: vocabularies as VocabularySubject[],
    };
  }

  public async kanjiView(id: number): Promise<View> {
    const kanji = (await loadId(id)) as KanjiSubject;
    const radicalPromises = kanji.related.radicals.map(loadId);
    const vocabularyPromises = kanji.related.vocabularies.map(loadId);
    const [radicals, vocabularies] = await Promise.all([
      Promise.all(radicalPromises),
      Promise.all(vocabularyPromises),
    ]);

    return {
      kanjis: [kanji],
      radicals: radicals as RadicalSubject[],
      vocabularies: vocabularies as VocabularySubject[],
    };
  }

  public async vocabularyView(id: number): Promise<View> {
    const vocabulary = (await loadId(id)) as VocabularySubject;
    const radicalPromises = vocabulary.related.radicals.map(loadId);
    const kanjiPromises = vocabulary.related.kanjis.map(loadId);
    const [radicals, kanjis] = await Promise.all([
      Promise.all(radicalPromises),
      Promise.all(kanjiPromises),
    ]);

    return {
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
  const response = await fetch(SubjectMap[id]);

  return await response.json();
}

const db = new Db();
export default db;
