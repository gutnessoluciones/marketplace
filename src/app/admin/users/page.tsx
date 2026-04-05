import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/icons";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {users?.length ?? 0} usuarios registrados
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Usuario
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Rol
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Stripe
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Registro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {user.display_name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {user.display_name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {user.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      user.role === "seller"
                        ? "bg-violet-50 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role === "seller" ? "Vendedor" : "Comprador"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {user.stripe_onboarding_complete ? (
                    <span className="text-emerald-500">
                      <Icon name="checkCircle" className="w-4 h-4" />
                    </span>
                  ) : user.stripe_account_id ? (
                    <span className="text-amber-500 text-xs">Pendiente</span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
