import React, { useState, useEffect } from "react";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { IoStorefrontSharp } from "react-icons/io5";
import { MdLocationCity } from "react-icons/md";
import { Link } from "react-router-dom";

// Construye la URL completa de la imagen a partir de la ruta relativa que
// devuelve el backend (ej: "/uploads/products/archivo.png")
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo; // ya es una URL absoluta
  return `${import.meta.env.VITE_BACKEND_URL}${photo}`;
};

const ProductosResultado = ({ producto }) => {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const fotoUrl = getPhotoUrl(producto.photo);
  const logoUrl = getPhotoUrl(producto.store?.logo);

  useEffect(() => {
    setImgError(false);
  }, [producto.photo]);

  useEffect(() => {
    setLogoError(false);
  }, [producto.store?.logo]);

  return (
    <Link
      key={producto.id}
      to={`/tiendas/${producto.store.id}`}
      className="card bg-base-100 border border-base-300 hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="card-body p-4">
        <div className="flex gap-4">
          {/* Foto producto */}
          <div className="w-20 h-20 rounded-xl bg-base-200 overflow-hidden shrink-0">
            {fotoUrl && !imgError ? (
              <img
                src={fotoUrl}
                alt={producto.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoStorefrontSharp className="text-3xl text-base-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {producto.name}
                </h3>
                <span className="badge badge-ghost badge-sm mt-0.5">
                  {producto.productCategory.name}
                </span>
              </div>
              <span className="text-primary font-bold text-base shrink-0">
                ${Number(producto.price).toLocaleString("es-CO")}
                <span className="text-on-surface/40 font-normal text-xs">
                  {" "}
                  / {producto.unitOfMeasure.name}
                </span>
              </span>
            </div>

            {/* Stock */}
            <div className="mt-2">
              <span
                className={`badge badge-sm text-white ${
                  producto.currentStock <= producto.lowStockThreshold
                    ? "badge-warning"
                    : "badge-success"
                }`}
              >
                {producto.currentStock <= producto.lowStockThreshold
                  ? `Poco stock (${producto.currentStock})`
                  : "En existencia"}
              </span>
            </div>

            {/* Tienda */}
            <div className="mt-3 pt-3 border-t border-base-200 flex flex-wrap gap-3 items-center">
              {logoUrl && !logoError && (
                <div className="w-6 h-6 rounded overflow-hidden bg-base-200 shrink-0">
                  <img
                    src={logoUrl}
                    alt={producto.store.name}
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="font-medium text-sm text-on-surface">
                {producto.store.name}
              </span>
              {producto.store.neighborhood && (
                <div className="flex items-center gap-1 text-xs text-on-surface/50">
                  <MdLocationCity className="text-primary" />
                  {producto.store.neighborhood}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-on-surface/50">
                <FaLocationDot className="text-primary" />
                {producto.store.address}
              </div>
              {producto.store.phone && (
                <div className="flex items-center gap-1 text-xs text-on-surface/50">
                  <FaPhone className="text-primary" />
                  {producto.store.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductosResultado;
