import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRenderer,
  createSSRApp,
  defineComponent,
  h,
  nextTick,
  type Component,
} from "vue";
import { renderToString } from "vue/server-renderer";
import { widgetRegistry } from "./index";
import { useWidgetTicker } from "./useWidgetTicker";

// Minimal in-memory Vue host exercises real mount/unmount hooks without a browser DOM.
interface HostNode {
  text: string;
  children: HostNode[];
  parent: HostNode | null;
}
const node = (text = ""): HostNode => ({ text, children: [], parent: null });
const renderer = createRenderer<HostNode, HostNode>({
  createElement: () => node(),
  createText: node,
  createComment: () => node(),
  setText: (target, text) => {
    target.text = text;
  },
  setElementText: (target, text) => {
    target.text = text;
    target.children = [];
  },
  insert: (child, parent, anchor) => {
    if (child.parent)
      child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    if (index < 0) parent.children.push(child);
    else parent.children.splice(index, 0, child);
  },
  remove: (child) => {
    child.parent?.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = null;
  },
  parentNode: (child) => child.parent,
  nextSibling: (child) =>
    child.parent?.children[child.parent.children.indexOf(child) + 1] ?? null,
  patchProp: () => {},
});
const content = (target: HostNode): string =>
  target.text + target.children.map(content).join("");
const mount = (component: Component) => {
  const root = node();
  const app = renderer.createApp(component, { title: "测试挂件" });
  app.mount(root);
  return { root, app };
};
afterEach(() => {
  vi.useRealTimers();
});

describe("legacy widgets", () => {
  it("registers all three components and safely renders their defaults", async () => {
    for (const type of ["example", "timer", "cmd-loading"] as const) {
      const entry = widgetRegistry[type];
      const html = await renderToString(
        createSSRApp(entry.component, entry.defaults),
      );
      expect(html).toContain(entry.defaults.title);
    }
    const html = await renderToString(
      createSSRApp(widgetRegistry.example.component, {
        title: "<script>",
        description: "<img>",
      }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img&gt;");
  });
  it("counts seconds while mounted and releases the interval on removal", async () => {
    vi.useFakeTimers();
    const { root, app } = mount(
      defineComponent({
        setup() {
          const seconds = useWidgetTicker(1000);
          return () => h("p", `${seconds.value}s`);
        },
      }),
    );
    expect(content(root)).toContain("0s");
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(content(root)).toContain("2s");
    app.unmount();
    expect(vi.getTimerCount()).toBe(0);
    const again = mount(
      defineComponent({
        setup() {
          const seconds = useWidgetTicker(1000);
          return () => h("p", `${seconds.value}s`);
        },
      }),
    );
    expect(content(again.root)).toContain("0s");
    again.app.unmount();
  });
  it("cycles CMD symbols every 250ms and releases the interval on removal", async () => {
    vi.useFakeTimers();
    const { root, app } = mount(
      defineComponent({
        setup() {
          const ticks = useWidgetTicker(250);
          return () => {
            const symbol = ticks.value
              ? ["\\", "||", "///", "-"][(ticks.value - 1) % 4]
              : "";
            return h("p", `${symbol} - ${symbol} - ${symbol}`);
          };
        },
      }),
    );
    for (const symbol of ["\\", "||", "///", "-", "\\"]) {
      vi.advanceTimersByTime(250);
      await nextTick();
      expect(content(root)).toContain(`${symbol} - ${symbol} - ${symbol}`);
    }
    app.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
