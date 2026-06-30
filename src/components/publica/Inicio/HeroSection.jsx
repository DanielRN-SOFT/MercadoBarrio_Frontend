import { IoSearchCircle } from "react-icons/io5";

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-105 md:min-h-120 flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <img
        src="/images/hero-mercado3.jpg"
        alt="Tu mercado local"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenido */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-margin-mobile md:px-margin-desktop">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg mb-2 text-white">
          MercadoBarrio
        </h2>
        <p className="font-body-md text-body-md opacity-90 mb-8 text-white">
          Tu mercado local en un click
        </p>
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-surface rounded-full p-1 shadow-lg">
            <IoSearchCircle className="text-primary text-5xl ml-2" />
            <input
              className="rounded-full mx-2 w-full text-on-surface px-4 py-2 font-body-md text-body-md "
              placeholder="¿Qué buscas hoy en tu barrio?"
              type="text"
            />
            <button className="btn btn-primary px-6 py-2 rounded-full font-label-md text-label-md active:scale-95 transition-all ">
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
