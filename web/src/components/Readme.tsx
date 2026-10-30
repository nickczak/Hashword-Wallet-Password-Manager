import ReadmeContent from "@/content/readme.md";
import Image from "next/image";

export default function Readme() {
  return (
    <article className="mx-auto w-full max-w-[1100px] space-y-5 rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-left sm:p-10 text-neutral-400 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-terminal-accent [&_h2]:pt-7 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h3]:pt-3 [&_h3]:text-white [&_strong]:text-neutral-200 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:bg-neutral-950 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:text-terminal-accent [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_a]:text-terminal-accent [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-terminal-accent [&_blockquote]:pl-4">
      <div className="flex flex-col items-center gap-8 pb-6">
        <Image
          src="/hashword_logo.png"
          alt="Hashword"
          width={527}
          height={144}
          className="h-auto w-full max-w-[400px]"
        />
      </div>
      <ReadmeContent components={{
        img: ({ alt }) => (
          <Image
            src="/showcase-desktop.gif"
            alt={alt ?? "Hashword terminal demonstration"}
            width={1148}
            height={766}
            unoptimized
            className="h-auto w-full rounded border border-neutral-800"
          />
        ),
      }} />
    </article>
  );
}
