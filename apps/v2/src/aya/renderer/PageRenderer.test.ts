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
    expect(html).toContain("让想法，拥有自己的布局。");
    expect(html).toContain("进行中的项目");
    expect(html).toContain("86%");
    expect(html).toContain("留一点空间");
  });
  it("rejects unknown components rather than rendering partial data", async () => {
    const html = await render({
      ...samplePage,
      nodes: [{ id: "x", type: "iframe", props: {} }],
    });
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("进行中的项目");
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
