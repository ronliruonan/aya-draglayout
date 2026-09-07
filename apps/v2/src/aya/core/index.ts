import { parsePage, type PageDocument, type PageNode } from "../schema";

export type EditorCommand =
  | { type: "insert"; node: PageNode; parentId: string | null; index: number }
  | { type: "remove"; id: string }
  | { type: "move"; id: string; parentId: string | null; index: number }
  | { type: "updateProps"; id: string; props: Record<string, unknown> }
  | { type: "rename"; title: string }
  | { type: "replace"; document: unknown }
  | { type: "clear" };

export interface Editor {
  getDocument(): PageDocument;
  execute(command: EditorCommand): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}

function locate(
  nodes: PageNode[],
  id: string,
): { siblings: PageNode[]; index: number; node: PageNode } | undefined {
  for (const [index, node] of nodes.entries()) {
    if (node.id === id) return { siblings: nodes, index, node };
    if (node.type === "container") {
      const found = locate(node.children, id);
      if (found) return found;
    }
  }
}

function requireNode(page: PageDocument, id: string) {
  const found = locate(page.nodes, id);
  if (!found) throw new Error(`找不到组件：${id}`);
  return found;
}

function targetNodes(page: PageDocument, parentId: string | null): PageNode[] {
  if (parentId === null) return page.nodes;
  const { node } = requireNode(page, parentId);
  if (node.type !== "container") throw new Error("目标组件必须是容器");
  return node.children;
}

function checkIndex(nodes: PageNode[], index: number) {
  if (!Number.isInteger(index) || index < 0 || index > nodes.length)
    throw new Error("插入位置超出范围");
}

/** All document changes are validated atomically; snapshots never expose internal state. */
export function createEditor(initial: unknown): Editor {
  let current = parsePage(initial);
  const past: PageDocument[] = [];
  const future: PageDocument[] = [];
  return {
    getDocument: () => structuredClone(current),
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    undo() {
      const previous = past.pop();
      if (previous) {
        future.push(current);
        current = previous;
      }
    },
    redo() {
      const next = future.pop();
      if (next) {
        past.push(current);
        current = next;
      }
    },
    execute(command) {
      let draft = structuredClone(current);
      switch (command.type) {
        case "insert": {
          const nodes = targetNodes(draft, command.parentId);
          checkIndex(nodes, command.index);
          nodes.splice(command.index, 0, command.node);
          break;
        }
        case "remove": {
          const { siblings, index } = requireNode(draft, command.id);
          siblings.splice(index, 1);
          break;
        }
        case "move": {
          const { node, siblings, index } = requireNode(draft, command.id);
          if (command.parentId !== null && locate([node], command.parentId))
            throw new Error("不能将组件移入自身或其子组件");
          const nodes = targetNodes(draft, command.parentId);
          siblings.splice(index, 1);
          // Destination index is measured AFTER removing the source node.
          checkIndex(nodes, command.index);
          nodes.splice(command.index, 0, node);
          break;
        }
        case "updateProps": {
          const { node } = requireNode(draft, command.id);
          // The merged properties are checked against the node's schema below.
          Object.assign(node.props, command.props);
          break;
        }
        case "rename":
          draft.title = command.title;
          break;
        case "replace":
          draft = parsePage(command.document);
          break;
        case "clear":
          draft.nodes = [];
          break;
        default:
          throw new Error("不支持的编辑命令");
      }
      const next = parsePage(draft);
      if (JSON.stringify(next) === JSON.stringify(current)) return;
      past.push(current);
      if (past.length > 100) past.shift();
      current = next;
      future.length = 0;
    },
  };
}
