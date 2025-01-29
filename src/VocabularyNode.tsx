import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import { VocabularySubject } from "./services/db";
import { Fragment } from "react/jsx-runtime";
import Mnemonic from "./Mnemonic";

export type VocabularyNode = Node<
  VocabularySubject,
  'vocabulary'
>;
 

export default function VocabularyNode(props: NodeProps<VocabularyNode>) {  
  return (
    <>
      <div className="card card-node card-node-vocabulary">
        <div className="card-header text-center">
          {props.data.characters}
          <div className="card-header-sub">{props.data.primaryMeaning}</div>
        </div>

        <ul className="list-group list-group-flush">
          {props.data.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div><strong>Other meanings</strong></div>
              <div>
                {props.data.otherMeanings.map((m, i) => (
                  <Fragment key={m}>
                    <span>{m}</span>
                    {i !== props.data.otherMeanings.length - 1 && ", "}
                  </Fragment>
                ))}
              </div>
            </li>
          )}

          <li className="list-group-item">
            <div><strong>Meaning mnemonic</strong></div>
            <div><Mnemonic value={props.data.meaningMnemonic} /></div>
          </li>

          <li className="list-group-item">
            <div><strong>Readings</strong></div>
            <div className="lh-2">
              {props.data.primaryReading}
              {props.data.otherReadings.map((r) => (
                <Fragment key={r}>
                  , <span>{r}</span>
                </Fragment>
              ))}
            </div>
          </li>

          <li className="list-group-item">
            <div><strong>Reading mnemonic</strong></div>
            <div><Mnemonic value={props.data.readingMnemonic} /></div>
          </li>
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}