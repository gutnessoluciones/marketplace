"use client";

/* M con V central corta (solo hasta el medio), estilo serif como la marca */
function BrandM({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 82 100"
      fill="currentColor"
      className={`inline-block ${className}`}
      style={{
        height: "0.75em",
        width: "auto",
        verticalAlign: "baseline",
      }}
      aria-hidden="true"
    >
      {/* Serifas y trazos que imitan Playfair Display pero con V corta */}
      <path d="M1 95V92l7-2V10L1 8V5h14l26 44L67 5h14v3l-7 2v80l7 2v3H63v-3l7-2V15L43 55h-4L12 15v75l7 2v3z" />
    </svg>
  );
}

export default function AnimatedBrand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <h1 className={className}>
      {"FL"}
      <span className="inline-block brand-a-spin">A</span>
      <BrandM />
      {"ENC"}
      <span className="inline-block brand-a-spin">A</span>
      {"LI"}
      <span className="inline-block brand-a-spin">A</span>
    </h1>
  );
}
