import { Link } from "react-router-dom";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useState } from "react";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import fetchCliente from "../../config/fetchCliente";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { toasts, addToast, removeToast } = useToast();
  async function handleSubmit(e) {
    e.preventDefault();
    if (email.trim() === "") {
      console.log("esta vacio..");
      addToast({ message: "El email es obligatorio", type: "error" });
      return;
    }

    try {
      const response = await fetchCliente("/auth/forgot-password", {
        method: "POST",
        body: {email}
      });

      addToast({ message: response.message, type: "success" });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        id="recoveryForm"
      >
        <div className="form-control w-full">
          <Label label={"Correo electrónico"} />
          <div className="relative flex items-center">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={"ejemplo@correo.com"}
              type={"email"}
            />
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default ForgotPassword;
