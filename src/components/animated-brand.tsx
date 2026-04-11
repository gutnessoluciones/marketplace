"use client";

export default function AnimatedBrand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <h1 className={className}>
      {"FL"}
      <span className="inline-block brand-a-spin">A</span>
      {"MENC"}
      <span className="inline-block brand-a-spin">A</span>
      {"LI"}
      <span className="inline-block brand-a-spin">A</span>
    </h1>
  );
}
