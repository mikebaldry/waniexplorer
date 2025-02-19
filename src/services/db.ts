// @ts-ignore: Including type support for ?arraybuffer breaks other things
import searchData from "../assets/search.avsc?arraybuffer";
import { avroType, SearchResult } from "../gen/search_result";
export type { SearchResult } from "../gen/search_result";
import { Buffer } from "buffer/";
import MiniSearch from "minisearch";

// @ts-ignore: Buffer polyfill doesn't match exactly, but works enough!
const documents = avroType.fromBuffer(Buffer.from(searchData)) as SearchResult[];

let miniSearch = new MiniSearch<SearchResult>({
  fields: ['primarySearch', 'secondarySearch'],
  storeFields: ['id', 'type', 'level', 'characters', 'description'], // fields to return with search results
  searchOptions: {
    boost: { primarySearch: 2 }
  }
})


miniSearch.addAll(documents)

export type KanjiResult = SearchResult & {
  character: string
  primaryReading: string
  primaryMeaning: string
  vocabularyIds: number[]
  radicalIds: number[]
}

export enum SubjectType {
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary"
}


export type BaseSubject = {
  id: number,
  type: SubjectType,
  wanikaniUrl: string
  primaryMeaning: string,
  otherMeanings: string[],
  meaningMnemonic: string,
}

type SubjectWithReading = {
  primaryReading: string,
  readingMnemonic: string,
}

export type KanjiReading = {
  reading: string,
  primary: boolean
  type: "kunyomi" | "nanori" | "onyomi"
}

export type RadicalSubject = BaseSubject & {
  type: SubjectType.RADICAL
  character: RadicalText | RadicalSvg
}

export enum RadicalType {
  TEXT = "text",
  SVG = "svg"
}

export type RadicalText = {
  type: RadicalType.TEXT,
  value: string
}

export type RadicalSvg = {
  type: RadicalType.SVG,
  value: string
}

export type KanjiSubject = BaseSubject & SubjectWithReading & {
  type: SubjectType.KANJI,
  character: string,
  readings: KanjiReading[],
  vocabularyIds: number[],
  radicalIds: number[]
}

export type VocabularyKanji = {
  id: number
  character: string
  readings: string[]
}

export type VocabularySubject = BaseSubject & SubjectWithReading & {
  type: SubjectType.VOCABULARY,
  characters: string,
  kanji: VocabularyKanji[],
  otherReadings: string[]
  elements: VocabularyElement[]
}

export enum VocabularyElementType {
  KANJI = "kanji",
  KANA = "kana"
}

export type BaseVocabularyElement = {
  type: VocabularyElementType
  value: string
}

export type KanjiVocabularyElement = BaseVocabularyElement & {
  type: VocabularyElementType.KANJI
  id: number
  value: string
  reading: string
  noma: boolean | undefined
}

export type KanaVocabularyElement = BaseVocabularyElement & {
  type: VocabularyElementType.KANA
}

export type VocabularyElement = KanjiVocabularyElement | KanaVocabularyElement;

class Db {
  public search(query: string): SearchResult[] {
    const results = miniSearch.search(query, { prefix: true, combineWith: "AND" }).slice(0, 15);

    return results.map((result) => {
      return {
        id: result.id,
        type: result.type,
        level: result.level,
        characters: result.characters,
        description: result.description
      } as SearchResult;
    })
  }

  public async kanji(id: number): Promise<KanjiSubject> {
    const kanji = await loadId(id);

    return kanji as KanjiSubject;
  }

  public async kanjiWithRelations(id: number): Promise<[KanjiSubject, RadicalSubject[], VocabularySubject[]]> {
    const kanji = await loadId(id);

    const radicalPromises = kanji.radicalIds.map(loadId);
    const vocabularyPromises = kanji.vocabularyIds.map(loadId);
    const [radicals, vocabularies] = await Promise.all([Promise.all(radicalPromises), Promise.all(vocabularyPromises)]);

    return [kanji as KanjiSubject, radicals as RadicalSubject[], vocabularies as VocabularySubject[]];
  }
}

async function loadId(id: number): Promise<any> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const response = await fetch(`${base}/data/${id}.json`); 

  const data = await response.json();

  return data;
}

const db = new Db();
export default db;