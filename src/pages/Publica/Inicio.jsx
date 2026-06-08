import CardProducto from "../../components/publica/Inicio/CardProducto";
import HeroSection from "../../components/publica/Inicio/HeroSection";
import SelectorCategorias from "../../components/publica/Inicio/SelectorCategorias";
import { tiendas } from "../../tiendas";

const Inicio = () => {
  return (
    <main className="pt-16 mx-auto">
      <section className="bg-primary-container text-on-primary py-12 px-margin-mobile md:px-margin-desktop">
        <HeroSection />
      </section>
      <section className="mt-8 px-margin-mobile md:px-margin-desktop">
        <SelectorCategorias />
      </section>
      <section className="mt-8 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Tiendas cercanas
          </h3>
          <button className="text-primary cursor-pointer font-label-md text-label-md hover:underline">
            Ver mapa
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiendas.map((tienda) => (
            <CardProducto key={tienda.id} tienda={tienda} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Inicio;
