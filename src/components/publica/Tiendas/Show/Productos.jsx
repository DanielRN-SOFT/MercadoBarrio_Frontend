import React from 'react'
import { IoStorefrontSharp } from 'react-icons/io5';

const Productos = ({producto}) => {
  return (
    <div
      key={producto.id}
      className="card bg-base-100 border border-base-300 hover:shadow-sm transition-shadow"
    >
      <div className="h-32 bg-base-200 overflow-hidden">
        {producto.photo ? (
          <img
            src={producto.photo}
            alt={producto.name}
            className="w-full h-full object-cover"
          />
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
}

export default Productos