import { useState, createContext, useEffect } from "react";
import fetchCliente from "../config/fetchCliente";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const autenticarUsuario = async () => {
      try {
        const response = await fetchCliente("/auth/profile");
        setAuth(response);
      } catch (error) {
        // console.log(error);
        setAuth({});
      }
      setCargando(false);
    };
    autenticarUsuario();
  }, []);

  const cerrarSesion = async () => {
    try {
      const response = await fetchCliente("/auth/logout");
      if (response.message) {
        setAuth({});
      }
    } catch (error) {
      // console.log(error);
      setAuth({});
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, cargando, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;
