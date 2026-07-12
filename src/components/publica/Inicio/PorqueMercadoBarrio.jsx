import { useEffect, useState } from "react";
import {
  IoFlashSharp,
  IoLocationSharp,
  IoTrendingUpSharp,
} from "react-icons/io5";

const beneficios = [
  {
    icon: <IoLocationSharp className="text-3xl" />,
    titulo: "Enfoque hiperlocal",
    descripcion:
      "Conectamos tiendas con su comunidad más cercana, no con todo el país.",
    resaltado: null,
  },
  {
    icon: <IoFlashSharp className="text-3xl" />,
    titulo: "Stock en tiempo real",
    descripcion:
      "Los tenderos actualizan su inventario y tú lo ves al instante.",
    resaltado: "en-vivo",
  },
  {
    icon: <IoTrendingUpSharp className="text-3xl" />,
    titulo: "Trazabilidad de ventas",
    descripcion:
      "Cada venta actualiza el inventario automáticamente, sin hojas de cálculo.",
    resaltado: null,
  },
];

// Movimientos simulados para el marquee. En producción, reemplazar
// por datos reales (últimas actualizaciones de inventario, por ej.).
const MOVIMIENTOS = [
  "🥬 Fruver Doña Lucía actualizó stock",
  "🥖 Panadería San José agregó 12 productos",
  "🧀 Lácteos El Establo vendió 3 unidades",
  "🥩 Carnicería Central abrió ahora",
  "☕ Café del Barrio actualizó precios",
  "🍯 Miel del Valle está en línea",
];

const PorQueMercadoBarrio = () => {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative py-16 px-margin-mobile md:px-margin-desktop bg-primary-container overflow-hidden">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Textura de puntos, coherente con el resto de la página */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: "var(--on-primary-container, #1d1b16)",
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center mb-8">
        <h3 className="font-headline-md text-headline-md text-on-primary-container">
          ¿Por qué MercadoBarrio?
        </h3>
        <p className="mt-2 text-on-primary-container/70 font-body-md text-body-md">
          Una herramienta real para el comercio local
        </p>
      </div>

      {/* Marquee de actividad en vivo, mismo lenguaje del hero */}
      <div className="relative max-w-3xl mx-auto mb-12 flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 shrink-0 rounded-full bg-on-primary-container/10 px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-primary-container/80 whitespace-nowrap">
            En vivo
          </span>
        </span>

        <div className="overflow-hidden mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div
            className="flex gap-3 w-max"
            style={{ animation: "marquee 24s linear infinite" }}
          >
            {[...MOVIMIENTOS, ...MOVIMIENTOS].map((m, i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full bg-primary backdrop-blur-sm ring-1 ring-on-primary-container/10 px-3 py-1 font-label-sm text-label-sm text-on-primary-container/80"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {beneficios.map((b, i) => (
          <div
            key={i}
            className="group relative flex flex-col gap-4 p-6 bg-surface-container-lowest rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ animation: `fadeUp 0.6s ease-out ${i * 0.15}s both` }}
          >
            {b.resaltado === "en-vivo" && (
              <span className="absolute -top-2.5 right-5 flex items-center gap-1 rounded-full bg-primary text-on-primary px-2.5 py-0.5 font-label-sm text-label-sm shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary motion-safe:animate-pulse" />
                En vivo
              </span>
            )}

            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              {b.icon}
            </div>

            <div>
              <h4 className="font-title-md text-title-md text-on-surface mb-1">
                {b.titulo}
              </h4>
              <p className="text-on-surface-variant font-body-sm text-body-sm">
                {b.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PorQueMercadoBarrio;
