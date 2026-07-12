import React, { useState, useEffect } from "react";
import { IoStorefrontSharp } from "react-icons/io5";

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/products/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo; // ya es una URL absoluta
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
};

const Productos = ({ producto }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imagenUrl = getPhotoUrl(producto.photo);

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [producto.photo]);

  return (
    <div
      key={producto.id}
      className="card bg-base-100 border border-base-300 hover:shadow-sm transition-shadow"
    >
      <div className="h-32 bg-base-200 overflow-hidden relative">
        {imagenUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-spinner loading-sm text-primary" />
              </div>
            )}
            <img
              src={imagenUrl}
              alt={producto.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoStorefrontSharp className="text-4xl text-base-300" />
          </div>
        )}
      </div>
      <div className="card-body p-3 gap-1">
        <h4 className="font-semibold text-sm text-on-surface leading-tight">
          {producto.name}
        </h4>
        <span className="badge badge-ghost badge-sm">
          {producto.productCategory.name}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span className="text-primary font-bold text-sm">
            ${Number(producto.price).toLocaleString("es-CO")}
            <span className="text-on-surface/40 font-normal text-xs">
              {" "}
              / {producto.unitOfMeasure.name}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`badge badge-sm text-white ${producto.currentStock <= producto.lowStockThreshold ? "badge-error" : "badge-success"}`}
          >
            {producto.currentStock > 0 ? "En existencia" : "Sin existencias"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Productos;
