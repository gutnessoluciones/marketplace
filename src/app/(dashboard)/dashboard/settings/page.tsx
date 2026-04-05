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
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Account</h2>
        <p className="text-sm text-gray-600">Email: {user.email}</p>
        <p className="text-sm text-gray-600 capitalize">
          Role: {profile?.role}
        </p>
      </div>

      {profile?.role === "seller" && (
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Stripe Payments</h2>
          {profile.stripe_onboarding_complete ? (
            <p className="text-sm text-green-600">
              Stripe connected. You can receive payments.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Connect your Stripe account to start receiving payments.
              </p>
              <StripeConnectButton />
            </>
          )}
        </div>
      )}
    </div>
  );
}
