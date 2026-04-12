import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Icon } from "@/components/icons";

const SUBJECT_MAP: Record<string, { label: string; color: string }> = {
  compra: { label: "Compra", color: "bg-blue-50 text-blue-700" },
  venta: { label: "Venta", color: "bg-emerald-50 text-emerald-700" },
  cuenta: { label: "Cuenta", color: "bg-purple-50 text-purple-700" },
  pagos: { label: "Pagos", color: "bg-amber-50 text-amber-700" },
  sugerencia: {
    label: "Sugerencia",
    color: "bg-flamencalia-albero-pale/30 text-flamencalia-red-dark",
  },
  otro: { label: "Otro", color: "bg-neutral-100 text-neutral-600" },
};

async function markAsRead(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await supabaseAdmin
    .from("contact_messages")
    .update({ read: true })
    .eq("id", id);
  revalidatePath("/flamencadmin-8x9k2m/contacts");
}

async function deleteMessage(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await supabaseAdmin.from("contact_messages").delete().eq("id", id);
  revalidatePath("/flamencadmin-8x9k2m/contacts");
}

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const { data: messages } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const unreadCount = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          Mensajes de contacto
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {messages?.length ?? 0} mensajes · {unreadCount} sin leer
        </p>
      </div>

      {!messages || messages.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center shadow-sm">
          <Icon
            name="message"
            className="w-8 h-8 text-neutral-300 mx-auto mb-3"
          />
          <p className="text-sm text-neutral-400">
            No hay mensajes de contacto
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const subj = SUBJECT_MAP[msg.subject] ?? SUBJECT_MAP.otro;
            return (
              <div
                key={msg.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition ${
                  msg.read
                    ? "border-neutral-100 opacity-70"
                    : "border-flamencalia-albero/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-flamencalia-red shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-flamencalia-black">
                        {msg.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${subj.color}`}
                      >
                        {subj.label}
                      </span>
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-flamencalia-albero hover:underline"
                    >
                      {msg.email}
                    </a>
                    <p className="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p className="mt-2 text-[10px] text-neutral-400">
                      {new Date(msg.created_at).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!msg.read && (
                      <form action={markAsRead}>
                        <input type="hidden" name="id" value={msg.id} />
                        <button
                          type="submit"
                          className="p-2 rounded-lg text-neutral-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
                          title="Marcar como leído"
                        >
                          <Icon name="check" className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(subj.label)} — Flamencalia`}
                      className="p-2 rounded-lg text-neutral-400 hover:bg-blue-50 hover:text-blue-600 transition"
                      title="Responder por email"
                    >
                      <Icon name="message" className="w-4 h-4" />
                    </a>
                    <form action={deleteMessage}>
                      <input type="hidden" name="id" value={msg.id} />
                      <button
                        type="submit"
                        className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Eliminar"
                      >
                        <Icon name="x" className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
