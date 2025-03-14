import { ReactZoomPanPinchContentRef, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

export function scaleToFit(ref: ReactZoomPanPinchRef, element: HTMLElement) {
  const instance = ref.instance;
  const context = instance.getContext();
  const currentScale = context.state.scale;
  const containerRect = instance.wrapperComponent!.getBoundingClientRect();
  const containerSize = { width: containerRect.width * 0.95, height: containerRect.height * 0.95 };
  const elementRect = element.getBoundingClientRect();
  const elementSize = { width: elementRect.width / currentScale, height: elementRect.height / currentScale };

  const scaleX = containerSize.width / elementSize.width;
  const scaleY = containerSize.height / elementSize.height;
  
  let scale = Math.min(scaleX, scaleY);

  if (instance.props.minScale) {
    scale = Math.max(instance.props.minScale, scale);
  }

  if (instance.props.maxScale) {
    scale = Math.min(instance.props.maxScale, scale);
  }

  return scale;
}

export function zoomToFit(context: ReactZoomPanPinchContentRef, element: HTMLElement) {
  const scale = scaleToFit(context.instance.getContext(), element);
  context.zoomToElement(element, scale, 500, "easeInQuart");
}
