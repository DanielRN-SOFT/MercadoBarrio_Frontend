import { useState } from "react";
import {
  MdOutlinePersonOutline,
  MdEmail,
  MdPhone,
  MdLock,
  MdSave,
  MdEdit,
} from "react-icons/md";
import ToastContainer from "../../components/ui/ToastContainer";
import useToast from "../../hooks/useToast";
import useAuth from "../../hooks/useAuth";
import fetchCliente from "../../config/fetchCliente";
import Card from "../../components/ui/Card";

const PerfilUsuario = () => {
  const { addToast, toasts, removeToast } = useToast();
  const { auth, setAuth } = useAuth();

  const [form, setForm] = useState({
    name: auth?.name || "",
    email: auth?.email || "",
    phone: auth?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe incluir al menos una mayúscula";
    }
    if (!/[a-z]/.test(password)) {
      return "La contraseña debe incluir al menos una minúscula";
    }
    if (!/[0-9]/.test(password)) {
      return "La contraseña debe incluir al menos un número";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "La contraseña debe incluir al menos un símbolo (ej: !@#$%)";
    }
    return null;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setProfileError("Todos los campos son obligatorios");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetchCliente(`/auth/profile`, {
        method: "PUT",
        body: form,
      });
      setAuth((prev) => ({ ...prev, ...res }));
      addToast({
        message: "Perfil actualizado correctamente",
        type: "success",
      });
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (
      !passwordForm.password.trim() ||
      !passwordForm.new_password.trim() ||
      !passwordForm.confirm_password.trim()
    ) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }

    const passwordValidationError = validatePassword(passwordForm.new_password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    setPasswordLoading(true);
    try {
      await fetchCliente("/auth/profile", {
        method: "PUT",
        body: {
          password: passwordForm.password,
          new_password: passwordForm.new_password,
        },
      });
      addToast({
        message: "Contraseña actualizada correctamente",
        type: "success",
      });
      setPasswordForm({ password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      console.log(error);
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (form.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <MdOutlinePersonOutline className="text-lg sm:text-xl text-on-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
              Mi perfil
            </h1>
            <p className="text-body-sm sm:text-body-md text-secondary">
              Administra tu información personal y contraseña
            </p>
          </div>
        </div>

        {/* Tarjeta resumen */}
        <Card bodyClassName="p-4 sm:p-5 flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="text-title-lg font-bold text-on-primary-container">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-on-surface text-body-lg truncate">
              {form.name || "Usuario"}
            </p>
            <p className="text-body-sm text-on-surface-variant truncate">
              {form.email}
            </p>
          </div>
        </Card>

        <div className="md:grid md:grid-cols-2 gap-10">
          {/* Formulario datos personales */}
          <Card className="my-4 md:my-0" bodyClassName="p-4 sm:p-6 gap-4">
            <div className="flex items-center gap-2">
              <MdEdit className="text-base text-secondary" />
              <h2 className="font-bold text-title-md text-on-surface">
                Datos personales
              </h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 mt-1">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Nombre
                  </span>
                </label>
                <div className="relative">
                  <MdOutlinePersonOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
                  <input
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    value={form.name}
                    type="text"
                    placeholder="Tu nombre completo"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full pl-10"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Email
                  </span>
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
                  <input
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    value={form.email}
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full pl-10"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Teléfono
                  </span>
                </label>
                <div className="relative">
                  <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg z-10 pointer-events-none" />
                  <input
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    value={form.phone}
                    type="tel"
                    placeholder="3158905738"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full pl-10"
                  />
                </div>
              </div>

              {profileError && (
                <div className="alert bg-error-container border-none rounded-xl py-2.5">
                  <span className="text-body-sm text-on-error-container">
                    {profileError}
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container gap-2 w-full sm:w-auto"
                >
                  {profileLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <MdSave className="text-lg" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
          {/* Formulario cambio de contraseña */}
          <Card className="my-4 md:my-0" bodyClassName="p-4 sm:p-6 gap-4">
            <div className="flex items-center gap-2">
              <MdLock className="text-base text-secondary" />
              <h2 className="font-bold text-title-md text-on-surface">
                Cambiar contraseña
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-1">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Contraseña actual
                  </span>
                </label>
                <input
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      password: e.target.value,
                    })
                  }
                  value={passwordForm.password}
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Nueva contraseña
                    </span>
                  </label>
                  <input
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        new_password: e.target.value,
                      })
                    }
                    value={passwordForm.new_password}
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Confirmar contraseña
                    </span>
                  </label>
                  <input
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm_password: e.target.value,
                      })
                    }
                    value={passwordForm.confirm_password}
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="alert bg-error-container border-none rounded-xl py-2.5">
                  <span className="text-body-sm text-on-error-container">
                    {passwordError}
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container gap-2 w-full sm:w-auto"
                >
                  {passwordLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <MdLock className="text-lg" />
                      Actualizar contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default PerfilUsuario;
