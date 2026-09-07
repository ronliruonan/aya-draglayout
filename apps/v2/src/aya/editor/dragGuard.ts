import type { MoveEvent } from "sortablejs";

/** A nested canvas owns its drop area; do not reorder its parent instead. */
export function allowDrop(event: MoveEvent, originalEvent: Event) {
  const point = originalEvent as MouseEvent;
  if (typeof point.clientX === "number") {
    const inner = document
      .elementFromPoint(point.clientX, point.clientY)
      ?.closest(".editor-tree");
    if (inner && inner !== event.to && event.to.contains(inner)) return false;
  }
  const id = event.dragged.dataset.nodeId;
  if (id && event.to.closest(`[data-node-id="${CSS.escape(id)}"]`))
    return false;
  return true;
}
