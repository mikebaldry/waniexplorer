import { useCallback, useMemo, useRef, useState } from "react";

import styles from "./View.module.scss";

import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef, ReactZoomPanPinchContext } from "react-zoom-pan-pinch";
import { Subject } from "../../db/subjects";
import clsx from "clsx";
import SubjectNode from "./SubjectNode";
import { scaleToFit } from "./utils";
import NavigationArrows from "../NavigationArrows";
import { Tools } from "./types";
import { useAppState, View } from "../AppState";
import { useKeyboardEvent } from "@react-hookz/web";

function ViewComponent({ view }: { view: View }) {
  const { setFocussedSubject, menuOpen } = useAppState();

  const [initComplete, setInitComplete] = useState(false);
  const instance = useRef<ReactZoomPanPinchContext | null>(null);

  const elementForSubject = (subject: Subject) => document.querySelector(`[data-id="${subject.id}"]`) as HTMLElement;

  const handleInit = useCallback((ref: ReactZoomPanPinchRef) => {
    const primaryNode = elementForSubject(view.primarySubject);
    ref.zoomToElement(primaryNode, scaleToFit(ref, primaryNode), 0);
    instance.current = ref.instance;
    setInitComplete(true);
  }, [view, setInitComplete]);

  
  const tools: Tools = useMemo(() => {
    return {
      zoomTo: (subject: Subject, animated: boolean, scaleFit: boolean) => {
        const ctx = instance.current!.getContext();
        const element = elementForSubject(subject);
        let scale = ctx.state.scale;
        if (scaleFit) {
          scale = scaleToFit(ctx, element);
        }

        if (animated) {
          ctx.zoomToElement(element, scale, 500, "easeInQuart");
        } else {
          ctx.zoomToElement(element, scale, 0);
        }

        setFocussedSubject(subject);
      },
    };
  }, [instance, setFocussedSubject]);

  const handleZoom = useCallback((amount: number) => {
    if (!menuOpen) {
      const ctx = instance.current!.getContext();
      ctx.zoomIn(amount, 300, "easeOutQuart");
    }
  }, [menuOpen, instance]);

  useKeyboardEvent("+", () => handleZoom(0.2));
  useKeyboardEvent("=", () => handleZoom(0.2));
  useKeyboardEvent("-", () => handleZoom(-0.2));

  return (
    <div className={styles.container}>
      {view.rows && (
        <>
          <NavigationArrows tools={tools} />

          <TransformWrapper minScale={0.1} maxScale={3.0} centerZoomedOut={false} limitToBounds={false} onInit={handleInit} doubleClick={{disabled: true}}>
            <TransformComponent contentClass={styles.grid} wrapperClass={clsx(styles.wrapper, initComplete && styles.visible)}>
              {view.rows.map((row, i) => (
                <div className={styles.row} key={i}>
                  {row.map((subject) => {
                    return <SubjectNode subject={subject} tools={tools} key={subject.id} />;
                  })}
                </div>
              ))}
            </TransformComponent>
          </TransformWrapper>
        </>
      )}
    </div>
  )
}

export default ViewComponent;