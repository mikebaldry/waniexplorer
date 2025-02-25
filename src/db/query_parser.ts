import compact from "lodash-es/compact";
import takeWhile from "lodash-es/takeWhile";
import { Query } from "minisearch";
import {
  isKatakana as wkIsKatakana,
  toKana,
  tokenize as wkTokenize,
} from "wanakana";

function parseQueryMiniSearch(input: string): Query {
  const ast = parseToAst(input);

  return {
    combineWith: "AND",
    queries: ast.map((element) => {
      if (Array.isArray(element)) {
        return {
          combineWith: "OR",
          queries: element,
        } as Query;
      }
      return element;
    }),
  } as Query;
}

export function parseQueryHuman(input: string): string {
  const ast = parseToAst(input);

  return ast
    .map((element) => {
      if (Array.isArray(element)) {
        return `(${element.join(" OR ")})`;
      }
      return element;
    })
    .join(" AND ");
}

export type Token = { type: string; value: string };

export function tokenize(input: string): Token[] {
  const wkTokens = wkTokenize(input, {
    compact: true,
    detailed: true,
  }) as Token[];
  const tokens: Token[] = [];

  const isKatakana = (t: Token | undefined) =>
    t?.type === "ja" && wkIsKatakana(t.value);

  for (const token of wkTokens) {
    const prevToken = tokens[tokens.length - 1];

    if (
      token.type === "other" &&
      token.value.startsWith("ー") &&
      isKatakana(prevToken)
    ) {
      const katakanaPart = takeWhile(token.value, (ch) => wkIsKatakana(ch));
      prevToken.value += katakanaPart;
      const rest = token.value.slice(katakanaPart.length);
      if (rest.length > 0) {
        tokens.push({
          ...token,
          value: token.value.slice(katakanaPart.length),
        });
      }
    } else if (isKatakana(prevToken) && isKatakana(token)) {
      prevToken.value += token.value;
    } else {
      tokens.push({ ...token });
    }
  }

  return tokens
    .map((t) => {
      return { ...t, value: t.value.trim() };
    })
    .filter((t) => t.type !== "other" && t.value.length > 0);
}

export function parseToAst(input: string) {
  const tokens = tokenize(input);

  return compact(
    tokens.flatMap((token) => {
      if (token.type === "en" && token.value.trim().length > 0) {
        const words = token.value
          .trim()
          .split(/\s+/)
          .map((word) => {
            const kana = toKana(word);
            const romajiTokens = tokenize(kana);
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
    }),
  );
}

export default parseQueryMiniSearch;
