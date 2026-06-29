import { useState, createContext, useEffect } from "react";
import fetchCliente from "../config/fetchCliente";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem("auth");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ← Cambia esto: si ya hay auth guardado, no mostrar spinner
  const [cargando, setCargando] = useState(() => {
    return !localStorage.getItem("auth");
  });

  useEffect(() => {
    const autenticarUsuario = async () => {
      try {
        const response = await fetchCliente("/auth/profile");
        setAuth(response);
        localStorage.setItem("auth", JSON.stringify(response));
      } catch (error) {
        setAuth({});
        localStorage.removeItem("auth");
      }
      setCargando(false);
    };
    autenticarUsuario();
  }, []);

  const cerrarSesion = async () => {
    try {
      await fetchCliente("/auth/logout", { method: "POST" });
    } catch (error) {
      // silence
    }
    setAuth({});
    localStorage.removeItem("auth");
  };
  return <AuthContext.Provider value={{ auth, setAuth, cargando, cerrarSesion }}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
export default AuthContext;
