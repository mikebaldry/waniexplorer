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
  storeFields: ['id', 'type', 'level', 'characters', 'description', 'related'], // fields to return with search results
  searchOptions: {
    boost: { primarySearch: 2 }
  }
})

miniSearch.addAll(documents)

export type KanjiView = {
  kanji: KanjiSubject,
  relatedRadicals: RadicalSubject[],
  relatedVocabulary: VocabularySubject[]
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

  public async kanjiView(id: number): Promise<KanjiView> {
    const kanji = await loadId(id) as KanjiSubject;
    const radicalPromises = kanji.related.radicals.map(loadId);
    const vocabularyPromises = kanji.related.vocabularies.map(loadId);
    const [radicals, vocabularies] = await Promise.all([Promise.all(radicalPromises), Promise.all(vocabularyPromises)]);
  
    return {
      kanji, 
      relatedRadicals: radicals as RadicalSubject[],
      relatedVocabulary: vocabularies as VocabularySubject[]
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