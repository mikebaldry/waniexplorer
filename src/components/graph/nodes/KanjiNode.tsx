import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import { Fragment } from "react/jsx-runtime";
import Mnemonic from "../Mnemonic";
import { KanjiSubject } from "../../../db/subjects";

export type KanjiNode = Node<
  KanjiSubject,
  'kanji'
>;

export default function KanjiNode(props: NodeProps<KanjiNode>) {
  const kanji = props.data;

  const onyomi = kanji.readings.filter((r) => r.type == "onyomi");
  const kunyomi = kanji.readings.filter((r) => r.type == "kunyomi");
  const nanori = kanji.readings.filter((r) => r.type == "nanori");

  return (
    <>
      <div className="card card-node card-node-kanji">
        <div className="card-header text-center">
          {kanji.characters.value}
          <div className="card-header-sub">{kanji.primaryMeaning}</div>
        </div>

        <ul className="list-group list-group-flush">
          {kanji.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div><strong>Other meanings</strong></div>
              <div>
                {kanji.otherMeanings.map((m, i) => (
                  <Fragment key={m}>
                    <span>{m}</span>
                    {i !== kanji.otherMeanings.length - 1 && ", "}
                  </Fragment>
                ))}
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
                {onyomi.map((r,i ) => (
                  <Fragment key={r.reading}>
                    <span className={r.primary ? "fw-bold" : ""}>{r.reading}</span>
                    {i !== onyomi.length - 1 && ", "}
                  </Fragment>
                ))}
              </div>
            )}

            {kunyomi.length > 0 && (
              <div className="lh-2">
                <span className="badge text-bg-secondary badge-reading-type">Kunyomi</span>
                {kunyomi.map((r, i) => (
                  <Fragment key={r.reading}>
                    <span className={r.primary ? "fw-bold" : ""}>{r.reading}</span>
                    {i !== kunyomi.length - 1 && ", "}
                  </Fragment>
                ))}
              </div>
            )}

            {nanori.length > 0 && (
              <div className="lh-2">
                <span className="badge text-bg-secondary badge-reading-type">Nanori</span>
                {nanori.map((r, i) => (
                  <Fragment key={r.reading}>
                    <span className={r.primary ? "fw-bold" : ""}>{r.reading}</span>
                    {i !== nanori.length - 1 && ", "}
                  </Fragment>
                ))}
              </div>
            )}
          </li>

          <li className="list-group-item">
            <div><strong>Reading mnemonic</strong></div>
            <div><Mnemonic value={kanji.readingMnemonic} /></div>
          </li>
        </ul>
      </div>
      <Handle type="source" position={Position.Top} hidden={true} />
    </>
  );
}
