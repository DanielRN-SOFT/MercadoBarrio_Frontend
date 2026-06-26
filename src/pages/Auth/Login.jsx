import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { MdOutlineVisibility } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import fetchCliente from "../../config/fetchCliente";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [visibility, setVisibily] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toasts, addToast, removeToast } = useToast();
  const { setAuth } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if ([email.trim(), password.trim()].includes("")) {
        addToast({
          message: "Todos los campos son obligatorios",
          type: "error",
        });
        return;
      }

      const response = await fetchCliente("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (response.id) {
        setAuth(response);
        addToast({
          message: "Login exitoso",
          type: "success",
        });

        navigate("/panel");
      }
    } catch (error) {
      if (error.statusCode === 500) {
        addToast({
          message: error.message,
          type: "error",
        });
      }
      console.log(error);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-control w-full">
          <Label label={"Correo electrónico"} />
          <Input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder={"ejemplo@correo.com"}
            type={"email"}
          />
        </div>
        <div className="form-control w-full">
          <div className="flex justify-between items-center pb-1">
            <Label id={"password-input"} label={"Contraseña"} />
            <Link
              className="link link-hover font-label-sm text-label-sm text-primary"
              to="/olvide-password"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        <Button mensaje={"Iniciar sesión"} />
      </form>

      <div className="divider font-label-sm text-label-sm text-outline-variant uppercase tracking-widest">
        o
      </div>
      <div className="text-center flex flex-col gap-4">
        <p className="font-body-md text-body-md text-on-surface-variant">
          ¿No tienes una cuenta?
          <Link
            className="font-label-md text-label-md text-primary font-bold hover:underline ml-1"
            to={"/register"}
          >
            Regístrate
          </Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Login;
