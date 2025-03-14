import { KanjiReading, KanjiSubject } from "../../db/subjects";
import CommaSeparatedList from "./CommaSeparatedList";
import ReadingMnemonic from "./ReadingMnemonic";

function ReadingItem({ item }: { item: KanjiReading }) {
  return <span className={item.primary ? "fw-bold" : ""}>{item.reading}</span>;
}

export default function KanjiContent({ kanji }: { kanji: KanjiSubject }) {
  const onyomi = kanji.readings.filter((r) => r.type == "onyomi");
  const kunyomi = kanji.readings.filter((r) => r.type == "kunyomi");
  const nanori = kanji.readings.filter((r) => r.type == "nanori");

  return (
    <>
      <li className="list-group-item">
        <div>
          <strong>Readings</strong>
        </div>
        {onyomi.length > 0 && (
          <div className="lh-2">
            <span className="badge text-bg-secondary badge-reading-type">
              Onyomi
            </span>
            <CommaSeparatedList items={onyomi} component={ReadingItem} />
          </div>
        )}

        {kunyomi.length > 0 && (
          <div className="lh-2">
            <span className="badge text-bg-secondary badge-reading-type">
              Kunyomi
            </span>
            <CommaSeparatedList items={kunyomi} component={ReadingItem} />
          </div>
        )}

        {nanori.length > 0 && (
          <div className="lh-2">
            <span className="badge text-bg-secondary badge-reading-type">
              Nanori
            </span>
            <CommaSeparatedList items={nanori} component={ReadingItem} />
          </div>
        )}
      </li>

      <ReadingMnemonic subject={kanji} />
    </>
  );
}
