import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import Mnemonic from "../Mnemonic";
import { KanjiReading, KanjiSubject } from "../../../db/subjects";
import Urls from "./Urls";
import CommaSeparatedList, { SpanItem } from "./CommaSeparatedList";
import Heading from "./Heading";

export type KanjiNode = Node<
  KanjiSubject,
  'kanji'
>;

function ReadingItem({ item }: { item: KanjiReading }) {
  return <span className={item.primary ? "fw-bold" : ""}>{item.reading}</span>;
}

export default function KanjiNode(props: NodeProps<KanjiNode>) {
  const kanji = props.data;

  const onyomi = kanji.readings.filter((r) => r.type == "onyomi");
  const kunyomi = kanji.readings.filter((r) => r.type == "kunyomi");
  const nanori = kanji.readings.filter((r) => r.type == "nanori");

  return (
    <>
      <div className="card card-node card-node-kanji">
        <Heading subject={kanji} />

        <ul className="list-group list-group-flush">

          {kanji.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div><strong>Other meanings</strong></div>
              <div>
                <CommaSeparatedList items={kanji.otherMeanings} component={SpanItem} />
              </div>
            </li>
          )}

          <li className="list-group-item">
            <div><strong>Meaning mnemonic</strong></div>
            <div><Mnemonic value={kanji.meaningMnemonic} /></div>
          </li>

          <li className="list-group-item">
            <div><strong>Readings</strong></div>
            {onyomi.length > 0 && (
              <div className="lh-2">
                <span className="badge text-bg-secondary badge-reading-type">Onyomi</span>
                <CommaSeparatedList items={onyomi} component={ReadingItem} />
              </div>
            )}

            {kunyomi.length > 0 && (
              <div className="lh-2">
                <span className="badge text-bg-secondary badge-reading-type">Kunyomi</span>
                <CommaSeparatedList items={kunyomi} component={ReadingItem} />
              </div>
            )}

            {nanori.length > 0 && (
              <div className="lh-2">
                <span className="badge text-bg-secondary badge-reading-type">Nanori</span>
                <CommaSeparatedList items={nanori} component={ReadingItem} />
              </div>
            )}
          </li>

          <li className="list-group-item">
            <div><strong>Reading mnemonic</strong></div>
            <div><Mnemonic value={kanji.readingMnemonic} /></div>
          </li>

          <Urls subject={kanji} />
        </ul>
      </div>
      <Handle type="source" position={Position.Top} hidden={true} />
    </>
  );
}
