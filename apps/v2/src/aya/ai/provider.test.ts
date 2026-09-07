import { afterEach, describe, expect, it, vi } from "vitest";
import { createEditor } from "../core";
import { generateLayout, mockProvider, type LayoutProvider } from "./provider";

const signal = () => new AbortController().signal;
const empty = { version: 1, title: "原页面", nodes: [] };

afterEach(() => vi.useRealTimers());

describe("layout generation boundary", () => {
  it.each(["", " \n ", "x".repeat(1001)])(
    "rejects invalid prompt before calling provider",
    async (prompt) => {
      const provider = { generate: vi.fn() };
      await expect(
        generateLayout(provider, prompt, signal()),
      ).rejects.toThrow();
      expect(provider.generate).not.toHaveBeenCalled();
    },
  );

  it("trims input and validates output", async () => {
    const provider = { generate: vi.fn().mockResolvedValue(empty) };
    const currentSignal = signal();
    expect(
      await generateLayout(provider, "  单列文本  ", currentSignal),
    ).toEqual(empty);
    expect(provider.generate).toHaveBeenCalledWith("单列文本", currentSignal);
  });

  it.each([
    { version: 2 },
    { ...empty, nodes: [{ id: "x", type: "script", props: {} }] },
    "not JSON",
  ])("rejects invalid provider response", async (response) => {
    await expect(
      generateLayout({ generate: async () => response }, "布局", signal()),
    ).rejects.toThrow();
  });

  it("propagates provider failure without changing the editor or history", async () => {
    const editor = createEditor(empty);
    const provider: LayoutProvider = {
      generate: async () => {
        throw new Error("服务不可用");
      },
    };
    await expect(generateLayout(provider, "布局", signal())).rejects.toThrow(
      "服务不可用",
    );
    expect(editor.getDocument()).toEqual(empty);
    expect(editor.canUndo()).toBe(false);
  });

  it("does not start an already aborted request", async () => {
    const controller = new AbortController();
    controller.abort();
    const provider = { generate: vi.fn() };
    await expect(
      generateLayout(provider, "布局", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(provider.generate).not.toHaveBeenCalled();
  });

  it("rejects late output even when provider ignores cancellation", async () => {
    const controller = new AbortController();
    const provider: LayoutProvider = {
      generate: async () => {
        controller.abort();
        return empty;
      },
    };
    await expect(
      generateLayout(provider, "布局", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("mock provider", () => {
  it.each([
    ["单列", 1],
    ["1列", 1],
    ["双列", 2],
    ["2列", 2],
    ["三列", 3],
    ["3列", 3],
  ] as const)("builds %s with all existing widgets", async (columns, count) => {
    vi.useFakeTimers();
    const pending = generateLayout(
      mockProvider,
      `${columns} 文本 指标 计时 加载 样例`,
      signal(),
    );
    await vi.runAllTimersAsync();
    const page = await pending;
    const layout = page.nodes[0];
    expect(layout?.type).toBe("container");
    if (layout?.type !== "container") throw new Error("expected layout");
    expect(layout.props.columns).toBe(count);
    expect(layout.children.map((node) => node.type)).toEqual([
      "text",
      "metric",
      "timer",
      "cmd-loading",
      "example",
    ]);
    expect(JSON.stringify(page)).toContain("模拟数值");
  });

  it("produces a default candidate, keeps original until replace, and supports undo/redo", async () => {
    vi.useFakeTimers();
    const editor = createEditor(empty);
    const pending = generateLayout(
      mockProvider,
      "帮我生成一个工作台",
      signal(),
    );
    await vi.runAllTimersAsync();
    const candidate = await pending;
    const layout = candidate.nodes[0];
    if (layout?.type !== "container") throw new Error("expected layout");
    expect(layout.children.map((node) => node.type)).toEqual([
      "text",
      "example",
    ]);
    expect(editor.getDocument()).toEqual(empty);
    editor.execute({ type: "replace", document: candidate });
    expect(editor.getDocument()).toEqual(candidate);
    editor.undo();
    expect(editor.getDocument()).toEqual(empty);
    editor.redo();
    expect(editor.getDocument()).toEqual(candidate);
  });

  it("cancels the mock timer and removes abort listener", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const cleanup = vi.spyOn(controller.signal, "removeEventListener");
    const pending = generateLayout(mockProvider, "文本", controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    controller.abort();
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
    expect(cleanup).toHaveBeenCalledWith("abort", expect.any(Function));
  });

  it("removes abort listener after successful generation", async () => {
    vi.useFakeTimers();
    const currentSignal = signal();
    const cleanup = vi.spyOn(currentSignal, "removeEventListener");
    const pending = generateLayout(mockProvider, "文本", currentSignal);
    await vi.runAllTimersAsync();
    await pending;
    expect(cleanup).toHaveBeenCalledWith("abort", expect.any(Function));
  });
});
