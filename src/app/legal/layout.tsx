import Link from "next/link";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-flamencalia-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold tracking-tight"
          >
            <Icon name="fan" className="w-7 h-7 text-flamencalia-red" />
            <span className="hidden sm:inline font-serif">Flamencalia</span>
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
