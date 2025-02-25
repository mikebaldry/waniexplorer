import { expect, test } from "vitest"
import { parseToAst, tokenize } from "./query_parser"

function expectAst(query: string, ast: any[]) {
  expect(parseToAst(query)).toStrictEqual(ast)
}

test("english", () => {
  expectAst("hello", ["hello"])
  expectAst("Hello", ["Hello"])
  expectAst("this. is - definitely  test ~ ", ["this", "is", "definitely", "test"])
})

test("hiragana", () => {
  expectAst(" がいこくじん。 「にほんじん」かのじょたち !", ["がいこくじん", "にほんじん", "かのじょたち"])
})

test("katakana", () => {
  expectAst(" ファックス。 「エスカレーター」ワイシャツ $", ["ファックス", "エスカレーター", "ワイシャツ"])
})

test("kanji", () => {
  expectAst("  条 ", ["条"])
})

test("vocabulary", () => {
  expectAst("  必須条件 じゃが芋", ["必須条件", "じゃが芋"])
})

test("romaji", () => {
  expectAst("row", ["row"]) // it doesn't allow kana alternative if it's not fully valid 
  expectAst("red jagaimo. something", ["red", ["jagaimo", "じゃがいも"], "something"])
  expectAst("red JAGAIMO. something", ["red", ["JAGAIMO", "ジャガイモ"], "something"])
})

test("tokenize", () => {
  expect(tokenize("this.is 123 some english! Also がいこくじん。「にほんじん」かのじょたち ! and スーパー with some  ファックス。 「エスカレーター」ワイシャツ $ lets not forget 必須条件 and --- a bit of じゃが芋")).toStrictEqual(
    [
      { type: "en", value: "this" },
      { type: "en", value: "is" },
      { type: "en", value: "some english" },
      { type: "en", value: "Also" },
      { type: "ja", value: "がいこくじん" },
      { type: "ja", value: "にほんじん" },
      { type: "ja", value: "かのじょたち" },
      { type: "en", value: "and" },
      { type: "ja", value: "スーパー" },
      { type: "en", value: "with some" },
      { type: "ja", value: "ファックス" },
      { type: "ja", value: "エスカレーター" },
      { type: "ja", value: "ワイシャツ" },
      { type: "en", value: "lets not forget" },
      { type: "ja", value: "必須条件" },
      { type: "en", value: "and" },
      { type: "en", value: "a bit of" },
      { type: "ja", value: "じゃが芋" }
    ]
  )
})