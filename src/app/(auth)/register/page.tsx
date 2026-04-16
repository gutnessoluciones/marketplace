"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Icon } from "@/components/icons";

/* ── Password validation ──────────────────────────────────── */
const PASSWORD_RULES = [
  {
    key: "length",
    label: "Mínimo 8 caracteres",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "upper",
    label: "Una letra mayúscula",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    key: "lower",
    label: "Una letra minúscula",
    test: (p: string) => /[a-z]/.test(p),
  },
  { key: "number", label: "Un número", test: (p: string) => /\d/.test(p) },
  {
    key: "special",
    label: "Un carácter especial (!@#$...)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
] as const;

function getPasswordStrength(password: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password));
  return {
    passed: passed.length,
    total: PASSWORD_RULES.length,
    rules: PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) })),
  };
}

/* ── Translate Supabase auth errors ───────────────────────── */
function translateAuthError(msg: string): string {
  if (msg.includes("User already registered"))
    return "Ya existe una cuenta con este correo electrónico.";
  if (msg.includes("Email rate limit exceeded"))
    return "Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.";
  if (msg.includes("Password should be at least"))
    return "La contraseña no cumple los requisitos mínimos de seguridad.";
  if (msg.includes("Unable to validate email"))
    return "El correo electrónico no es válido. Comprueba que esté bien escrito.";
  if (msg.includes("Signup requires a valid password"))
    return "Debes introducir una contraseña válida.";
  if (msg.includes("email address") && msg.includes("invalid"))
    return "El formato del correo electrónico no es válido.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Demasiados intentos. Espera unos minutos.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Error de conexión. Comprueba tu conexión a internet.";
  return "Error al crear la cuenta. Inténtalo de nuevo.";
}

/* ── Email normalization ──────────────────────────────────── */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const allRulesPassed = strength.passed === strength.total;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const rawEmail = formData.get("email") as string;
    const email = normalizeEmail(rawEmail);
    const pw = formData.get("password") as string;
    const displayName = (formData.get("display_name") as string).trim();

    /* Client-side validations */
    if (displayName.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError(
        "El correo electrónico no es válido. Comprueba que esté bien escrito.",
      );
      setLoading(false);
      return;
    }

    if (!allRulesPassed) {
      setError("La contraseña no cumple todos los requisitos de seguridad.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        data: {
          display_name: displayName,
          role: "seller",
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
    } else if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      setError("Ya existe una cuenta con este correo electrónico.");
      setLoading(false);
    } else if (data.session) {
      // Email confirmation disabled in Supabase → direct login
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation required
      setEmailSent(email);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-flamencalia-albero-pale rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" className="w-8 h-8 text-flamencalia-red" />
        </div>
        <h1 className="font-serif text-xl font-bold text-flamencalia-black mb-2">
          Revisa tu correo
        </h1>
        <p className="text-sm text-neutral-500 mb-4">
          Hemos enviado un enlace de confirmación a{" "}
          <span className="font-semibold text-flamencalia-black">
            {emailSent}
          </span>
        </p>
        <p className="text-xs text-neutral-400 mb-6">
          Haz clic en el enlace del correo para activar tu cuenta y empezar a
          usar Flamencalia.
        </p>
        <button
          onClick={() => setEmailSent("")}
          className="text-sm text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors"
        >
          ← Volver al registro
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-center mb-1 text-flamencalia-black">
        Crear Cuenta
      </h1>
      <p className="text-sm text-neutral-400 text-center mb-6">
        Únete a Flamencalia
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Nombre
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            minLength={2}
            placeholder="Tu nombre"
            className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-flamencalia-black/80 mb-1.5"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mín. 8 caracteres, mayúscula, número..."
              className="w-full border border-flamencalia-albero-pale rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-flamencalia-cream/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-flamencalia-black/40 hover:text-flamencalia-black/70 transition-colors"
              tabIndex={-1}
            >
              <Icon
                name={showPassword ? "eyeOff" : "eye"}
                className="w-4.5 h-4.5"
              />
            </button>
          </div>

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {/* Strength bar */}
              <div className="flex gap-1">
                {Array.from({ length: strength.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength.passed
                        ? strength.passed <= 2
                          ? "bg-red-400"
                          : strength.passed <= 3
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p
                className={`text-xs font-medium ${
                  strength.passed <= 2
                    ? "text-red-500"
                    : strength.passed <= 3
                      ? "text-amber-500"
                      : strength.passed < strength.total
                        ? "text-amber-500"
                        : "text-emerald-600"
                }`}
              >
                {strength.passed <= 2
                  ? "Débil"
                  : strength.passed <= 3
                    ? "Regular"
                    : strength.passed < strength.total
                      ? "Casi lista"
                      : "Segura ✓"}
              </p>
              {/* Individual rules */}
              <ul className="grid grid-cols-1 gap-0.5">
                {strength.rules.map((rule) => (
                  <li
                    key={rule.key}
                    className={`text-xs flex items-center gap-1.5 ${
                      rule.ok ? "text-emerald-600" : "text-neutral-400"
                    }`}
                  >
                    <Icon
                      name={rule.ok ? "check" : "close"}
                      className="w-3 h-3 shrink-0"
                    />
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (password.length > 0 && !allRulesPassed)}
          className="w-full bg-flamencalia-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-neutral-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-flamencalia-red hover:text-flamencalia-red-dark transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
