import clsx from "clsx";
import styles from "./NavigationArrows.module.scss";
import { Tools } from "./graph/types";
import { useCallback } from "react";
import { useAppState } from "./AppState";
import { Subject } from "../db/subjects";

function Icon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.5 0 20 20" className={clsx(styles.icon, styles[className])}>
      <path d="M.366 19.708c.405.39 1.06.39 1.464 0l8.563-8.264a1.95 1.95 0 0 0 0-2.827L1.768.292A1.063 1.063 0 0 0 .314.282a.976.976 0 0 0-.011 1.425l7.894 7.617a.975.975 0 0 1 0 1.414L.366 18.295a.974.974 0 0 0 0 1.413" />
    </svg>
  )
}

export default function NavigationArrows({ tools }: { tools: Tools}) {
  const { view } = useAppState();
  const handleClick = useCallback((subject: Subject) => {
    tools.zoomTo(subject, true, true);
  }, [tools]);

  if (!view) {
    return null;
  }
  
  return (
    <>
      {view.neighbours.above && (<div onClick={() => handleClick(view.neighbours.above!)}><Icon className="top" /></div>)}
      {view.neighbours.right && (<div onClick={() => handleClick(view.neighbours.right!)}><Icon className="right" /></div>)}
      {view.neighbours.below && (<div onClick={() => handleClick(view.neighbours.below!)}><Icon className="bottom" /></div>)}
      {view.neighbours.left && (<div onClick={() => handleClick(view.neighbours.left!)}><Icon className="left" /></div>)}
    </>
  )
}