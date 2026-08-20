"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 lg:px-8 w-full flex flex-col min-h-screen">
      <main className="flex-1 mt-16 mb-24 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-black ">Something went wrong</h1>
        <p className="text-slate-600 max-w-md">
          An unexpected error occurred. Please try again later.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:scale-105 transition-transform"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
      </main>
    </div>
  );
}
