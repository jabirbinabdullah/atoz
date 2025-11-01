import TodoList from "@/components/TodoList";
import Header from "@/components/Header";

export const metadata = {
  title: "Todos",
};

export default function TodosPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Header />
        <section className="mt-6 rounded bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Todos</h2>
          <TodoList />
        </section>
      </main>
    </div>
  );
}
