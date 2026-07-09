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
import MiTienda from "../pages/Privada/MiTienda";
import MisProductos from "../pages/Privada/MisProductos";
import Inventario from "../pages/Privada/Inventario";
import ProductoForm from "../pages/Privada/ProductoForm";
import TiendaDetalle from "../pages/Publica/TiendaDetalle";
import PrivateLayout from "../layouts/PrivateLayout";
import NuevaPassword from "../pages/Auth/NuevaPassword";
import Tiendas from "../pages/Publica/Tiendas";
import BuscarProducto from "../pages/Publica/BuscarProducto";
import Mapa from "../pages/Publica/Mapa";
import AdminDashboard from "../pages/Privada/AdminDashboard";
import StoreDashboard from "../pages/Privada/StoreDashboard";
import MisHorarios from "../pages/Privada/MisHorarios";
import MisVentas from "../pages/Privada/MisVentas";
import RegistrarVenta from "../pages/Privada/RegistrarVenta";
import AdminTiendas from "../pages/Privada/AdminTiendas";
import AdminUsuarios from "../pages/Privada/AdminUsuarios";
import AdminCategoriasTienda from "../pages/Privada/AdminCategoriasTienda";
import AdminCategoriasProducto from "../pages/Privada/AdminCategoriasProducto";
import AdminUnidadesMedida from "../pages/Privada/AdminUnidadesMedida";
import AdminRoles from "../pages/Privada/AdminRoles";
import AdminProveedores from "../pages/Privada/AdminProveedores";

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
        <Route path="buscar" element={<BuscarProducto />} />
        <Route path="mapa" element={<Mapa />}></Route>
      </Route>

      <Route path="/panel" element={<PrivateLayout />}>
        <Route path="admin" element={<AdminDashboard />}></Route>
        <Route path="tienda" element={<StoreDashboard />}></Route>
        <Route path="admin/tiendas" element={<AdminTiendas />}></Route>
        <Route path="admin/usuarios" element={<AdminUsuarios />}></Route>
        <Route path="admin/categorias-tienda" element={<AdminCategoriasTienda/>}></Route>
        <Route path="admin/categorias-producto" element={<AdminCategoriasProducto/>}></Route>
        <Route path="admin/unidades-medida" element={<AdminUnidadesMedida/>}></Route>
        <Route path="admin/roles" element={<AdminRoles/>}></Route>
        <Route path="admin/proveedores" element={<AdminProveedores/>}></Route>
        <Route path="mi-tienda" element={<MiTienda />}></Route>
        <Route path="productos" element={<MisProductos />}></Route>
        <Route path="inventario" element={<Inventario />}></Route>
        <Route path="ventas" element={<MisVentas />}></Route>
        <Route path="ventas/nueva" element={<RegistrarVenta />}></Route>
        <Route path="productos/nuevo" element={<ProductoForm />}></Route>
        <Route path="horarios-atencion" element={<MisHorarios />}></Route>
        <Route path="productos/:id/editar" element={<ProductoForm />}></Route>
      </Route>
    </>,
  ),
);
