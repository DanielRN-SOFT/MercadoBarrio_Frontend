import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAVLINKS = [
  { name: "Inicio", to: "/", icon: "home", fill: true },
  { name: "Mapa", to: "/mapa", icon: "map", fill: false },
  { name: "Tiendas", to: "/tiendas", icon: "storefront", fill: false },
  { name: "Buscar", to: "/buscar", icon: "search", fill: false },
  { name: "Perfil", to: "/panel/perfil", icon: "person", fill: false },
];

const BottonNavBarMobile = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-surface dark:bg-surface-container pb-safe border-t border-outline-variant dark:border-outline">
      {NAVLINKS.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={
              isActive
                ? "flex flex-col items-center justify-center bg-secondary-container dark:bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:opacity-80 transition-opacity"
                : "flex flex-col items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim px-4 py-1 hover:text-primary active:opacity-80 transition-opacity"
            }
          >
            <span
              className="material-symbols-outlined"
              data-icon={link.icon}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {link.icon}
            </span>
            <span className="text-label-sm font-label-sm">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottonNavBarMobile;
