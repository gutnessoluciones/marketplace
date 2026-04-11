import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatConversation } from "@/components/social/chat-conversation";

export const metadata = { title: "Chat — Flamencalia" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <ChatConversation conversationId={id} userId={user.id} />;
}
