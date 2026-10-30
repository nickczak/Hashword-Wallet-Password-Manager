declare module "*.md" {
  import type { ComponentType } from "react";
  import type { MDXProps } from "mdx/types";

  const MarkdownContent: ComponentType<MDXProps>;
  export default MarkdownContent;
}
