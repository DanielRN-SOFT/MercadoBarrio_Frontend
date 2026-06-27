import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import SideNavBar from "../components/privada/SideNavBar";
import TopNavBar from "../components/privada/TopNavBar";
import useAuth from "../hooks/useAuth";

const PrivateLayout = () => {
  const { auth, cargando } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (cargando) return "cargando...";

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <SideNavBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col min-h-screen lg:ml-64">
        <TopNavBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">
          {auth.id ? <Outlet /> : <Navigate to={"/"} />}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
