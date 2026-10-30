declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXProps } from "mdx/types";

  export const navigation: Array<{ id: string; title: string; method?: string }>;
  const MDXContent: ComponentType<MDXProps>;
  export default MDXContent;
}
