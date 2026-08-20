import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <Container>
      <Navigation />
      <main className="flex-1 mt-16 mb-24 flex flex-col items-center justify-center text-center gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-black ">404</h1>
        <p className="text-lg text-slate-600 ">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </main>
    </Container>
  );
}
