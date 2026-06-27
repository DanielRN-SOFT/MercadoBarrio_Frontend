import React from "react";
import { IoArrowBackSharp, IoStorefrontSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const Hero = ({ tienda }) => {
  return (
    <div className="relative h-56 md:h-72 bg-base-200 overflow-hidden">
      {tienda.photo ? (
        <img
          src={tienda.photo}
          alt={tienda.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IoStorefrontSharp className="text-8xl text-base-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <Link
        to="/tiendas"
        className="absolute top-4 left-4 btn btn-sm btn-primary text-white gap-1"
      >
        <IoArrowBackSharp />
        Volver
      </Link>
      {tienda.status === "Active" && (
        <span className="absolute top-4 right-4 badge badge-success text-white font-bold uppercase tracking-wider">
          Abierto
        </span>
      )}
    </div>
  );
};

export default Hero;
