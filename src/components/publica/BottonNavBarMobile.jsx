import React from "react";

const BottonNavBarMobile = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-surface dark:bg-surface-container pb-safe border-t border-outline-variant dark:border-outline">
      <button className="flex flex-col items-center justify-center bg-secondary-container dark:bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:opacity-80 transition-opacity">
        <span
          className="material-symbols-outlined"
          data-icon="home"
          style={{
            fontVariationSettings: "'FILL' 1",
          }}
        >
          home
        </span>
        <span className="text-label-sm font-label-sm">Inicio</span>
      </button>
      <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim px-4 py-1 hover:text-primary active:opacity-80 transition-opacity">
        <span className="material-symbols-outlined" data-icon="map">
          map
        </span>
        <span className="text-label-sm font-label-sm">Mapa</span>
      </button>
      <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim px-4 py-1 hover:text-primary active:opacity-80 transition-opacity">
        <span className="material-symbols-outlined" data-icon="storefront">
          storefront
        </span>
        <span className="text-label-sm font-label-sm">Tiendas</span>
      </button>
      <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim px-4 py-1 hover:text-primary active:opacity-80 transition-opacity">
        <span className="material-symbols-outlined" data-icon="person">
          person
        </span>
        <span className="text-label-sm font-label-sm">Perfil</span>
      </button>
    </nav>
  );
};

export default BottonNavBarMobile;
