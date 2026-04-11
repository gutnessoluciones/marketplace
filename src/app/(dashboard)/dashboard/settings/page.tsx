import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StripeConnectButton } from "@/components/layout/stripe-connect-button";
import { AddressManager } from "@/components/settings/address-manager";
import { ProfileEditor } from "@/components/settings/profile-editor";
import { PushNotificationToggle } from "@/components/settings/push-notification-toggle";
import { Icon } from "@/components/icons";

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

  if (!profile) redirect("/login");

  const isSeller = profile.role === "seller";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          Configuración
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Profile Editor (interactive) */}
      <ProfileEditor profile={profile} email={user.email ?? ""} />

      {/* Stripe Section (Sellers Only) */}
      {isSeller && (
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-neutral-50">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              Pagos con Stripe
            </h2>
          </div>
          <div className="p-6">
            {profile?.stripe_onboarding_complete ? (
              <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Icon name="check" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Stripe conectado
                  </p>
                  <p className="text-xs text-emerald-600">
                    Ya puedes recibir pagos de tus clientes.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Icon name="zap" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Conecta tu cuenta de Stripe
                    </p>
                    <p className="text-xs text-amber-600">
                      Necesario para empezar a recibir pagos por tus ventas.
                    </p>
                  </div>
                </div>
                <StripeConnectButton />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Details */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-neutral-50">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Datos de la cuenta
          </h2>
        </div>
        <div className="divide-y divide-neutral-50">
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-neutral-400">Email</p>
              <p className="text-sm text-neutral-700">{user.email}</p>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-neutral-400">ID de usuario</p>
              <p className="text-xs text-neutral-700 font-mono">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-neutral-50">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Direcciones de envío
          </h2>
        </div>
        <div className="p-6">
          <AddressManager />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-50">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Notificaciones
          </h2>
        </div>
        <PushNotificationToggle />
      </div>
    </div>
  );
}
