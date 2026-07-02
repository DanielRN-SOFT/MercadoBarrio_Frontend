import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  MdLogout,
  MdOutlineDashboardCustomize,
  MdOutlinePersonOutline,
  MdOutlineStore,
  MdStore,
} from "react-icons/md";

const TopNavUser = () => {
  const navigate = useNavigate();
  const { auth, cerrarSesion } = useAuth();
  const { pathname } = useLocation();
  const pathPrivate = auth.role == "Admin" ? "panel/admin" : "panel/tienda";

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await cerrarSesion();
    navigate("/");
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="flex items-center gap-3 pl-4 border-l border-outline-variant cursor-pointer group"
      >
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-on-surface leading-tight">
            {auth.name}
          </p>
          <p className="text-xs text-secondary leading-tight">Propietario</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
          <span className="text-xs font-bold text-on-primary tracking-wide">
            {getInitials(auth.name)}
          </span>
        </div>
      </div>

      <ul
        tabIndex={-1}
        className="dropdown-content z-50 mt-3 w-56 rounded-2xl bg-base-100 border border-outline-variant shadow-lg overflow-hidden p-1"
      >
        {/* Header */}
        <li className="px-3 py-2.5 mb-1 border-b border-outline-variant">
          <p className="text-sm font-semibold text-on-surface truncate">
            {auth.name}
          </p>
          <p className="text-xs text-secondary truncate">{auth.email}</p>
        </li>

        {/* Links */}
        <li>
          <Link
            to="/perfil"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-base-200 transition-colors"
          >
            <MdOutlinePersonOutline className="text-lg text-secondary shrink-0" />
            Perfil
          </Link>
        </li>
        <li>
          <Link
            to={pathname == "/" ? pathPrivate : "/"}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-base-200 transition-colors"
          >
            {pathname == "/" ? (
              <MdOutlineDashboardCustomize className="text-lg text-secondary shrink-0" />
            ) : (
              <MdOutlineStore className="text-lg text-secondary shrink-0" />
            )}
            {pathname == "/" ? "Panel" : "Directorio"}
          </Link>
        </li>

        {/* Divider + Logout */}
        <li className="mt-1 pt-1 border-t border-outline-variant">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
          >
            <MdLogout className="text-lg shrink-0" />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TopNavUser;
