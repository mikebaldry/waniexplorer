import clsx from "clsx";
import { BasicSubject } from "../../../db/subjects";
import styles from "./Urls.module.scss";
import { MouseEventHandler, useCallback } from "react";
import { useNavigate } from "react-router";

function Urls({ subject }: { subject: BasicSubject }) {
  const navigate = useNavigate();
  
  const handleView: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    navigate(subject.urls.graph);
    e.preventDefault();
    e.stopPropagation();
  }, [navigate, subject])

  return (
    <li className={clsx("list-group-item", styles.container)}>
      <a href={subject.urls.wanikani} target="_blank" className={styles.link}>WaniKani</a>
      <a href={subject.urls.graph} onClick={handleView} className={styles.link}>View</a>
    </li> 
  )
}

export default Urls;