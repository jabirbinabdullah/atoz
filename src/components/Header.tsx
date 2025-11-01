export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">atoz</h1>
        <nav className="flex gap-4 text-sm">
          <a className="text-zinc-600 hover:underline" href="#">Home</a>
          <a className="text-zinc-600 hover:underline" href="#features">Features</a>
          <a className="text-zinc-600 hover:underline" href="#about">About</a>
        </nav>
      </div>
    </header>
  );
}
