import React from "react";
import Label from "../../components/ui/Label";

const Register = () => {
  return (
    <form className="space-y-4" onsubmit="event.preventDefault();">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-label-md text-label-md">
            Nombre completo
          </span>
        </label>
        <input
          className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md rounded-full border-outline-variant"
          placeholder="Ej. Juan Pérez"
          required
          type="text"
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-label-md text-label-md">
            Correo electrónico
          </span>
        </label>
        <input
          className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md rounded-full border-outline-variant"
          placeholder="nombre@ejemplo.com"
          required
          type="email"
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-label-md text-label-md">
            Teléfono
          </span>
        </label>
        <input
          className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md rounded-full border-outline-variant"
          placeholder="+54 11 1234 5678"
          required
          type="tel"
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-label-md text-label-md">
            Contraseña
          </span>
        </label>
        <input
          className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md rounded-full border-outline-variant"
          id="passwordInput"
          oninput="updateStrength(this.value)"
          placeholder="••••••••"
          required
          type="password"
        />
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-label-sm font-label-sm text-on-surface-variant">
              Fortaleza de la contraseña
            </span>
            <span
              className="text-label-sm font-label-sm text-primary"
              id="strengthText"
            >
              Débil
            </span>
          </div>
          <progress
            className="progress progress-primary w-full h-2"
            id="passwordStrength"
            max="100"
            value="20"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="label">
          <span className="label-text font-label-md text-label-md">
            ¿Cómo usarás MercadoBarrio?
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="card card-bordered border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors p-3 flex flex-col items-center gap-2 text-center group"
            id="roleOwner"
            onclick="selectRole('owner')"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant group-[.border-primary]:text-primary"
              data-icon="inventory_2"
            >
              inventory_2
            </span>
            <span className="font-label-sm text-label-sm">
              Soy propietario de tienda
            </span>
          </div>
          <div
            className="card card-bordered border-primary cursor-pointer hover:bg-surface-container-low transition-colors p-3 flex flex-col items-center gap-2 text-center group bg-surface-container-low"
            id="roleCustomer"
            onclick="selectRole('customer')"
          >
            <span
              className="material-symbols-outlined text-primary"
              data-icon="person"
            >
              person
            </span>
            <span className="font-label-sm text-label-sm">Soy cliente</span>
          </div>
        </div>
      </div>
      <button className="btn btn-primary w-full bg-primary-container text-on-primary hover:bg-primary border-none mt-4 font-label-md text-label-md h-12">
        Crear cuenta
      </button>
    </form>
  );
};

export default Register;
