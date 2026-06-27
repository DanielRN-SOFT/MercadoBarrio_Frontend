import { IoIosNotifications } from "react-icons/io";
import { Link, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import TopNavUser from "../privada/_partials/TopNavUser";

const TopNavBar = () => {
  const { auth } = useAuth();
  const NavLinkClases =
    "text-on-surface-variant hover:text-primary/90 transition-colors font-label-md text-label-md px-2";
  return (
    <header className="bg-surface border-b border-outline-variant fixed top-0 w-full z-50">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-max-width mx-auto">
        <h1 className="text-headline-md font-headline-md text-primary tracking-tight">
          MercadoBarrio
        </h1>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4">
            <Link
              className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md"
              to="/inicio"
            >
              Inicio
            </Link>
            <Link className={NavLinkClases} to="/inicio/mapa">
              Mapa
            </Link>
            <Link className={NavLinkClases} to="/inicio/tiendas">
              Tiendas
            </Link>
            <Link className={NavLinkClases} to="/inicio/perfil">
              Perfil
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          {!auth.id ? (
            <div className="ml-2">
              <Link to={"/"} className="btn btn-primary">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <TopNavUser link={"/panel"} nameLink={"Panel"} />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
