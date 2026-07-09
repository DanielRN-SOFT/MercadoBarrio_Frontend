import { icon } from "leaflet";
import { useEffect } from "react";
import { IoStorefrontSharp } from "react-icons/io5";
import {
  MdClose,
  MdOutlineDashboard,
  MdOutlineInventory2,
  MdOutlinePayments,
  MdOutlineSchedule,
  MdOutlineSettings,
  MdOutlineStore,
  MdSwapVert,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/panel/tienda", icon: <MdOutlineDashboard />, label: "Panel" },
  { to: "/panel/mi-tienda", icon: <MdOutlineStore />, label: "Mi Tienda" },
  {
    to: "/panel/ventas",
    icon: <MdOutlinePayments />,
    label: "Ventas",
    filled: true,
  },
  {
    to: "/panel/productos",
    icon: <MdOutlineInventory2 />,
    label: "Productos",
    filled: true,
  },
  {
    to: "/panel/inventario",
    icon: <MdOutlineInventory2 />,
    label: "Inventario",
    filled: true,
  },
  {
    to: "/panel/movimientos",
    icon: <MdSwapVert />,
    label: "Movimientos",
    filled: true,
  },
  {
    to: "/panel/horarios-atencion",
    icon: <MdOutlineSchedule />,
    label: "Horarios",
    filled: true,
  },

  { to: "/settings", icon: <MdOutlineSettings />, label: "Ajustes" },
];

const GrocerSideNavBar = ({ open, onClose }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    onClose();
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-50 bg-surface-container-low border-r border-outline-variant flex flex-col p-4 transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <button
          onClick={onClose}
          className="lg:hidden self-end mb-2 p-1 text-secondary hover:text-on-surface cursor-pointer"
        >
          <MdClose className="text-2xl" />
        </button>

        <SideNavBrand />

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SideNavItem
              key={item.to}
              {...item}
              active={pathname === item.to || pathname.startsWith(item.to)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-outline-variant">
          <Link
            to="/panel/productos/nuevo"
            className="w-full bg-primary text-white py-3 rounded-lg text-label-md font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Publicar Producto
          </Link>
          <Link
            to="/help"
            className="flex items-center gap-3 px-4 py-2 text-secondary hover:text-primary transition-colors text-label-sm"
          >
            <span className="material-symbols-outlined">contact_support</span>
            Centro de Ayuda
          </Link>
        </div>
      </aside>
    </>
  );
};

const SideNavBrand = () => (
  <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
      <IoStorefrontSharp className="text-xl" />
    </div>
    <div>
      <h1 className="text-headline-md font-bold text-primary">MercadoBarrio</h1>
      <p className="text-label-sm text-secondary">Store Dashboard</p>
    </div>
  </div>
);

const SideNavItem = ({ to, icon, label, filled, active }) => (
  <Link
    to={to}
    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-label-md font-semibold ${active ? "bg-primary-container text-on-primary-container" : "text-secondary hover:bg-surface-container-high"}`}
  >
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
    )}
    <span
      className="text-2xl"
      style={active && filled ? { fontVariationSettings: "'FILL' 1" } : {}}
    >
      {icon}
    </span>
    {label}
  </Link>
);

export default GrocerSideNavBar;
