import clsx from "clsx";
import { BasicSubject, SubjectType } from "../../../db/subjects";
import styles from "./Urls.module.scss";
import { MouseEventHandler, useCallback } from "react";
import { useNavigate, useParams } from "react-router";

function Urls({ subject }: { subject: BasicSubject }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleView: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    navigate(graphUrl(subject));
    e.preventDefault();
    e.stopPropagation();
  }, [navigate, subject])

  const jishoUrl = makeJishoUrl(subject);

  return (
    <li className={clsx("list-group-item", styles.container)}>
      <a href={wkUrl(subject)} target="_blank" className={styles.link}>WaniKani</a>
      {jishoUrl && <a href={jishoUrl} target="_blank" className={styles.link}>Jisho</a>}
      { parseInt(id!) !== subject.id && (
        <div className={styles.rightLink}>
          <a href={graphUrl(subject)} onClick={handleView} className={styles.link}>View</a>
        </div>
      )}
    </li> 
  )
}

function wkUrl(subject: BasicSubject): string {
  const slug = encodeURIComponent(subject.wkSlug);

  switch (subject.type) {
    case SubjectType.RADICAL:
      return `https://www.wanikani.com/radicals/${slug}`;
    case SubjectType.KANJI:
      return `https://www.wanikani.com/kanji/${slug}`;
    case SubjectType.VOCABULARY:
      return `https://www.wanikani.com/vocabulary/${slug}`;
  }
}

function graphUrl(subject: BasicSubject): string {
  return `/${subject.type}/${subject.id}`;
}

function makeJishoUrl(subject: BasicSubject): string | undefined {
  const characters = encodeURIComponent(subject.characters.value);
  switch (subject.type) {
    case SubjectType.RADICAL:
      return undefined;
    case SubjectType.KANJI:
      return `https://jisho.org/search/%23kanji%20${characters}`;
    case SubjectType.VOCABULARY:
      return `https://jisho.org/search/%23words%20${characters}`;
  }
}

export default Urls;