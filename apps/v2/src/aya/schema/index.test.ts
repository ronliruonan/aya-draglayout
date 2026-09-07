import { describe, expect, it } from "vitest";
import {
  PAGE_LIMITS,
  parsePage,
  type PageDocument,
  type PageNode,
} from "./index";

const textNode = (id = "text-1"): PageNode => ({
  id,
  type: "text",
  props: { text: "你好", tone: "body" },
});
const page = (nodes: PageNode[] = [textNode()]): PageDocument => ({
  version: 1,
  title: "测试页面",
  nodes,
});
const container = (children: PageNode[], id = "container-1"): PageNode => ({
  id,
  type: "container",
  props: { title: "概览", columns: 2 },
  children,
});

describe("parsePage", () => {
  it("round-trips legacy widgets using version 1 without runtime state", () => {
    const input = page([
      {
        id: "example",
        type: "example",
        props: { title: "提示", description: "拖拽我" },
      },
      { id: "timer", type: "timer", props: { title: "秒计时" } },
      { id: "cmd", type: "cmd-loading", props: { title: "加载" } },
    ]);
    expect(parsePage(JSON.parse(JSON.stringify(input)))).toEqual(input);
  });

  it.each(["example", "timer", "cmd-loading"])(
    "validates properties of %s widgets",
    (type) => {
      const props =
        type === "example"
          ? { title: "提示", description: "内容" }
          : { title: "挂件" };
      const input = (value: unknown) => ({
        ...page(),
        nodes: [{ id: "widget", type, props: value }],
      });
      expect(() => parsePage(input({ ...props, title: 123 }))).toThrow();
      expect(() =>
        parsePage(input({ ...props, title: "a".repeat(201) })),
      ).toThrow();
      expect(() => parsePage(input({ ...props, elapsedSeconds: 4 }))).toThrow();
    },
  );

  it("accepts and clones a document with every supported component", () => {
    const input = page([
      container([
        textNode(),
        {
          id: "metric-1",
          type: "metric",
          props: { label: "访问", value: "42", detail: "本周" },
        },
      ]),
    ]);
    const parsed = parsePage(input);
    expect(parsed).toEqual(input);
    expect(parsed).not.toBe(input);
  });

  it("accepts empty pages and empty containers", () => {
    expect(parsePage(page([])).nodes).toEqual([]);
    expect(parsePage(page([container([])]))).toEqual(page([container([])]));
  });

  it.each([
    null,
    { ...page(), version: 2 },
    { ...page(), title: "" },
    { ...page(), unexpected: true },
    { ...page(), nodes: [{ ...textNode(), component: "script" }] },
    { ...page(), nodes: [{ id: "x", type: "script", props: {} }] },
    {
      ...page(),
      nodes: [
        {
          ...textNode(),
          props: { text: "hi", tone: "body", html: "<script />" },
        },
      ],
    },
    { ...page(), nodes: [{ ...textNode(), children: [] }] },
    { ...page(), nodes: [{ ...textNode(), id: "../bad" }] },
    { ...page(), nodes: [{ ...textNode(), props: { text: 3, tone: "body" } }] },
    {
      ...page(),
      nodes: [
        {
          id: "c",
          type: "container",
          props: { title: "", columns: 4 },
          children: [],
        },
      ],
    },
  ])("rejects malformed or unknown data: %j", (input) => {
    expect(() => parsePage(input)).toThrow();
  });

  it("rejects duplicate IDs across different branches", () => {
    expect(() =>
      parsePage(page([textNode(), container([textNode()])])),
    ).toThrow("ID 重复");
  });

  it("bounds total nodes across containers", () => {
    const children = Array.from({ length: 100 }, (_, i) => textNode(`a-${i}`));
    const others = Array.from({ length: 99 }, (_, i) => textNode(`b-${i}`));
    expect(() =>
      parsePage(page([container(children, "a"), container(others, "b")])),
    ).toThrow("最多包含");
  });

  it("accepts the maximum depth and rejects one additional level", () => {
    let node = textNode();
    for (let i = 1; i < PAGE_LIMITS.depth; i++)
      node = container([node], `c-${i}`);
    expect(() => parsePage(page([node]))).not.toThrow();
    expect(() => parsePage(page([container([node], "overflow")]))).toThrow(
      "嵌套",
    );
  });

  it("rejects excessive UTF-8 payload size", () => {
    const nodes = Array.from({ length: 30 }, (_, i): PageNode => ({
      id: `n-${i}`,
      type: "text",
      props: { text: "界".repeat(4_000), tone: "body" },
    }));
    expect(() => parsePage(page(nodes))).toThrow("大小限制");
  });

  it("rejects cyclic data without recursive schema overflow", () => {
    const input: Record<string, unknown> = { ...page() };
    input.loop = input;
    expect(() => parsePage(input)).toThrow("循环引用");
  });
});
