import clsx from "clsx";
import { CharactersType } from "../../../db/characters";

import styles from "./Heading.module.scss";
import { BasicSubject } from "../../../db/subjects";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

function Heading({ subject }: { subject: BasicSubject }) {
  const { fitView } = useReactFlow();

  const handleClick = useCallback(() => {
    requestAnimationFrame(() => {
      fitView({ nodes: [{ id: subject.id.toString() }], duration: 500 });
    });
  }, [fitView, subject]);

  return (
    <div
      className={clsx("card-header", styles.container)}
      onClick={handleClick}
    >
      <span className={clsx("text-bg-secondary rounded-pill", styles.level)}>
        {subject.level}
      </span>

      {subject.characters.type === CharactersType.TEXT &&
        subject.characters.value}
      {subject.characters.type === CharactersType.SVG && (
        <div
          className="radical-svg"
          dangerouslySetInnerHTML={{ __html: subject.characters.value }}
        />
      )}

      <div className="card-header-sub">{subject.primaryMeaning}</div>
    </div>
  );
}

export default Heading;
