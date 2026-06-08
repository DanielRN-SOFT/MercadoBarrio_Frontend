import { Link } from "react-router-dom";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const ForgotPassword = () => {
  return (
    <>
      <form className="flex flex-col gap-4" id="recoveryForm">
        <div className="form-control w-full">
          <Label label={"Correo electrónico"} />
          <div className="relative flex items-center">
            <Input placeholder={"ejemplo@correo.com"} type={"email"} />
          </div>
        </div>
        <Button mensaje={"Enviar instrucciones"} />
      </form>

      <div className="text-center flex flex-col gap-4">
        <p className="font-body-md text-body-md text-on-surface-variant">
          ¿Recordaste tú contraseña?
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

export default ForgotPassword;
