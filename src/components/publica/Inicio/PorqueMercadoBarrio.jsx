import {
  IoFlashSharp,
  IoLocationSharp,
  IoTrendingUpSharp,
} from "react-icons/io5";

const beneficios = [
  {
    icon: <IoLocationSharp className="text-3xl text-primary" />,
    titulo: "Enfoque hiperlocal",
    descripcion:
      "Conectamos tiendas con su comunidad más cercana, no con todo el país.",
  },
  {
    icon: <IoFlashSharp className="text-3xl text-primary" />,
    titulo: "Stock en tiempo real",
    descripcion:
      "Los tenderos actualizan su inventario y tú lo ves al instante.",
  },
  {
    icon: <IoTrendingUpSharp className="text-3xl text-primary" />,
    titulo: "Trazabilidad de ventas",
    descripcion:
      "Cada venta actualiza el inventario automáticamente, sin hojas de cálculo.",
  },
];

const PorQueMercadoBarrio = () => {
  return (
    <section className="py-12 px-margin-mobile md:px-margin-desktop bg-primary-container">
      <h3 className="font-headline-md text-headline-md text-on-primary text-center mb-2">
        ¿Por qué MercadoBarrio?
      </h3>
      <p className="text-center text-on-primary/60 font-body-md text-body-md mb-8">
        Una herramienta real para el comercio local
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {beneficios.map((b, i) => (
          <div
            key={i}
            className="flex gap-4 p-6 bg-base-100 rounded-xl border border-base-300"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {b.icon}
            </div>
            <div>
              <h4 className="font-title-md text-title-md text-on-surface mb-1">
                {b.titulo}
              </h4>
              <p className="text-on-surface/60 font-body-sm text-body-sm">
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
