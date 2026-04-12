"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const SIZE_GUIDES: Record<
  string,
  { title: string; description: string; sizes: string[][] }
> = {
  feria: {
    title: "Trajes de Feria",
    description:
      "Medidas orientativas en cm. La talla puede variar según diseñador.",
    sizes: [
      ["Talla", "Pecho", "Cintura", "Cadera", "Largo"],
      ["32", "76", "58", "84", "125"],
      ["34", "80", "62", "88", "127"],
      ["36", "84", "66", "92", "129"],
      ["38", "88", "70", "96", "131"],
      ["40", "92", "74", "100", "133"],
      ["42", "96", "78", "104", "135"],
      ["44", "100", "82", "108", "137"],
      ["46", "104", "86", "112", "139"],
      ["48", "108", "92", "116", "140"],
      ["50", "112", "96", "120", "141"],
      ["52", "116", "100", "124", "142"],
      ["54", "120", "104", "128", "143"],
    ],
  },
  "invitada-flamenca": {
    title: "Invitada Flamenca",
    description: "Medidas orientativas en cm para vestidos de invitada.",
    sizes: [
      ["Talla", "Pecho", "Cintura", "Cadera", "Largo"],
      ["XS", "82", "62", "88", "110"],
      ["S", "86", "66", "92", "112"],
      ["M", "90", "70", "96", "114"],
      ["L", "96", "76", "102", "116"],
      ["XL", "102", "82", "108", "118"],
    ],
  },
  "moda-infantil": {
    title: "Moda Infantil Flamenca",
    description: "Medidas orientativas en cm para trajes de niña/niño.",
    sizes: [
      ["Edad", "Pecho", "Cintura", "Cadera", "Largo"],
      ["2 años", "52", "50", "56", "50"],
      ["4 años", "56", "53", "60", "60"],
      ["6 años", "60", "56", "64", "70"],
      ["8 años", "64", "58", "68", "80"],
      ["10 años", "68", "60", "72", "88"],
      ["12 años", "74", "62", "78", "96"],
      ["14 años", "80", "66", "84", "104"],
    ],
  },
  zapatos: {
    title: "Zapatos Flamencos",
    description: "Equivalencias de tallas de zapato EU.",
    sizes: [
      ["EU", "cm pie", "Tipo"],
      ["35", "22.5", "Mujer"],
      ["36", "23.0", "Mujer"],
      ["37", "23.5", "Mujer"],
      ["38", "24.5", "Mujer"],
      ["39", "25.0", "Mujer"],
      ["40", "25.5", "Mujer"],
      ["41", "26.5", "Mujer/Hombre"],
      ["42", "27.0", "Hombre"],
      ["43", "27.5", "Hombre"],
      ["44", "28.5", "Hombre"],
    ],
  },
  "complementos-flamencos": {
    title: "Complementos Flamencos",
    description: "Guía general para mantones, mantoncillos y abanicos.",
    sizes: [
      ["Artículo", "Medida", "Uso"],
      ["Mantón grande", "140×140 cm", "Vestir / Baile"],
      ["Mantoncillo", "100×100 cm", "Complemento"],
      ["Abanico", "23-27 cm", "Complemento / Baile"],
      ["Flores", "10-15 cm", "Pelo / Pecho"],
      ["Pendientes", "3-8 cm", "Complemento"],
      ["Peineta", "12-20 cm", "Recogido"],
    ],
  },
  equitacion: {
    title: "Equitación",
    description:
      "Medidas orientativas. Consultar con el vendedor para medidas exactas.",
    sizes: [
      ["Talla", "Pecho", "Cintura", "Cadera"],
      ["XS", "84", "66", "90"],
      ["S", "88", "70", "94"],
      ["M", "92", "74", "98"],
      ["L", "96", "78", "102"],
      ["XL", "100", "82", "106"],
      ["XXL", "106", "88", "112"],
    ],
  },
  camino: {
    title: "Camino / Romería",
    description: "Medidas orientativas en cm.",
    sizes: [
      ["Talla", "Pecho", "Cintura", "Cadera"],
      ["S", "86", "66", "92"],
      ["M", "90", "70", "96"],
      ["L", "96", "76", "102"],
      ["XL", "102", "82", "108"],
    ],
  },
};

interface SizeGuideProps {
  category: string;
}

export function SizeGuide({ category }: SizeGuideProps) {
  const [open, setOpen] = useState(false);
  const guide = SIZE_GUIDES[category];

  if (!guide) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-flamencalia-red hover:underline"
      >
        <Icon name="info" className="w-3.5 h-3.5" />
        Guía de tallas
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-flamencalia-black mb-1">
              {guide.title}
            </h2>
            <p className="text-xs text-neutral-500 mb-4">{guide.description}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-flamencalia-albero-pale/50">
                    {guide.sizes[0].map((header) => (
                      <th
                        key={header}
                        className="py-2 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.sizes.slice(1).map((row, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0 ? "bg-flamencalia-cream/30" : "bg-white"
                      }
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`py-2 px-3 ${j === 0 ? "font-semibold text-flamencalia-black" : "text-neutral-600"}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-neutral-400 mt-4 text-center">
              Estas medidas son orientativas. Recomendamos consultar con el
              vendedor antes de comprar.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
