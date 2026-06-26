import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const TopNavBar = ({ title = "Dashboard" }) => {
  return (
    <header className="w-full sticky top-0 z-40 bg-surface border-b border-outline-variant px-6 py-4 flex justify-between items-center">
      <h2 className="text-headline-md font-bold text-primary">{title}</h2>
      <TopNavActions />
    </header>
  );
};

const TopNavActions = () => (
  <div className="flex items-center gap-6">
    <button className="text-on-surface-variant hover:text-primary transition-colors">
      <span className="material-symbols-outlined">notifications</span>
    </button>
    <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-label-md font-semibold">
      <span className="material-symbols-outlined">help</span>
      Soporte
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
    <div className="flex items-center gap-3 border-l pl-6 border-outline-variant">
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
  );
};

export default TopNavBar;
