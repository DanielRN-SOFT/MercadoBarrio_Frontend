import { IoIosNotifications } from "react-icons/io";
import { Link, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import TopNavUser from "../privada/_partials/TopNavUser";

const TopNavBar = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const NAVLINKS = [
    {
      name: "Inicio",
      to: "/",
    },
    {
      name: "Tiendas",
      to: "/tiendas",
    },
    {
      name: "Mapa",
      to: "/mapa",
    },
  ];

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
            {NAVLINKS.map((link) => (
              <Link
                key={link.to}
                className={
                  location.pathname == link.to
                    ? "text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md"
                    : NavLinkClases
                }
                to={link.to}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          {!auth.id ? (
            <div className="ml-2">
              <Link to={"/auth/login"} className="btn btn-primary">
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
