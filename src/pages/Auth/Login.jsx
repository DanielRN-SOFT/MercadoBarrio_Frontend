import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { MdOutlineVisibility } from "react-icons/md";

const Login = () => {
  const [visibility, setVisibily] = useState(false);
  return (
    <form className="flex flex-col gap-4">
      <div className="form-control w-full">
        <Label label={"Correo electrónico"} />
        <Input placeholder={"ejemplo@correo.com"} type={"email"} />
      </div>
      <div className="form-control w-full">
        <div className="flex justify-between items-center pb-1">
          <Label id={"password-input"} label={"Contraseña"} />
          <a
            className="link link-hover font-label-sm text-label-sm text-primary"
            href="#"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative">
          <Input
            id={"password-input"}
            placeholder={"••••••••"}
            type={visibility ? "text" : "password"}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            onClick={(e) => setVisibily(!visibility)}
            type="button"
          >
            <MdOutlineVisibility className="text-2xl cursor-pointer" />
          </button>
        </div>
      </div>
      <button className="btn w-full mt-2 font-label-md text-label-md normal-case h-12 bg-primary-container text-on-primary hover:bg-primary">
        Iniciar sesión
      </button>
    </form>
  );
};

export default Login;
