import Link from "next/link";
import Image from "next/image";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-indigo-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold tracking-tight"
          >
            <Image
              src="/gutnes-logo.png"
              alt="GutnesPlace"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="hidden sm:inline">GutnesPlace</span>
          </Link>
          <UserNav variant="dark" />
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
