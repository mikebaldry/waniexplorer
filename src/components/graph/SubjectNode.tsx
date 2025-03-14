import { Subject } from "../../db/subjects";
import Urls from "./Urls";
import Heading from "./Heading";
import { useCallback, useRef } from "react";
import clsx from "clsx";
import CommaSeparatedList, { SpanItem } from "./CommaSeparatedList";
import Mnemonic from "./Mnemonic";
import RadicalContent from "./RadicalContent";
import VocabularyContent from "./VocabularyContent";
import KanjiContent from "./KanjiContent";
import { Tools } from "./types";

export default function Node({ subject, tools }: { subject: Subject, tools: Tools }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleHeadingClick = useCallback(() => {
    tools.zoomTo(subject, true, true);
  }, [tools, subject]);

  return (
    <div ref={ref} className={clsx("card", "card-node", `card-node-${subject.type}`)} data-id={subject.id}>
      <Heading subject={subject} onFocus={handleHeadingClick} />

      <ul className="list-group list-group-flush">
        {subject.otherMeanings.length > 0 && (
          <li className="list-group-item">
            <div>
              <strong>Other meanings</strong>
            </div>
            <div>
              <CommaSeparatedList
                items={subject.otherMeanings}
                component={SpanItem}
              />
            </div>
          </li>
        )}

        <li className="list-group-item">
          <div>
            <strong>Meaning mnemonic</strong>
          </div>
          <div>
            <Mnemonic value={subject.meaningMnemonic} />
          </div>
        </li>

        {subject.type == "radical" && <RadicalContent radical={subject} />}
        {subject.type == "kanji" && <KanjiContent kanji={subject} />}
        {subject.type == "vocabulary" && <VocabularyContent vocabulary={subject} />}

        <Urls subject={subject} />
      </ul>
    </div>
  );
}
