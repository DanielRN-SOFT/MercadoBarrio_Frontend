import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { MdLogout, MdOutlinePersonOutline, MdStore } from "react-icons/md";

const TopNavUser = ({ link, nameLink }) => {
  const navigate = useNavigate();
  const { auth, cerrarSesion } = useAuth();
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
    <div className="dropdown dropdown-end cursor-pointer mx-2">
      <div
        tabIndex={0}
        role="button"
        className="flex items-center gap-3 border-l pl-6 border-outline-variant"
      >
        <div className="text-right hidden md:block">
          <p className="text-label-md font-semibold text-on-surface">
            {auth.name}
          </p>
          <p className="text-label-sm text-secondary">Propietario</p>
        </div>
        <div className="w-10 h-10 rounded-full ring-2 ring-primary-fixed bg-primary flex items-center justify-center">
          <span className="text-sm font-semibold text-on-primary">
            {getInitials(auth.name)}
          </span>
        </div>
      </div>
      <ul
        tabIndex="-1"
        className="dropdown-content menu bg-on-primary rounded-box z-1 w-48 p-2 shadow-sm"
      >
        <li className="py-0.5">
          <Link to={"/perfil"} className="text-primary">
            <MdOutlinePersonOutline className="text-2xl" /> Perfil
          </Link>
        </li>
        <li className="py-0.5">
          <Link to={link} className="text-primary">
            <MdStore className="text-2xl" /> {nameLink}
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-error hover:opacity-80 transition-opacity  w-full cursor-pointer"
          >
            <MdLogout className="text-xl" />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TopNavUser;
