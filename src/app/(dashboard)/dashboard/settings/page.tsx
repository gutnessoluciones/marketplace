import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StripeConnectButton } from "@/components/layout/stripe-connect-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <div className="border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3">Cuenta</h2>
        <p className="text-sm text-gray-600">Correo: {user.email}</p>
        <p className="text-sm text-gray-600 capitalize">
          Rol: {profile?.role === "seller" ? "Vendedor" : "Comprador"}
        </p>
      </div>

      {profile?.role === "seller" && (
        <div className="border rounded-xl p-5">
          <h2 className="font-semibold mb-3">Pagos con Stripe</h2>
          {profile.stripe_onboarding_complete ? (
            <p className="text-sm text-emerald-600 font-medium">
              ✓ Stripe conectado. Puedes recibir pagos.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Conecta tu cuenta de Stripe para empezar a recibir pagos.
              </p>
              <StripeConnectButton />
            </>
          )}
        </div>
      )}
    </div>
  );
}
