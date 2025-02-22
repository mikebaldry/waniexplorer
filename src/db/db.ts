// @ts-ignore: Including type support for ?arraybuffer breaks other things
import searchData from "../assets/search.avsc?arraybuffer";
import { avroType, SearchResult } from "./search_result";
export type { SearchResult } from "./search_result";
import { Buffer } from "buffer/";
import { compact } from "lodash-es";
import MiniSearch, { Query } from "minisearch";
import { toKana, tokenize } from "wanakana";
import { KanjiSubject, RadicalSubject, Subject, VocabularySubject } from "./subjects";

// @ts-ignore: Buffer polyfill doesn't match exactly, but works enough!
const documents = avroType.fromBuffer(Buffer.from(searchData)) as SearchResult[];

const miniSearch = new MiniSearch<SearchResult>({
  fields: ['primarySearch', 'secondarySearch'],
  storeFields: ['id', 'type', 'level', 'characters', 'description', 'related'], 
  searchOptions: {
    boost: { primarySearch: 2 }
  }
})

miniSearch.addAll(documents)

export type View = {
  radicals: RadicalSubject[],
  kanjis: KanjiSubject[],
  vocabularies: VocabularySubject[]
};


export type RadicalView = {
  radical: RadicalSubject,
  relatedKanji: KanjiSubject[],
  relatedVocabulary: VocabularySubject[]
};

export type KanjiView = {
  relatedRadicals: RadicalSubject[],
  kanji: KanjiSubject,
  relatedVocabulary: VocabularySubject[]
};

export type VocabularyView = {
  relatedRadicals: RadicalSubject[],
  relatedKanji: KanjiSubject[]
  vocabulary: VocabularySubject,
};

class Db {
  public search(query: string): SearchResult[] {
    const [queryExpression, queryString] = this.buildSearchQuery(query)

    console.debug("query", queryExpression, queryString);

    const results = miniSearch.search(queryExpression, { prefix: true, combineWith: "AND" }).slice(0, 15);

    return results.map((result) => {
      return {
        id: result.id,
        type: result.type,
        level: result.level,
        characters: result.characters,
        description: result.description,
        related: result.related
      } as SearchResult;
    });
  }

  public async radicalView(id: number): Promise<View> {
    const radical = await loadId(id) as RadicalSubject;
    const kanjiPromises = radical.related.kanjis.map(loadId);
    const vocabularyPromises = radical.related.vocabularies.map(loadId);
    const [kanjis, vocabularies] = await Promise.all([Promise.all(kanjiPromises), Promise.all(vocabularyPromises)]);
  
    return {
      radicals: [radical], 
      kanjis: kanjis as KanjiSubject[],
      vocabularies: vocabularies as VocabularySubject[]
    };
  }

  public async kanjiView(id: number): Promise<View> {
    const kanji = await loadId(id) as KanjiSubject;
    const radicalPromises = kanji.related.radicals.map(loadId);
    const vocabularyPromises = kanji.related.vocabularies.map(loadId);
    const [radicals, vocabularies] = await Promise.all([Promise.all(radicalPromises), Promise.all(vocabularyPromises)]);
  
    return {
      kanjis: [kanji], 
      radicals: radicals as RadicalSubject[],
      vocabularies: vocabularies as VocabularySubject[]
    };
  }

  public async vocabularyView(id: number): Promise<View> {
    const vocabulary = await loadId(id) as VocabularySubject;
    const radicalPromises = vocabulary.related.radicals.map(loadId);
    const kanjiPromises = vocabulary.related.kanjis.map(loadId);
    const [radicals, kanjis] = await Promise.all([Promise.all(radicalPromises), Promise.all(kanjiPromises)]);
  
    return {
      vocabularies: [vocabulary], 
      radicals: radicals as RadicalSubject[],
      kanjis: kanjis as KanjiSubject[]
    };
  }

  private buildSearchQuery(input: string): [Query, string] {
    const words = 
      compact((tokenize(input, { compact: true, detailed: true }) as { type: string, value: string }[])
        .flatMap((token) => {
          if (token.type === "en" && token.value.trim().length > 0) {
            const words = 
              token.value.trim().split(/\s+/)
                .map((word) => {
                  const kana = toKana(word);
                  const romajiTokens = tokenize(kana, { compact: true, detailed: true }) as { type: string, value: string }[];
                  const allTranslatable = romajiTokens.every((t) => t.type === "ja");

                  if (allTranslatable) {
                    return [word, romajiTokens.map((t) => t.value).join("")];
                  } else {
                    return word;
                  }
                });
  
            return compact(words);
          } else if (token.type === "ja") {
            return [token.value.trim()];
          }
        }));
        
    // ... ? four  red くるま kuruma. electric

    const userString = words.map((word) => {
      if (Array.isArray(word)) {
        return `(${word.join(' OR ')})`;
      }
      return word;
    }).join(' AND ');

    const query = { combineWith: 'AND', queries: words.map((word) => {
      if (Array.isArray(word)) {
        return {
          combineWith: 'OR',
          queries: word
        } as Query;
      }
      return word;
    })} as Query;
    

    return [query, userString]
  }
}

async function loadId(id: number): Promise<Subject> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const response = await fetch(`${base}/data/${id}.json`); 

  return await response.json();
}

const db = new Db();
export default db;