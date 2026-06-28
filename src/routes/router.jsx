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
import NuevaPassword from "../pages/Auth/NuevaPassword";
import Tiendas from "../pages/Publica/Tiendas";
import Mapa from "../pages/Publica/Mapa";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Rutas de Auth */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />}></Route>
        <Route path="olvide-password" element={<ForgotPassword />}></Route>
        <Route
          path="cambiar-password/:token"
          element={<NuevaPassword />}
        ></Route>
      </Route>

      {/* Rutas de la pagina publica */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Inicio />}></Route>
        <Route path="tiendas" element={<Tiendas />}></Route>
        <Route path="tiendas/:id" element={<TiendaDetalle />}></Route>
        <Route path="mapa" element={<Mapa />}></Route>
      </Route>

      <Route path="/panel" element={<PrivateLayout />}>
        <Route index element={<Index />}></Route>
      </Route>
    </>,
  ),
);
