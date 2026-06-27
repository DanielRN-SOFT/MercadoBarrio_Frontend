import React from "react";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdLocationCity } from "react-icons/md";

const InfoPrincipal = ({tienda}) => {
  return (
    <div className="flex gap-4 items-start">
      {tienda.logo && (
        <div className="w-16 h-16 rounded-xl border-2 border-base-300 overflow-hidden shrink-0 bg-base-100">
          <img
            src={tienda.logo}
            alt={`Logo ${tienda.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-on-surface">{tienda.name}</h1>
          {tienda.storeCategory && (
            <span className="badge badge-primary badge-outline">
              {tienda.storeCategory.name}
            </span>
          )}
        </div>
        {tienda.description && (
          <p className="text-on-surface/60 text-sm mt-1">
            {tienda.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-3">
          {tienda.neighborhood && (
            <div className="flex items-center gap-1 text-sm text-on-surface/60">
              <MdLocationCity className="text-primary" />
              {tienda.neighborhood}
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-on-surface/60">
            <FaLocationDot className="text-primary" />
            {tienda.address}
          </div>
          {tienda.phone && (
            <div className="flex items-center gap-1 text-sm text-on-surface/60">
              <FaPhone className="text-primary" />
              {tienda.phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPrincipal;
