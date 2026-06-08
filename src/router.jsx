import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // Rutas publicas
    <Route path="/" element={<AuthLayout />}>
      <Route index element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
    </Route>,
  ),
);
