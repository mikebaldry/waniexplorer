import { writeFileSync, readFileSync } from "fs"; 
import fetch from "sync-fetch";

function getCachedSubjects() {
  try {
    const data = readFileSync("cached_subjects.json");

    return JSON.parse(data);
  } catch {
    return undefined;
  }
}

async function getSubjects(nextUrl) {
  const url = nextUrl ?? "https://api.wanikani.com/v2/subjects";

  console.log(`Getting ${url}...`);

  const response = await fetch(url, { headers: { "Authorization": `Bearer` }});
  const body = await response.json();

  const subjects = body.data;

  if (body.pages.next_url) {
    const restSubjects = await getSubjects(body.pages.next_url);
    return [...subjects, ...restSubjects];
  }

  return subjects;
}

let subjects = getCachedSubjects();

if (!subjects) {
  console.error("Unable to load cached subjects, pulling from WaniKani");

  subjects = await getSubjects();

  writeFileSync("cached_subjects.json", JSON.stringify(subjects));
}

console.log("Total subjects:", subjects.length);

const documents = [];


function isKanji(ch) {
  return (ch >= "一" && ch <= "龯") || (ch >= "㐀" && ch <= "䶿"); 
}

let exceptionCount = 0;
let vocabCount = 0;
let radicalCount = 0;

const rendakuPrefixes = {
  "か": ["が"],
  "き": ["ぎ"],
  "く": ["ぐ"],
  "け": ["げ"],
  "こ": ["ご"],
  "さ": ["ざ"],
  "し": ["じ"],
  "す": ["ず"],
  "せ": ["ぜ"],
  "そ": ["ぞ"],
  "た": ["だ"],
  "ち": ["ぢ", "じ"],
  "つ": ["づ", "ず"],
  "て": ["で"],
  "と": ["ど"],
  "ば": ["ぱ"],
  "は": ["ば","ぱ"],
  "ひ": ["び","ぴ"],
  "び": ["ぴ"],
  "ふ": ["ぶ","ぷ"],
  "ぶ": ["ぷ"],
  "へ": ["べ","ぺ"],
  "べ": ["ぺ"],
  "ほ": ["ぼ","ぽ"],
  "ぼ": ["ぽ"]
}

const otherReplacements = {
  "しゅつ": "しゅっ",
  "じゅう": "じゅっ",
  "いち": "いっ",
  "さつ": "さっ",
  "さく": "さっ",
  "あく": "あっ",
  "あき": "あっ",
  "もち": "もっ",
  "しつ": "しっ",
  "がく": "がっ",
  "せつ": "せっ",
  "とつ": "とっ",
  "ばつ": "ばっ",
  "ちつ": "ちっ",
  "ちょく": "ちょっ",
  "もん": "も",
  "りん": "り"
}

function findReading(id, kanji, remainingChars) {
  const regular = [...kanji.readings];
  regular.sort((a, b) => b.length - a.length);

  const rendakud = [];
  for (const reading of kanji.readings) {
    const rendakuChars = rendakuPrefixes[reading.charAt(0)] || [];

    for (const rendakuChar of rendakuChars) {
      rendakud.push(`${rendakuChar}${reading.slice(1)}`)
    }
  }
  rendakud.sort((a, b) => b.length - a.length);

  const other = [];
  for (const reading of kanji.readings) {
    for (const [find, replace] of Object.entries(otherReplacements)) {
      const updatedReading = reading.replace(find, replace);
      if (updatedReading !== reading) {
        other.push(updatedReading)
      }
    }
  }
  other.sort((a, b) => b.length - a.length);

  const possibilities = [...regular, ...rendakud, ...other];

  for (const reading of possibilities) {
    if (remainingChars.startsWith(reading)) {
      return reading
    }
  }

  // could probably look at remaining characteres and vocab word, remove any kana from the end of both, then make assumptions in a lot of cases..

  return null;
}

function resolveVocabulary(vocab) {
  let buffer = "";
  const elements = [];
  let remainingChars = vocab.primaryReading;
  const cleanCharacters = vocab.characters.replace("〜", "");
  let stopProcessingReadings = false;

  let prevKanji = null;

  for (let i = 0; i < cleanCharacters.length; i++) {
    const ch = cleanCharacters.charAt(i);

    if (isKanji(ch) || ch === '々') {
      if (buffer.length > 0) {
        elements.push({ type: "kana", value: buffer });
        buffer = "";
      }

      let foundKanji = vocab.kanji.find((k) => k.character == ch);
      if (ch === '々' && prevKanji) {
        foundKanji = { ...prevKanji, noma: true }
      }

      const foundReading = findReading(vocab.id, foundKanji, remainingChars);

      if (!stopProcessingReadings && !foundReading) {
        // there are exceptional cases, where a kanji is read a totally different way, maybe for now just shortcut, log to console and return only elements matched
        console.log("FOUND EXCEPTION:", vocab.id, vocab.characters, "READING:", vocab.primaryReading, "KANJI:", vocab.kanji);
        // resolveVocabulary2(vocab)
        exceptionCount++;
        stopProcessingReadings = true;
      }
      
      elements.push({ type: "kanji", value: ch, id: foundKanji.id, reading: foundReading })
      prevKanji = foundKanji
      if (!stopProcessingReadings) {
        remainingChars = remainingChars.slice(foundReading.length);
      }
    } else { // assume kana
      buffer += ch;
      remainingChars = remainingChars.slice(1);
    }
  }

  if (buffer.length > 0) {
    elements.push({ type: "kana", value: buffer });
    buffer = "";
  }

  return elements;
}

subjects.forEach((subject) => {
  if (subject.object === "kanji") {
    const primaryMeaning = subject.data.meanings.find((m) => m.primary).meaning 
    const otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning)
    const primaryReading = subject.data.readings.find((m) => m.primary).reading 
    const otherReadings = subject.data.readings.filter((m) => !m.primary).map((m) => m.reading)
    
    const result = {
      id: subject.id,
      character: subject.data.characters,
      primaryMeaning: primaryMeaning,
      otherMeanings: otherMeanings,
      primaryReading: primaryReading,
      otherReadings: otherReadings,
      vocabularyIds: subject.data.amalgamation_subject_ids,
      radicalIds: subject.data.component_subject_ids
    };

    documents.push(result)

    const doc = {
      id: subject.id,
      type: "kanji",
      character: subject.data.characters,
      primaryMeaning: primaryMeaning,
      otherMeanings: otherMeanings,
      primaryReading: primaryReading,
      readings: subject.data.readings.map((r) => {
        return { 
          reading: r.reading,
          primary: r.primary,
          type: r.type
        };
      }),
      readingMnemonic: subject.data.reading_mnemonic,
      meaningMnemonic: subject.data.meaning_mnemonic,
      vocabularyIds: subject.data.amalgamation_subject_ids,
      radicalIds: subject.data.component_subject_ids,
      wanikaniUrl: subject.data.document_url
    }

    writeFileSync(`public/data/${subject.id}.json`, JSON.stringify(doc, null, 2));
  } else if (subject.object === "vocabulary") {
    const primaryMeaning = subject.data.meanings.find((m) => m.primary).meaning 
    const otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning)
    const primaryReading = subject.data.readings.find((m) => m.primary).reading 
    const otherReadings = subject.data.readings.filter((m) => !m.primary).map((m) => m.reading)

    // 

    let doc = {
      id: subject.id,
      type: "vocabulary",
      characters: subject.data.characters,
      primaryMeaning: primaryMeaning,
      otherMeanings: otherMeanings,
      primaryReading: primaryReading,
      otherReadings: otherReadings,
      kanji: subject.data.component_subject_ids.map((id) => {
        const k = subjects.find((s) => s.id === id ).data;
        return { id, character: k.characters, readings: k.readings.map((r) => r.reading) }
      }),
      meaningMnemonic: subject.data.meaning_mnemonic,
      readingMnemonic: subject.data.reading_mnemonic,
      wanikaniUrl: subject.data.document_url
    }

    doc.elements = resolveVocabulary(doc);

    writeFileSync(`public/data/${subject.id}.json`, JSON.stringify(doc, null, 2));
    vocabCount++;
  } else if (subject.object === "radical") {
    const primaryMeaning = subject.data.meanings.find((m) => m.primary).meaning 
    const otherMeanings = subject.data.meanings.filter((m) => !m.primary).map((m) => m.meaning)
    const mainImage = subject.data.character_images.find((i) => i.content_type == "image/svg+xml");

    let character;
    if (subject.data.characters && subject.data.characters.length > 0) {
      character = { type: "text", value: subject.data.characters }
    } else if (mainImage) {
      const resp = fetch(mainImage.url);
      if (resp.status !== 200) {
        debugger;
        console.error("failed to get image");
      } else {
        let svg = resp.text();

        const replacements = ['a', 'b', 'c', 'd'];

        replacements.forEach((c) => {
          svg = svg.replaceAll(`.${c}`, `.radical-svg-cls-${c}-${subject.id}`)
          svg = svg.replaceAll(`class="${c}"`, `class="radical-svg-cls-${c}-${subject.id}"`)
          svg = svg.replaceAll(`id="${c}"`, `id="radical_svg_id_${c}_${subject.id}"`)
          svg = svg.replaceAll(`url(#${c})`, `url(#radical_svg_id_${c}_${subject.id})`)
        });

        character = { type: "svg", value: svg }
      }
    } else {
      console.error("couldn't work out character");
    }


    let doc = {
      id: subject.id,
      type: "radical",
      primaryMeaning: primaryMeaning,
      otherMeanings: otherMeanings,
      character,
      meaningMnemonic: subject.data.meaning_mnemonic,
      wanikaniUrl: subject.data.document_url
    }

    writeFileSync(`public/data/${subject.id}.json`, JSON.stringify(doc, null, 2));
    radicalCount++;
  }
  
});

console.log("Total kanji:", documents.length);
console.log("Total radicals:", radicalCount);
console.log("Total vocabulary:", vocabCount);
console.log("Exception count:", exceptionCount);

writeFileSync("public/data/kanji.json", JSON.stringify(documents, null, 2));
