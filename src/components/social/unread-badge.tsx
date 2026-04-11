"use client";

import { useState, useEffect } from "react";

export function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/chat");
        if (!res.ok) return;
        const data = await res.json();
        setCount(data.unreadCount ?? 0);
      } catch {
        // silent
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto bg-flamencalia-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}
