import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import fetchCliente from "../../config/fetchCliente";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [visibility, setVisibility] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ([email.trim(), password.trim()].includes("")) {
      addToast({ message: "Todos los campos son obligatorios", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchCliente("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (response.id) {
        setAuth(response);
        localStorage.setItem("auth", JSON.stringify(response));
        addToast({ message: "Inicio de sesión exitoso", type: "success" });

        if (response.role === "Admin") {
          navigate("/panel/admin");
        } else if (response.role === "Grocer") {
          navigate("/panel/tienda");
        } else {
          navigate("/panel");
        }
      }
    } catch (error) {
      const status = error.statusCode ?? error.status;

      if (status === 401) {
        addToast({ message: "Correo o contraseña incorrectos", type: "error" });
      } else if (status === 403) {
        addToast({
          message: "Tu cuenta está inactiva. Contacta al administrador.",
          type: "error",
        });
      } else if (status === 500) {
        addToast({
          message: error.message ?? "Error interno del servidor",
          type: "error",
        });
      } else {
        addToast({
          message: "No se pudo conectar. Intenta de nuevo: " + error,
          type: "error",
        });
      }
    } finally {
      setLoading(false);
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
            disabled={loading}
          />
        </div>

        <div className="form-control w-full">
          <div className="flex justify-between items-center pb-1">
            <Label id={"password-input"} label={"Contraseña"} />
            <Link
              className="link link-hover font-label-sm text-label-sm text-primary"
              to="/auth/olvide-password"
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
              disabled={loading}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              onClick={() => setVisibility(!visibility)}
              type="button"
              aria-label={
                visibility ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {visibility ? (
                <MdOutlineVisibilityOff className="text-2xl cursor-pointer" />
              ) : (
                <MdOutlineVisibility className="text-2xl cursor-pointer" />
              )}
            </button>
          </div>
        </div>

        <Button
          mensaje={loading ? "Ingresando..." : "Iniciar sesión"}
          disabled={loading}
        />
      </form>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default Login;
