import { Navigate, Outlet } from "react-router-dom";
import SideNavBar from "../components/privada/SideNavBar";
import TopNavBar from "../components/privada/TopNavBar";
import useAuth from "../hooks/useAuth";

const PrivateLayout = () => {
  const { auth, cargando } = useAuth();

  if (cargando) return "cargando...";
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <SideNavBar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNavBar />
        <main className="flex-1">
          {auth.id ? <Outlet /> : <Navigate to={"/"} />}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
