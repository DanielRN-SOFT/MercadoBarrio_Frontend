import { useEffect, useState, useContext } from "react";
import fetchCliente from "../../config/fetchCliente";
import AuthContext from "../../context/AuthProvider";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowUpRight,
} from "react-icons/fi";
import { IoStorefrontSharp } from "react-icons/io5";

const COLORS = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#4a3aa7",
  "#e34948",
  "#eb6834",
];

const MOVEMENT_TYPE_LABEL = {
  Entry: "Entrada",
  Exit: "Salida",
  AdjustEntry: "Ajuste-Entrada",
  AdjustExit: "Ajuste-Salida",
};

const STORE_STATUS_LABEL = {
  Active: "Activo",
  Inactive: "Inactivo",
  Pending: "Pendiente",
  Incomplete: "Incompleto",
  Rejected: "Rechazado",
};

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}) => (
  <div className="bg-base-100 rounded-2xl border border-base-200 p-5 flex gap-4 items-start">
    <div className={`p-3 rounded-xl bg-base-200 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-on-surface/50 text-sm">{label}</p>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
      {sub && <p className="text-xs text-on-surface/40 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-base font-semibold text-on-surface mb-3">{children}</h2>
);

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCliente("/dashboard/admin"),
      fetchCliente("/dashboard/admin/charts"),
    ])
      .then(([d, c]) => {
        setData(d.data);
        setCharts(c.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || !charts) return null;

  return (
    <div className="p-2 md:p-6 space-y-8">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={FiUsers}
          label="Usuarios activos"
          value={data.users.active}
          sub={`${data.users.total} totales`}
          color="text-blue-500"
        />
        <StatCard
          icon={IoStorefrontSharp}
          label="Tiendas activas"
          value={data.stores.active}
          sub={`${data.stores.total} totales`}
          color="text-emerald-500"
        />
        <StatCard
          icon={FiPackage}
          label="Productos activos"
          value={data.products.total}
          sub={
            data.products.lowStock > 0
              ? `⚠ ${data.products.lowStock} con stock bajo`
              : "Stock OK"
          }
          color="text-amber-500"
        />
        <StatCard
          icon={FiTruck}
          label="Proveedores"
          value={data.suppliers.active}
          color="text-violet-500"
        />
      </div>

      {/* Ventas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={FiTrendingUp}
          label="Ventas hoy"
          value={data.sales.today}
          sub={fmt(data.sales.revenueToday)}
          color="text-primary"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Ventas este mes"
          value={data.sales.thisMonth}
          sub={fmt(data.sales.revenueThisMonth)}
          color="text-primary"
        />
        <StatCard
          icon={FiShoppingBag}
          label="Ventas totales"
          value={data.sales.total}
          color="text-primary"
        />
        <StatCard
          icon={FiArrowUpRight}
          label="Movimientos mes"
          value={data.movements.thisMonth}
          sub={`${data.movements.total} totales`}
          color="text-orange-500"
        />
      </div>

      {/* Ventas diarias */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
        <SectionTitle>Ventas últimos 30 días</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={charts.dailySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
              interval={4}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(val, name) =>
                name === "revenue" ? [fmt(val), "Ingresos"] : [val, "Ventas"]
              }
              labelFormatter={(l) => `Fecha: ${l}`}
            />
            <Legend
              formatter={(v) => (v === "count" ? "Ventas" : "Ingresos")}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#2a78d6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#1baf7a"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fila: Top tiendas + Movimientos por tipo */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Top tiendas por ingreso (este mes)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.topStoresByRevenue} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip formatter={(v) => [fmt(v), "Ingresos"]} />
              <Bar dataKey="revenue" fill="#2a78d6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Movimientos por tipo (este mes)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={charts.movementsByType}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, count }) =>
                  `${MOVEMENT_TYPE_LABEL[name] ?? name}: ${count}`
                }
                labelLine={false}
              >
                {charts.movementsByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [
                  val,
                  MOVEMENT_TYPE_LABEL[name] ?? name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila: Usuarios por rol + Tiendas por estado */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Usuarios por rol</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.usersByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4a3aa7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Tiendas por estado</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={charts.storesByStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, value }) =>
                  `${STORE_STATUS_LABEL[name] ?? name}: ${value}`
                }
              >
                {charts.storesByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [
                  val,
                  STORE_STATUS_LABEL[name] ?? name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Ventas recientes</SectionTitle>
          <div className="space-y-3">
            {data.recentActivity.sales.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-on-surface">{s.store?.name}</p>
                  <p className="text-on-surface/40 text-xs">
                    {s.user?.name} ·{" "}
                    {new Date(s.date).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className="font-semibold text-emerald-600">
                  {fmt(s.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Movimientos recientes</SectionTitle>
          <div className="space-y-3">
            {data.recentActivity.movements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-on-surface">{m.store?.name}</p>
                  <p className="text-on-surface/40 text-xs">
                    {m.user?.name} · {MOVEMENT_TYPE_LABEL[m.type] ?? m.type} ·{" "}
                    {new Date(m.date).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span
                  className={`badge badge-sm ${m.type === "Entry" ? "badge-success" : "badge-warning"}`}
                >
                  {MOVEMENT_TYPE_LABEL[m.type] ?? m.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
