import { Icon } from "@/components/icons";

const BADGE_CONFIG: Record<
  string,
  { label: string; icon: string; className: string }
> = {
  verified: {
    label: "Verificada",
    icon: "check",
    className: "text-blue-500",
  },
  top_seller: {
    label: "Top Seller",
    icon: "flame",
    className: "text-flamencalia-red",
  },
  creator: {
    label: "Creadora",
    icon: "sparkle",
    className: "text-flamencalia-albero",
  },
};

export function VerificationBadge({
  status,
  size = "sm",
}: {
  status: string | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  if (!status || status === "none" || status === "pending") return null;

  const config = BADGE_CONFIG[status];
  if (!config) return null;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center shrink-0 ${config.className}`}
      title={config.label}
    >
      <Icon name={config.icon} className={sizeClasses[size]} />
    </span>
  );
}
