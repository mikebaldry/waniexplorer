import { avroType, SearchDocument, SearchResultCharactersType, SearchResultType } from "./search_result";
import { KanjiSubject, loadSubjects, RadicalSubject, SubjectType, VocabularySubject } from "./subjects";
import { writeFileSync } from "fs";
import compact from "lodash-es/compact";

export default async function generate(force: boolean) {
  const subjects = await loadSubjects(force);

  const searchResults = compact(await Promise.all(subjects.map(async (subject) => {
    switch (subject.object) {
      case SubjectType.RADICAL:
        return await handleRadical(subject);
      case SubjectType.KANJI:
        return await handleKanji(subject);
      case SubjectType.VOCABULARY:
        return await handleVocabulary(subject);
    }
  })));

  writeFileSync("src/assets/search.avsc", avroType.toBuffer(searchResults));
}

async function handleRadical(subject: RadicalSubject): Promise<SearchDocument> {
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

    const svgData = await loadSvg(subject.id, svgImage.url);
    characters = { type: SearchResultCharactersType.SVG, value: svgData }
  }

  return {
    id: subject.id,
    type: SearchResultType.RADICAL,
    level: subject.data.level,
    primarySearch: [primaryMeaning.meaning],
    secondarySearch: [],
    characters: characters,
    description: `${primaryMeaning.meaning} (found in ${subject.data.amalgamation_subject_ids.length} kanji)`,
  };
}

async function handleKanji(subject: KanjiSubject): Promise<SearchDocument> {
  const primaryMeaning = subject.data.meanings.find((m) => m.primary);
  const primaryReading = subject.data.readings.find((r) => r.primary);

  if (!primaryMeaning) {
    throw `No primary meaning for ${subject.id}`;
  }

  if (!primaryReading) {
    throw `No primary reading for ${subject.id}`;
  }

  let otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning);
  otherMeanings = [...otherMeanings, ...subject.data.auxiliary_meanings.filter((am) => am.type == "whitelist").map((am) => am.meaning)];

  let otherReadings = subject.data.readings.filter((r) => !r.primary).map((r) => r.reading);

  return {
    id: subject.id,
    type: SearchResultType.KANJI,
    level: subject.data.level,
    primarySearch: [primaryMeaning.meaning, primaryReading.reading, subject.data.characters],
    secondarySearch: [...otherMeanings, ...otherReadings],
    characters: { type: SearchResultCharactersType.TEXT, value: subject.data.characters },
    description: `${primaryMeaning.meaning} (found in ${subject.data.amalgamation_subject_ids.length} vocabulary)`,
  };
}

async function handleVocabulary(subject: VocabularySubject): Promise<SearchDocument> {
  const primaryMeaning = subject.data.meanings.find((m) => m.primary);
  const primaryReading = subject.data.readings.find((r) => r.primary);

  if (!primaryMeaning) {
    throw `No primary meaning for ${subject.id}`;
  }

  if (!primaryReading) {
    throw `No primary reading for ${subject.id}`;
  }

  let otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning);
  otherMeanings = [...otherMeanings, ...subject.data.auxiliary_meanings.filter((am) => am.type == "whitelist").map((am) => am.meaning)];

  let otherReadings = subject.data.readings.filter((r) => !r.primary).map((r) => r.reading);

  return {
    id: subject.id,
    type: SearchResultType.VOCABULARY,
    level: subject.data.level,
    primarySearch: [primaryMeaning.meaning, primaryReading.reading],
    secondarySearch: [...otherMeanings, ...otherReadings],
    characters: { type: SearchResultCharactersType.TEXT, value: subject.data.characters },
    description: primaryMeaning.meaning,
  };
}

async function loadSvg(id: number, url: string): Promise<string> {
  const resp = await fetch(url);

  if (resp.status !== 200) {
    throw `Failed to load SVG ${url}`;
  }

  let svg = await resp.text();

  const replacements = ['a', 'b', 'c', 'd'];

  replacements.forEach((c) => {
    svg = svg.replaceAll(`.${c}`, `.radical-svg-cls-${c}-${id}`)
    svg = svg.replaceAll(`class="${c}"`, `class="radical-svg-cls-${c}-${id}"`)
    svg = svg.replaceAll(`id="${c}"`, `id="radical_svg_id_${c}_${id}"`)
    svg = svg.replaceAll(`url(#${c})`, `url(#radical_svg_id_${c}_${id})`)
  });

  return svg;
}