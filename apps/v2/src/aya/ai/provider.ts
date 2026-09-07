import { parsePage, type PageDocument, type PageNode } from "../schema";

export interface LayoutProvider {
  generate(prompt: string, signal: AbortSignal): Promise<unknown>;
}

function checkAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException("生成已取消", "AbortError");
}

/** Treat every provider response as untrusted, including local mock output. */
export async function generateLayout(
  provider: LayoutProvider,
  prompt: string,
  signal: AbortSignal,
): Promise<PageDocument> {
  checkAborted(signal);
  const trimmed = prompt.trim();
  if (!trimmed) throw new Error("请输入布局需求");
  if (trimmed.length > 1_000) throw new Error("布局需求最多 1000 个字符");
  const result = await provider.generate(trimmed, signal);
  checkAborted(signal);
  const document = parsePage(result);
  checkAborted(signal);
  return document;
}

function delay(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    checkAborted(signal);
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 400);
    function abort() {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new DOMException("生成已取消", "AbortError"));
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}

/** Keyword demo only: no model, network request, credentials or business data. */
export const mockProvider: LayoutProvider = {
  async generate(prompt, signal) {
    await delay(signal);
    checkAborted(signal);
    const children: PageNode[] = [];
    if (/文本/.test(prompt))
      children.push({
        id: "generated-text",
        type: "text",
        props: { text: "示例文本，可在属性区修改", tone: "body" },
      });
    if (/指标/.test(prompt))
      children.push({
        id: "generated-metric",
        type: "metric",
        props: {
          label: "示例指标",
          value: "128",
          detail: "模拟数值，未连接业务数据",
        },
      });
    if (/计时/.test(prompt))
      children.push({
        id: "generated-timer",
        type: "timer",
        props: { title: "示例计时器" },
      });
    if (/加载|cmd/i.test(prompt))
      children.push({
        id: "generated-loading",
        type: "cmd-loading",
        props: { title: "示例 CMD 加载" },
      });
    if (/样例|提示/.test(prompt))
      children.push({
        id: "generated-example",
        type: "example",
        props: {
          title: "样例提示",
          description: "这是模拟生成的示例内容，可在属性区修改。",
        },
      });
    if (!children.length) {
      children.push(
        {
          id: "generated-text",
          type: "text",
          props: { text: "示例布局", tone: "heading" },
        },
        {
          id: "generated-example",
          type: "example",
          props: {
            title: "样例提示",
            description:
              "模拟生成按关键词组合挂件；可输入文本、指标、计时、加载或样例。",
          },
        },
      );
    }
    const columns = /三列|3\s*列/.test(prompt)
      ? 3
      : /双列|二列|两列|2\s*列/.test(prompt)
        ? 2
        : 1;
    return {
      version: 1,
      title: "模拟生成的页面",
      nodes: [
        {
          id: "generated-layout",
          type: "container",
          props: { title: "示例布局", columns },
          children,
        },
      ],
    } satisfies PageDocument;
  },
};
