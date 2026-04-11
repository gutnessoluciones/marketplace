"use client";

export default function AnimatedBrand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <h1 className={className}>
      <span className="inline-block brand-f-dance">F</span>
      {"LAMENCALIA"}
    </h1>
  );
}
