import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { MdOutlinePersonOutline, MdStore, MdMenu } from "react-icons/md";

const TopNavBar = ({ title = "Dashboard", onMenuClick }) => {
  return (
    <header className="w-full sticky top-0 z-40 bg-surface border-b border-outline-variant px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Hamburguesa solo en móvil/tablet */}
        <button
          onClick={onMenuClick}
          className="lg:hidden cursor-pointer p-1 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <MdMenu className="text-2xl" />
        </button>
        <h2 className="text-headline-md font-bold text-primary">{title}</h2>
      </div>
      <TopNavActions />
    </header>
  );
};

const TopNavActions = () => (
  <div className="flex items-center gap-6">
    <button className="text-on-surface-variant hover:text-primary transition-colors">
      <span className="material-symbols-outlined">notifications</span>
    </button>
    <TopNavUser />
  </div>
);

const TopNavUser = () => {
  const { auth } = useAuth();
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  return (
    <div className="dropdown cursor-pointer mx-2">
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
        className="dropdown-content menu bg-on-primary rounded-box z-1 w-40 p-2 shadow-sm"
      >
        <li className="py-0.5">
          <Link to={"/perfil"} className="text-primary">
            <MdOutlinePersonOutline className="text-2xl" /> Perfil
          </Link>
        </li>
        <li className="py-0.5">
          <Link to={"/inicio"} className="text-primary">
            <MdStore className="text-2xl" /> Directorio
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TopNavBar;
