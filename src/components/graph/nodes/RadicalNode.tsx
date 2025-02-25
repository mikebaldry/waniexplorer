import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import Mnemonic from "../Mnemonic";
import { RadicalSubject } from "../../../db/subjects";
import Urls from "./Urls";
import CommaSeparatedList, { SpanItem } from "./CommaSeparatedList";
import Heading from "./Heading";

export type RadicalNode = Node<RadicalSubject, "radical">;

export default function RadicalNode(props: NodeProps<RadicalNode>) {
  const radical = props.data;

  return (
    <>
      <div className="card card-node card-node-radical">
        <Heading subject={radical} />

        <ul className="list-group list-group-flush">
          {radical.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div>
                <strong>Other meanings</strong>
              </div>
              <div>
                <CommaSeparatedList
                  items={radical.otherMeanings}
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
              <Mnemonic value={radical.meaningMnemonic} />
            </div>
          </li>

          <Urls subject={radical} />
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}
