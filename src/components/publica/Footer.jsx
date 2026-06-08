import React from "react";

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center py-8 w-full border-t border-outline-variant bg-surface-container-low  mt-12">
      <div className="max-w-max-width w-full px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-headline-md font-headline-md text-primary">
            MercadoBarrio
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Tu comunidad, tus tiendas.
          </p>
        </div>
        <div className="flex gap-8">
          <a
            className="text-label-sm font-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all"
            href="#"
          >
            Privacidad
          </a>
          <a
            className="text-label-sm font-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all"
            href="#"
          >
            Términos
          </a>
          <a
            className="text-label-sm font-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all"
            href="#"
          >
            Ayuda
          </a>
          <a
            className="text-label-sm font-label-sm text-on-surface-variant hover:underline hover:text-primary transition-all"
            href="#"
          >
            Contacto
          </a>
        </div>
        <p className="text-label-sm font-label-sm text-on-surface-variant opacity-70">
          © 2024 MercadoBarrio.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
