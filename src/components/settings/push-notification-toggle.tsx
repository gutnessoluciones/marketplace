"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(!!subscription);
    } catch {
      // Not subscribed
    }
    setLoading(false);
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn("VAPID key not configured");
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
    setLoading(false);
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl text-sm text-neutral-400">
        <Icon name="bell" className="w-5 h-5" />
        Tu navegador no soporta notificaciones push
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${subscribed ? "bg-flamencalia-red/10 text-flamencalia-red" : "bg-neutral-100 text-neutral-400"}`}
        >
          <Icon name="bell" className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-700">
            Notificaciones Push
          </p>
          <p className="text-xs text-neutral-400">
            {subscribed
              ? "Recibirás avisos de mensajes, ofertas y pedidos"
              : "Activa para recibir avisos en tiempo real"}
          </p>
        </div>
      </div>
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          subscribed ? "bg-flamencalia-red" : "bg-neutral-200"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            subscribed ? "left-6.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
