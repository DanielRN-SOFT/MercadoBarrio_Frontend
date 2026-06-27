import React, { useEffect, useRef, useState } from "react";
import Label from "../../components/ui/Label";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useToast from "../../hooks/useToast";
import fetchCliente from "../../config/fetchCliente";
import ToastContainer from "../../components/ui/ToastContainer";
import { MdOutlineVisibility } from "react-icons/md";

const NuevaPassword = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [visibility, setVisibily] = useState(false);
  const [password, setPassword] = useState("");
  const { toasts, addToast, removeToast } = useToast();
  const [tokenValido, setTokenValido] = useState(false);
  const [passwordModificado, setPasswordModificado] = useState(false);
  const ejecutado = useRef(false);
  const { token } = params;
  console.log(token);

  useEffect(() => {
    if (ejecutado.current) return;
    ejecutado.current = true;

    const comprobarToken = async () => {
      try {
        const response = await fetchCliente(`/auth/comprobar-token/${token}`);
        if (response) {
          setTokenValido(true);
          addToast({ message: "Ingresa tu nueva contraseña", type: "success" });
        }
      } catch (error) {
        console.log(error);
        addToast({ message: "Hubo un error", type: "error" });
      }
    };

    comprobarToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.trim() == "") {
      addToast({
        message: "El campo de nueva contraseña es obligatorio",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      addToast({
        message: "La contraseña debe tener minimo 8 caracteres",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetchCliente(`/auth/forgot-password/${token}`, {
        method: "POST",
        body: { password },
      });

      addToast({
        message: response.message,
        type: "success",
      });

      setPasswordModificado(true);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      addToast({
        message: "Hubo un error",
        type: "error",
      });
    }
  };
  return (
    <>
      {tokenValido && (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button mensaje={"Guardar contraseña"} />
        </form>
      )}

      {!tokenValido && (
        <div className="card bg-secondary text-neutral-content w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">!Error!</h2>
            <p>Actualmente su token no es valido o expiró</p>
            <div className="card-actions justify-end">
              <Link to={"/"} className="btn btn-primary">
                Volver al login
              </Link>
            </div>
          </div>
        </div>
      )}

      {passwordModificado && (
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
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default NuevaPassword;
