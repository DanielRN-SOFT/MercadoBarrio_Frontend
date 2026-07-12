import { useEffect, useState } from "react";
import {
  IoSearchSharp,
  IoStorefrontSharp,
  IoStatsChartSharp,
} from "react-icons/io5";

const pasos = [
  {
    icon: <IoSearchSharp className="text-3xl" />,
    titulo: "Busca tu barrio",
    descripcion: "Encuentra tiendas cerca de ti por categoría o nombre.",
  },
  {
    icon: <IoStorefrontSharp className="text-3xl" />,
    titulo: "Encuentra la tienda",
    descripcion: "Consulta el perfil, horario y ubicación de cada negocio.",
  },
  {
    icon: <IoStatsChartSharp className="text-3xl" />,
    titulo: "Consulta el stock",
    descripcion: "Ve los productos disponibles en tiempo real antes de ir.",
  },
];

const ComoFunciona = () => {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative py-20 px-margin-mobile md:px-margin-desktop overflow-hidden">
      <style>{`
        @keyframes drawPath {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Textura de puntos, misma familia visual del hero/auth */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: "var(--outline-variant, #9199a1)",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-xl h-144 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="text-center mb-14 max-w-lg mx-auto">
        <span className="badge badge-primary badge-outline mb-4">
          Simple y rápido
        </span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
          ¿Cómo funciona{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-tr from-primary to-secondary">
            MercadoBarrio?
          </span>
        </h3>
        <p className="mt-3 font-body-sm text-body-sm text-on-surface/60">
          De la búsqueda a la puerta de la tienda, en tres pasos.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Línea de ruta conectando los pasos (solo desktop) */}
        <svg
          className="hidden md:block absolute top-7 left-0 w-full h-4 z-0"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
        >
          <line
            x1="16"
            y1="2"
            x2="84"
            y2="2"
            className="stroke-primary/30"
            strokeWidth="0.5"
            strokeDasharray="2 2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: drawn ? 0 : 1000,
              transition: "stroke-dashoffset 1.4s ease-out 0.2s",
            }}
          />
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {pasos.map((paso, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center text-center"
              style={{
                animation: `fadeUp 0.6s ease-out ${i * 0.15}s both`,
              }}
            >
              {/* Ícono en aro, mismo motivo del logo del auth */}
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-md ring-4 ring-background transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg">
                  {paso.icon}
                </div>
                {/* Número de paso, como una etiqueta de puesto */}
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center ring-2 ring-background">
                  {i + 1}
                </span>
              </div>

              <div className="card bg-surface-container-lowest border border-outline-variant/50 p-6 gap-2 w-full transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:-translate-y-1">
                <h4 className="font-title-md text-title-md text-on-surface">
                  {paso.titulo}
                </h4>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  {paso.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
