import React from "react";
import Label from "../../components/ui/Label";
import { Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Register = () => {
  return (
    <>
      <form className="space-y-4" onsubmit="event.preventDefault();">
        <div className="form-control w-full">
          <Label id={"nombre"} label={"Nombre completo"} />
          <Input id={"nombre"} placeholder={"Ej. Juan Pérez"} type={"text"} />
        </div>
        <div className="form-control w-full">
          <Label id={"correo"} label={"Correo electrónico"} />
          <Input
            id={"correo"}
            placeholder={"ejemplo@correo.com"}
            type={"email"}
          />
        </div>
        <div className="form-control w-full">
          <Label id={"telefono"} label={"Telefono"} />
          <Input id={"telefono"} placeholder={"3117895678"} type={"tel"} />
        </div>
        <div className="form-control w-full">
          <Label id={"password"} label={"Contraseña"} />
          <Input id={"password"} type={"password"} placeholder={"••••••••"} />
        </div>
        <Button mensaje={"Crear cuenta"} />
      </form>

      <div className="text-center flex flex-col gap-4">
        <p className="font-body-md text-body-md text-on-surface-variant">
          ¿Ya tienes una cuenta?
          <Link
            className="font-label-md text-label-md text-primary font-bold hover:underline ml-1"
            to={"/"}
          >
            iniciar sesión
          </Link>
        </p>
      </div>
    </>
  );
};

export default Register;
