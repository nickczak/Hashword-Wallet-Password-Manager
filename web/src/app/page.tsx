import ApiDocs from "@/components/ApiDocs";
import Footer from "@/components/Footer";
import HomeTabs from "@/components/HomeTabs";
import Readme from "@/components/Readme";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-black font-mono text-sm leading-relaxed text-terminal-accent">
      <HomeTabs apiReference={<ApiDocs />} readme={<Readme />} />
      <Footer />
    </main>
  );
}
