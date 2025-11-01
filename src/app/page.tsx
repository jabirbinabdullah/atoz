import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl flex-col items-center py-6 px-0">
        <Header />
        <section className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-white dark:bg-black px-6 py-12">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              To get started, edit the page.tsx file.
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              This starter uses Next.js App Router + TypeScript + Tailwind. We'll
              build features step-by-step.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
