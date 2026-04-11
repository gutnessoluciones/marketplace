"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

const PROVINCES = [
  "Todas",
  "Almería",
  "Cádiz",
  "Córdoba",
  "Granada",
  "Huelva",
  "Jaén",
  "Málaga",
  "Sevilla",
];

interface Fair {
  id: string;
  name: string;
  location: string;
  province: string;
  start_date: string;
  end_date: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  is_verified: boolean;
}

export default function FeriasPage() {
  const [fairs, setFairs] = useState<Fair[]>([]);
  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState("Todas");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">(
    "upcoming",
  );

  useEffect(() => {
    fetch("/api/fairs")
      .then((r) => r.json())
      .then((json) => {
        setFairs(json.data || []);
        setLoading(false);
      });
  }, []);

  const now = new Date();

  const filtered = fairs.filter((f) => {
    if (province !== "Todas" && f.province !== province) return false;
    const end = new Date(f.end_date);
    const start = new Date(f.start_date);
    if (timeFilter === "upcoming" && end < now) return false;
    if (timeFilter === "past" && start > now) return false;
    return true;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
    });

  const groupByMonth = (items: Fair[]) => {
    const groups: Record<string, Fair[]> = {};
    for (const fair of items) {
      const key = new Date(fair.start_date).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(fair);
    }
    return groups;
  };

  const grouped = groupByMonth(filtered);

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Ferias de Andalucía
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Calendario completo de ferias y romerías
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1.5 flex-wrap">
            {(["upcoming", "all", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  timeFilter === t
                    ? "bg-flamencalia-black text-white"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {t === "upcoming"
                  ? "Próximas"
                  : t === "past"
                    ? "Pasadas"
                    : "Todas"}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {PROVINCES.map((p) => (
              <button
                key={p}
                onClick={() => setProvince(p)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  province === p
                    ? "bg-flamencalia-red text-white"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-sm text-neutral-400">
              Cargando ferias...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              name="mapPin"
              className="w-12 h-12 text-neutral-300 mx-auto mb-4"
            />
            <p className="text-neutral-500">
              No hay ferias que coincidan con los filtros
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, monthFairs]) => (
              <div key={month}>
                <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthFairs.map((fair) => {
                    const start = new Date(fair.start_date);
                    const end = new Date(fair.end_date);
                    const isActive = now >= start && now <= end;

                    return (
                      <div
                        key={fair.id}
                        className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${
                          isActive
                            ? "border-emerald-200 ring-1 ring-emerald-100"
                            : "border-neutral-100"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Date badge */}
                          <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:w-16 shrink-0">
                            <div className="text-2xl sm:text-3xl font-bold text-flamencalia-red leading-none">
                              {start.getDate()}
                            </div>
                            <div className="text-xs text-neutral-500 uppercase font-medium">
                              {start.toLocaleDateString("es-ES", {
                                month: "short",
                              })}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-sm sm:text-base font-bold text-neutral-800">
                                {fair.name}
                              </h3>
                              {fair.is_verified && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium flex items-center gap-0.5">
                                  <Icon
                                    name="checkCircle"
                                    className="w-3 h-3"
                                  />
                                  Verificada
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-medium animate-pulse">
                                  AHORA
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                              <span className="flex items-center gap-1">
                                <Icon name="mapPin" className="w-3 h-3" />
                                {fair.location}, {fair.province}
                              </span>
                              <span>
                                {formatDate(fair.start_date)} —{" "}
                                {formatDate(fair.end_date)}
                              </span>
                            </div>

                            {fair.description && (
                              <p className="text-xs text-neutral-500 line-clamp-2">
                                {fair.description}
                              </p>
                            )}

                            {fair.website_url && (
                              <a
                                href={fair.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-flamencalia-red hover:underline mt-2"
                              >
                                <Icon name="globe" className="w-3 h-3" />
                                Web oficial
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
