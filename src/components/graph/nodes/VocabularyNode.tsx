import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import Mnemonic from "../Mnemonic";
import { VocabularySubject } from "../../../db/subjects";
import Urls from "./Urls";
import CommaSeparatedList, { SpanItem } from "./CommaSeparatedList";
import Heading from "./Heading";

export type VocabularyNode = Node<
  VocabularySubject,
  'vocabulary'
>;
 

export default function VocabularyNode(props: NodeProps<VocabularyNode>) {
  const vocabulary = props.data;

  return (
    <>
      <div className="card card-node card-node-vocabulary">
        <Heading subject={vocabulary} />

        <ul className="list-group list-group-flush">

          {vocabulary.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div><strong>Other meanings</strong></div>
              <div>
                <CommaSeparatedList items={vocabulary.otherMeanings} component={SpanItem} />
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
              <CommaSeparatedList items={vocabulary.otherReadings} component={SpanItem} />
            </div>
          </li>

          <li className="list-group-item">
            <div><strong>Reading mnemonic</strong></div>
            <div><Mnemonic value={vocabulary.readingMnemonic} /></div>
          </li>

          <Urls subject={vocabulary} />
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}