import { Footer } from "./Footer";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 lg:px-8 w-full flex flex-col min-h-screen">
      {children}
      <Footer />
    </div>
  );
}
