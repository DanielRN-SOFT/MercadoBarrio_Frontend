import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import PublicLayout from "../layouts/PublicLayout";
import Inicio from "../pages/Publica/Inicio";
import Index from "../pages/Privada/Index";
import TiendaDetalle from "../pages/Publica/TiendaDetalle";
import PrivateLayout from "../layouts/PrivateLayout";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Rutas de Auth */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/olvide-password" element={<ForgotPassword />}></Route>
      </Route>

      {/* Rutas de la pagina publica */}
      <Route path="/inicio" element={<PublicLayout />}>
        <Route index element={<Inicio />}></Route>
        <Route path="tienda/:id" element={<TiendaDetalle />}></Route>
      </Route>

      <Route path="/panel" element={<PrivateLayout />}>
        <Route index element={<Index />}></Route>
      </Route>
    </>,
  ),
);
