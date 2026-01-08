import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
      <Link href="/lernende">
        <button>Lernende</button>
      </Link>
      
      <Link href="/dozenten">
        <button>Dozenten</button>
      </Link>

      <Link href="/kurse">
        <button>Kurse</button>
      </Link>

      <Link href="/kurse-lernende">
        <button>Kurse-Lernende</button>
      </Link>

      <Link href="/laender">
        <button>Länder</button>
      </Link>

      <Link href="/lehrbetriebe">
        <button>Lehrbetriebe</button>
      </Link>

      <Link href="/lehrbetriebe-lernende">
        <button>Lehrbetriebe-Lernende</button>
      </Link>
    </main>
  );
}