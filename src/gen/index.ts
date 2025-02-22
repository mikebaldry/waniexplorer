import { avroType, SearchResult } from "../db/search_result";
import * as WK from "./wanikani_subjects";
import * as DB from "../db/subjects";
import handleRadical from "./radicals";
import handleKanji from "./kanji";
import handleVocabulary from "./vocabulary";


import { writeFileSync } from "fs";
import compact from "lodash-es/compact";

export default async function generate(force: boolean) {
  const subjects = await WK.loadSubjects(force);

  const subjctsById = subjects.reduce((acc, subject: WK.Subject) => {
    acc[subject.id] = subject;
    return acc;
  }, {} as Record<number, WK.Subject>);

  const results: ([SearchResult, DB.Subject])[] = compact(await Promise.all(subjects.map(async (subject) => {
    switch (subject.object) {
      case WK.SubjectType.RADICAL:
        return await handleRadical(subject, subjctsById);
      case WK.SubjectType.KANJI:
        return await handleKanji(subject);
      case WK.SubjectType.VOCABULARY:
        return await handleVocabulary(subject, subjctsById);
    }
  })));

  const searchResults = results.map((r) => r[0]);
  const dbSubjects = results.map((r) => r[1]);

  writeFileSync("src/assets/search.avsc", avroType.toBuffer(searchResults));

  dbSubjects.forEach((dbSubject) => {
    writeFileSync(`public/data/${dbSubject.id}.json`, JSON.stringify(dbSubject, null, 2));
  });
}
