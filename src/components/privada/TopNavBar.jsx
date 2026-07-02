import { Link } from "react-router-dom";
import { MdOutlinePersonOutline, MdStore, MdMenu } from "react-icons/md";
import TopNavUser from "./_partials/TopNavUser";

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

export default TopNavBar;
