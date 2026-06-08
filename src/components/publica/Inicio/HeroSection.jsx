import { IoSearchCircle } from "react-icons/io5";
const HeroSection = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg mb-2">
        MercadoBarrio
      </h2>
      <p className="font-body-md text-body-md opacity-90 mb-8">
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
  );
};

export default HeroSection;
