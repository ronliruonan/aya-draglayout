import { z } from "zod";

export const PAGE_LIMITS = { bytes: 256_000, nodes: 200, depth: 12 } as const;

export type PageNode =
  | {
      id: string;
      type: "text";
      props: { text: string; tone: "heading" | "body" };
    }
  | {
      id: string;
      type: "metric";
      props: { label: string; value: string; detail: string };
    }
  | {
      id: string;
      type: "container";
      props: { title: string; columns: 1 | 2 | 3 };
      children: PageNode[];
    };

export interface PageDocument {
  version: 1;
  title: string;
  nodes: PageNode[];
}

const id = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/, "ID 只能包含字母、数字、下划线或连字符");
const nodeSchema: z.ZodType<PageNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z
      .object({
        id,
        type: z.literal("text"),
        props: z
          .object({
            text: z.string().max(10_000),
            tone: z.enum(["heading", "body"]),
          })
          .strict(),
      })
      .strict(),
    z
      .object({
        id,
        type: z.literal("metric"),
        props: z
          .object({
            label: z.string().max(200),
            value: z.string().max(200),
            detail: z.string().max(1_000),
          })
          .strict(),
      })
      .strict(),
    z
      .object({
        id,
        type: z.literal("container"),
        props: z
          .object({
            title: z.string().max(200),
            columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          })
          .strict(),
        children: z.array(nodeSchema).max(PAGE_LIMITS.nodes),
      })
      .strict(),
  ]),
);

const pageSchema = z
  .object({
    version: z.literal(1),
    title: z.string().min(1).max(200),
    nodes: z.array(nodeSchema).max(PAGE_LIMITS.nodes),
  })
  .strict();

// Bound traversal before the recursive schema runs, including malformed inputs.
function checkInputSize(input: unknown): void {
  let entries = 0;
  const ancestors = new Set<object>();
  function visit(value: unknown, depth: number): void {
    if (++entries > 10_000 || depth > PAGE_LIMITS.depth * 2 + 5) {
      throw new Error("页面数据过大或嵌套过深");
    }
    if (typeof value === "string" && value.length > PAGE_LIMITS.bytes)
      throw new Error("页面数据超过大小限制");
    if (value === null || typeof value !== "object") return;
    if (ancestors.has(value)) throw new Error("页面不能包含循环引用");
    ancestors.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (key.length > PAGE_LIMITS.bytes)
        throw new Error("页面数据超过大小限制");
      visit(child, depth + 1);
    }
    ancestors.delete(value);
  }
  visit(input, 0);
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(input);
  } catch {
    throw new Error("页面必须是可序列化的 JSON 数据");
  }
  if (
    !serialized ||
    new TextEncoder().encode(serialized).byteLength > PAGE_LIMITS.bytes
  ) {
    throw new Error("页面数据超过大小限制或不是有效 JSON");
  }
}

/** Parse untrusted page data. The renderer should only receive this validated result. */
export function parsePage(input: unknown): PageDocument {
  checkInputSize(input);
  const page = pageSchema.parse(input);
  const ids = new Set<string>();
  function visit(nodes: PageNode[], depth: number): void {
    if (nodes.length && depth > PAGE_LIMITS.depth)
      throw new Error(`页面最多嵌套 ${PAGE_LIMITS.depth} 层`);
    for (const node of nodes) {
      if (ids.has(node.id)) throw new Error(`组件 ID 重复：${node.id}`);
      ids.add(node.id);
      if (ids.size > PAGE_LIMITS.nodes)
        throw new Error(`页面最多包含 ${PAGE_LIMITS.nodes} 个组件`);
      if (node.type === "container") visit(node.children, depth + 1);
    }
  }
  visit(page.nodes, 1);
  return page;
}
