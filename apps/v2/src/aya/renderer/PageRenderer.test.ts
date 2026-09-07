import { describe, expect, it } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import PageRenderer from "./PageRenderer.vue";
import { samplePage } from "../../sample";

const render = (document: unknown) =>
  renderToString(createSSRApp(PageRenderer, { document }));
describe("PageRenderer boundary", () => {
  it("renders nested registered widgets from the sample page", async () => {
    const html = await render(samplePage);
    expect(html).toContain("示例挂件");
    expect(html).toContain("出生于");
    expect(html).toContain("0s");
    expect(html).toContain("加载动画");
  });
  it("rejects unknown components rather than rendering partial data", async () => {
    const html = await render({
      ...samplePage,
      nodes: [{ id: "x", type: "iframe", props: {} }],
    });
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("示例挂件");
  });
  it("escapes text as text instead of rendering markup", async () => {
    const html = await render({
      version: 1,
      title: "safe",
      nodes: [
        {
          id: "x",
          type: "text",
          props: { tone: "body", text: "<script>alert(1)</script>" },
        },
      ],
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
