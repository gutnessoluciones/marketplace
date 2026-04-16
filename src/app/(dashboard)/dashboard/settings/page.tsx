import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StripeConnectButton } from "@/components/layout/stripe-connect-button";
import { AddressManager } from "@/components/settings/address-manager";
import { ProfileEditor } from "@/components/settings/profile-editor";
import { PushNotificationToggle } from "@/components/settings/push-notification-toggle";
import { DeleteAccountSection } from "@/components/settings/delete-account";
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

                {/* Guía paso a paso */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-5">
                  <h3 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span> Guía paso a paso
                  </h3>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-emerald-700">
                      <strong>🔒 100% gratuito y seguro.</strong> Crear tu
                      cuenta en Stripe no tiene ningún coste. Stripe es la
                      plataforma de pagos que usan empresas como Amazon, Google
                      y Shopify. Tus datos están protegidos con cifrado
                      bancario.
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500 mb-3">
                    Al pulsar el botón, Stripe te redirigirá a su plataforma
                    segura para crear tu cuenta de cobros. Aquí tienes lo que
                    necesitas saber:
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-flamencalia-red text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Tipo de cuenta
                        </p>
                        <p className="text-xs text-neutral-500">
                          Selecciona <strong>&quot;Particular&quot;</strong> si
                          vendes como persona física, o{" "}
                          <strong>&quot;Empresa&quot;</strong> si tienes un
                          negocio registrado.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-flamencalia-red text-white text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Tu número de teléfono
                        </p>
                        <p className="text-xs text-neutral-500">
                          Stripe te pedirá un <strong>teléfono móvil</strong>{" "}
                          para verificar tu identidad con un código SMS.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-flamencalia-red text-white text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Datos personales
                        </p>
                        <p className="text-xs text-neutral-500">
                          Nombre completo, fecha de nacimiento y dirección.
                          Exactamente como aparecen en tu{" "}
                          <strong>DNI/NIE</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-flamencalia-red text-white text-xs font-bold flex items-center justify-center">
                        4
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Datos bancarios (IBAN)
                        </p>
                        <p className="text-xs text-neutral-500">
                          Tu número de cuenta bancaria{" "}
                          <strong>(ESXX XXXX XXXX XXXX XXXX XXXX)</strong> donde
                          recibirás los pagos de tus ventas.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-flamencalia-red text-white text-xs font-bold flex items-center justify-center">
                        5
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Verificación de identidad
                        </p>
                        <p className="text-xs text-neutral-500">
                          Es posible que Stripe te pida una{" "}
                          <strong>foto de tu DNI/NIE</strong> (anverso y
                          reverso). Ten el documento a mano.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <strong>💡 Importante:</strong> Flamencalia retiene un{" "}
                      <strong>10% de comisión</strong> por cada venta. El{" "}
                      <strong>90% restante</strong> se transfiere directamente a
                      tu cuenta bancaria. Los pagos se procesan de forma segura
                      a través de Stripe.
                    </p>
                  </div>

                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      <strong>⏱️ ¿Cuánto tarda?</strong> El proceso completo
                      lleva unos <strong>5-10 minutos</strong>. Si lo dejas a
                      medias, puedes retomarlo volviendo a pulsar el botón.
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

      {/* Delete Account — GDPR */}
      <div className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-red-50">
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
            Zona de peligro
          </h2>
        </div>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
