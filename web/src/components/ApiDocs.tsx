import ApiContent, { navigation } from "@/content/api.mdx";

const linkStyle = "block rounded px-3 py-2 text-neutral-400 hover:bg-neutral-950 hover:text-terminal-accent focus-visible:outline focus-visible:outline-terminal-accent";

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded bg-terminal-accent/10 px-2 py-1 text-xs font-semibold text-terminal-accent">{method}</span>
      <code>{path}</code>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <div className="grid max-w-[1280px] gap-10 text-neutral-300 md:grid-cols-[190px_minmax(0,1fr)] md:gap-14">
      <aside className="md:sticky md:top-6 md:self-start">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">API reference</p>
        <nav aria-label="API documentation">
          {navigation.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={linkStyle}>
              {item.method && <span className="mr-2 text-xs text-terminal-accent">{item.method}</span>}
              {item.title}
            </a>
          ))}
        </nav>
      </aside>
      <article className="min-w-0 space-y-12 pb-12 [&_section]:scroll-mt-6 [&_section]:space-y-4 [&_section+section]:border-t [&_section+section]:border-neutral-800 [&_section+section]:pt-8 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h3]:pt-3 [&_h3]:font-semibold [&_h3]:text-white [&_p]:max-w-[75ch] [&_p]:text-neutral-400 [&_strong]:text-terminal-accent [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:bg-neutral-950 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-6 [&_blockquote]:border-l-2 [&_blockquote]:border-terminal-accent [&_blockquote]:pl-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-5">
        <ApiContent components={{ Endpoint }} />
      </article>
    </div>
  );
}
