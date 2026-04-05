import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md p-8">
        <Link
          href="/"
          className="block text-center text-xl font-bold tracking-tight mb-8"
        >
          🛍️ Marketplace
        </Link>
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
