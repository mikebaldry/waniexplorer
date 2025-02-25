import { readFileSync, writeFileSync } from "fs";

export type Subject =
  | RadicalSubject
  | KanjiSubject
  | VocabularySubject
  | KanaVocabularySubject;
export enum SubjectType {
  RADICAL = "radical",
  KANJI = "kanji",
  VOCABULARY = "vocabulary",
  KANA_VOCABULARY = "kana_vocabulary",
}

export type RadicalSubject = {
  id: number;
  object: SubjectType.RADICAL;
  data: BaseSubjectData & {
    characters: string | null;
    character_images: CharacterImage[];
    meanings: BasicMeaning[];
    meaning_mnemonic: string;
    amalgamation_subject_ids: number[];
  };
};

export type BasicMeaning = {
  meaning: string;
  primary: boolean;
};

export type AuxilaryMeaning = {
  meaning: string;
  type: string;
};

export type CharacterImage = {
  url: string;
  content_type: string;
};

export type BaseSubjectData = {
  level: number;
  document_url: string;
  slug: string;
};

export type KanjiSubject = {
  id: number;
  object: SubjectType.KANJI;
  data: BaseSubjectData & {
    characters: string;
    amalgamation_subject_ids: number[];
    component_subject_ids: number[];
    meanings: BasicMeaning[];
    auxiliary_meanings: AuxilaryMeaning[];
    readings: KanjiReading[];
    meaning_mnemonic: string;
    reading_mnemonic: string;
  };
};

export type Reading = {
  reading: string;
  primary: boolean;
};

export type KanjiReading = Reading & { type: "onyomi" | "kunyomi" | "nanori" };

export type VocabularySubject = {
  id: number;
  object: SubjectType.VOCABULARY;
  data: BaseSubjectData & {
    characters: string;
    meanings: BasicMeaning[];
    auxiliary_meanings: AuxilaryMeaning[];
    meaning_mnemonic: string;
    readings: Reading[];
    reading_mnemonic: string;
    component_subject_ids: number[];
    pronunciation_audios: PronunciationAudio[];
  };
};

export type PronunciationAudio = {
  url: string;
  content_type: string;
  metadata: {
    gender: string;
    pronunciation: string;
    voice_actor_name: string;
    voice_description: string;
  };
};

export type KanaVocabularySubject = {
  id: number;
  object: SubjectType.KANA_VOCABULARY;
  data: BaseSubjectData;
};

export async function loadSubjects(force: boolean): Promise<Subject[]> {
  const cachedSubjects = !force ? getCachedSubjects() : null;

  if (cachedSubjects) {
    console.info(`Using ${cachedSubjects.length} cached subjects`);

    return cachedSubjects;
  }

  const subjects = await getSubjects();

  writeFileSync("cached_subjects.json", JSON.stringify(subjects, null, 2));

  console.info(`Loaded ${subjects.length} subjects from WaniKani`);

  return subjects;
}

function getCachedSubjects() {
  try {
    const data = readFileSync("cached_subjects.json", "utf8");

    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function getSubjects(nextUrl?: string): Promise<Subject[]> {
  const url = nextUrl ?? "https://api.wanikani.com/v2/subjects";

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.WANIKANI_API_KEY}` },
  });

  if (!response.ok) {
    throw response;
  }

  const body = await response.json();

  const subjects = body.data as Subject[];

  if (body.pages.next_url) {
    const restSubjects = await getSubjects(body.pages.next_url);
    return [...subjects, ...restSubjects];
  }

  return subjects;
}

export async function loadSvg(id: number, url: string): Promise<string> {
  const resp = await fetch(url);

  if (resp.status !== 200) {
    throw `Failed to load SVG ${url}`;
  }

  let svg = await resp.text();

  const replacements = ["a", "b", "c", "d"];

  replacements.forEach((c) => {
    svg = svg.replaceAll(`.${c}`, `.radical-svg-cls-${c}-${id}`);
    svg = svg.replaceAll(`class="${c}"`, `class="radical-svg-cls-${c}-${id}"`);
    svg = svg.replaceAll(`id="${c}"`, `id="radical_svg_id_${c}_${id}"`);
    svg = svg.replaceAll(`url(#${c})`, `url(#radical_svg_id_${c}_${id})`);
  });

  return svg;
}
