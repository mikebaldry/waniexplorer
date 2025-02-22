import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import { Fragment } from "react/jsx-runtime";
import Mnemonic from "../Mnemonic";
import { RadicalSubject } from "../../../db/subjects";
import { CharactersType } from "../../../db/characters";

export type RadicalNode = Node<
  RadicalSubject,
  'radical'
>;
 

export default function RadicalNode(props: NodeProps<RadicalNode>) {
  const radical = props.data;

  return (
    <>
      <div className="card card-node card-node-radical">
        <div className="card-header text-center">
          {radical.characters.type === CharactersType.TEXT && radical.characters.value}
          {radical.characters.type === CharactersType.SVG && (<div className="radical-svg" dangerouslySetInnerHTML={ { __html: radical.characters.value } } />)}

          <div className="card-header-sub">{radical.primaryMeaning}</div>
        </div>

        <ul className="list-group list-group-flush">
          {radical.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div><strong>Other meanings</strong></div>
              <div>
                {radical.otherMeanings.map((m, i) => (
                  <Fragment key={m}>
                    <span>{m}</span>
                    {i !== radical.otherMeanings.length - 1 && ", "}
                  </Fragment>
                ))}
              </div>
            </li>
          )}

          <li className="list-group-item">
            <div><strong>Meaning mnemonic</strong></div>
            <div><Mnemonic value={radical.meaningMnemonic} /></div>
          </li>
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}