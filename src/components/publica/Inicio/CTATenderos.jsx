import { IoStorefrontSharp } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "573XXXXXXXXX"; // cambia por tu número
const WHATSAPP_MSG = encodeURIComponent("Hola, quiero registrar mi tienda en MercadoBarrio.");

const CTATenderos = () => {
  return (
    <section className="py-12 px-margin-mobile md:px-margin-desktop">
      <div className="bg-primary-container rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <IoStorefrontSharp className="text-3xl text-white" />
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-white mb-1">
              ¿Tienes una tienda de barrio?
            </h3>
            <p className="text-white/80 font-body-md text-body-md">
              Contáctanos para registrarla y darle presencia digital a tu negocio.
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-white text-primary hover:bg-white/90 gap-2 shrink-0"
        >
          <FaWhatsapp className="text-xl text-green-500" />
          Contáctanos por WhatsApp
        </a>
      </div>
    </section>
  );
};

export default CTATenderos;