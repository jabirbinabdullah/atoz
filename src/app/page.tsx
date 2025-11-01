import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl flex-col items-center py-6 px-4">
        <Header />
        <section className="mt-8 w-full rounded bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Welcome to atoz</h1>
          <p className="mt-4 text-zinc-600">A minimal Next.js + TypeScript + Tailwind starter. Build features step-by-step and learn along the way.</p>
          <div className="mt-6 flex justify-center">
            <Link href="/todos" className="rounded bg-black px-5 py-3 text-white">Try Todos</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
