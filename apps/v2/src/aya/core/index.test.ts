import { describe, expect, it } from "vitest";
import { createEditor, type EditorCommand } from "./index";
import { type PageDocument, type PageNode } from "../schema";

const text = (id: string): PageNode => ({
  id,
  type: "text",
  props: { text: id, tone: "body" },
});
const fixture = (): PageDocument => ({
  version: 1,
  title: "工作台",
  nodes: [
    text("a"),
    text("b"),
    {
      id: "box",
      type: "container",
      props: { title: "分组", columns: 2 },
      children: [
        text("c"),
        {
          id: "inner",
          type: "container",
          props: { title: "内层", columns: 1 },
          children: [],
        },
      ],
    },
  ],
});

describe("editor commands", () => {
  it("reorders siblings using an index after removal", () => {
    const editor = createEditor(fixture());
    editor.execute({ type: "move", id: "a", parentId: null, index: 2 });
    expect(editor.getDocument().nodes.map((n) => n.id)).toEqual([
      "b",
      "box",
      "a",
    ]);
    editor.undo();
    expect(editor.getDocument()).toEqual(fixture());
    editor.redo();
    expect(editor.getDocument().nodes.map((n) => n.id)).toEqual([
      "b",
      "box",
      "a",
    ]);
  });

  it("moves across containers and to root", () => {
    const editor = createEditor(fixture());
    editor.execute({ type: "move", id: "a", parentId: "inner", index: 0 });
    editor.execute({ type: "move", id: "c", parentId: null, index: 0 });
    expect(editor.getDocument().nodes.map((n) => n.id)).toEqual([
      "c",
      "b",
      "box",
    ]);
    editor.undo();
    editor.undo();
    expect(editor.getDocument()).toEqual(fixture());
  });

  it.each<EditorCommand>([
    { type: "move", id: "box", parentId: "box", index: 0 },
    { type: "move", id: "box", parentId: "inner", index: 0 },
    { type: "move", id: "a", parentId: "b", index: 0 },
    { type: "move", id: "missing", parentId: null, index: 0 },
    { type: "move", id: "a", parentId: "missing", index: 0 },
    { type: "move", id: "a", parentId: null, index: 3 },
    { type: "move", id: "a", parentId: null, index: -1 },
    { type: "insert", node: text("new"), parentId: null, index: 0.5 },
    { type: "insert", node: text("a"), parentId: null, index: 0 },
    { type: "updateProps", id: "a", props: { tone: "unknown" } },
    { type: "updateProps", id: "a", props: { unexpected: true } },
    { type: "remove", id: "missing" },
    { type: "rename", title: "" },
    { type: "replace", document: { version: 2 } },
  ])("rejects invalid transactions without losing redo: %j", (command) => {
    const editor = createEditor(fixture());
    editor.execute({ type: "rename", title: "新页面" });
    editor.undo();
    expect(() => editor.execute(command)).toThrow();
    expect(editor.getDocument()).toEqual(fixture());
    expect(editor.canUndo()).toBe(false);
    expect(editor.canRedo()).toBe(true);
    editor.redo();
    expect(editor.getDocument().title).toBe("新页面");
  });

  it("merges props and can remove entire container subtrees", () => {
    const editor = createEditor(fixture());
    editor.execute({ type: "updateProps", id: "a", props: { text: "更新" } });
    expect(editor.getDocument().nodes[0]?.props).toEqual({
      text: "更新",
      tone: "body",
    });
    editor.execute({ type: "remove", id: "box" });
    expect(editor.getDocument().nodes.map((n) => n.id)).toEqual(["a", "b"]);
    editor.undo();
    expect(editor.getDocument().nodes[2]).toEqual(fixture().nodes[2]);
  });

  it("supports insert, export, clear, import, undo and redo", () => {
    const editor = createEditor(fixture());
    editor.execute({
      type: "insert",
      node: text("new"),
      parentId: "inner",
      index: 0,
    });
    const exported = JSON.stringify(editor.getDocument());
    editor.execute({ type: "clear" });
    expect(editor.getDocument().nodes).toEqual([]);
    expect(editor.getDocument().title).toBe("工作台");
    editor.execute({ type: "replace", document: JSON.parse(exported) });
    expect(JSON.stringify(editor.getDocument())).toBe(exported);
    editor.undo();
    expect(editor.getDocument().nodes).toEqual([]);
    editor.redo();
    expect(JSON.stringify(editor.getDocument())).toBe(exported);
  });

  it("no-ops preserve history; new edits discard redo", () => {
    const editor = createEditor(fixture());
    editor.undo();
    editor.redo();
    editor.execute({ type: "rename", title: "changed" });
    editor.undo();
    editor.execute({ type: "replace", document: fixture() });
    editor.execute({ type: "updateProps", id: "a", props: { text: "a" } });
    editor.execute({ type: "move", id: "a", parentId: null, index: 0 });
    expect(editor.canUndo()).toBe(false);
    expect(editor.canRedo()).toBe(true);
    editor.execute({ type: "rename", title: "different" });
    expect(editor.canRedo()).toBe(false);
  });

  it("isolates input, command and returned snapshots", () => {
    const initial = fixture();
    const editor = createEditor(initial);
    initial.title = "external";
    const inserted = text("new");
    editor.execute({
      type: "insert",
      node: inserted,
      parentId: null,
      index: 0,
    });
    inserted.id = "external";
    const snapshot = editor.getDocument();
    snapshot.nodes.length = 0;
    expect(editor.getDocument().nodes[0]?.id).toBe("new");
    editor.undo();
    expect(editor.getDocument()).toEqual(fixture());
  });

  it("keeps the last 100 changes", () => {
    const editor = createEditor(fixture());
    for (let index = 1; index <= 101; index++)
      editor.execute({ type: "rename", title: String(index) });
    for (let index = 0; index < 100; index++) editor.undo();
    expect(editor.getDocument().title).toBe("1");
    expect(editor.canUndo()).toBe(false);
    for (let index = 0; index < 100; index++) editor.redo();
    expect(editor.getDocument().title).toBe("101");
    expect(editor.canRedo()).toBe(false);
  });
});
