import React from "react";
import { MdOutlineStorefront } from "react-icons/md";

const HeaderLista = ({ loading, tiendas }) => {
  return (
    <div className="px-4 py-3 border-b border-outline-variant bg-primary-container shrink-0 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MdOutlineStorefront className="text-2xl text-on-primary-container" />

        <h3 className="text-label-md font-label-md text-on-primary-container uppercase tracking-wider">
          {loading
            ? "Buscando..."
            : `${tiendas.length} tienda${tiendas.length !== 1 ? "s" : ""}`}
        </h3>
      </div>
      {loading && (
        <span className="loading loading-dots loading-xs text-primary" />
      )}
    </div>
  );
};

export default HeaderLista;
