import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from '@xyflow/react';
import { RadicalSubject, RadicalType } from "./services/db";
import { Fragment } from "react/jsx-runtime";
import Mnemonic from "./Mnemonic";

export type RadicalNode = Node<
  RadicalSubject,
  'radical'
>;
 

export default function RadicalNode(props: NodeProps<RadicalNode>) {
  return (
    <>
      <div className="card card-node card-node-radical">
        <div className="card-header text-center">
          {props.data.character.type === RadicalType.TEXT && props.data.character.value}
          {props.data.character.type === RadicalType.SVG && (<div className="radical-svg" dangerouslySetInnerHTML={ { __html: props.data.character.value } } />)}

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
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}