"use client";

const LETTERS = "FLAMENCALIA".split("");

export default function AnimatedBrand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <h1 className={className}>
      {LETTERS.map((letter, i) => (
        <span
          key={i}
          className="brand-letter inline-block"
          style={{ animationDelay: `${0.15 + i * 0.08}s` }}
        >
          {letter}
        </span>
      ))}
    </h1>
  );
}
