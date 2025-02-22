import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import { Fragment } from "react/jsx-runtime";
import Mnemonic from "../Mnemonic";
import { VocabularySubject } from "../../../db/subjects";

export type VocabularyNode = Node<
  VocabularySubject,
  'vocabulary'
>;
 

export default function VocabularyNode(props: NodeProps<VocabularyNode>) {
  const vocabulary = props.data;

  return (
    <>
      <div className="card card-node card-node-vocabulary">
        <div className="card-header text-center">
          {vocabulary.characters.value}
          <div className="card-header-sub">{vocabulary.primaryMeaning}</div>
        </div>

        <ul className="list-group list-group-flush">
          {vocabulary.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div><strong>Other meanings</strong></div>
              <div>
                {vocabulary.otherMeanings.map((m, i) => (
                  <Fragment key={m}>
                    <span>{m}</span>
                    {i !== vocabulary.otherMeanings.length - 1 && ", "}
                  </Fragment>
                ))}
              </div>
            </li>
          )}

          <li className="list-group-item">
            <div><strong>Meaning mnemonic</strong></div>
            <div><Mnemonic value={vocabulary.meaningMnemonic} /></div>
          </li>

          <li className="list-group-item">
            <div><strong>Readings</strong></div>
            <div className="lh-2">
              {vocabulary.primaryReading}
              {vocabulary.otherReadings.map((r) => (
                <Fragment key={r}>
                  , <span>{r}</span>
                </Fragment>
              ))}
            </div>
          </li>

          <li className="list-group-item">
            <div><strong>Reading mnemonic</strong></div>
            <div><Mnemonic value={vocabulary.readingMnemonic} /></div>
          </li>
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}