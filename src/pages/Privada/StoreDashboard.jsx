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
} from "recharts";
import {
  FiPackage,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiAlertTriangle,
  FiShoppingCart,
} from "react-icons/fi";

const COLORS = ["#2a78d6", "#1baf7a", "#eda100", "#4a3aa7", "#e34948"];

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
  highlight,
}) => (
  <div
    className={`bg-base-100 rounded-2xl border p-5 flex gap-4 items-start ${highlight ? "border-primary" : "border-base-200"}`}
  >
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

const StoreDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCliente("/dashboard/store"),
      fetchCliente("/dashboard/store/charts"),
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
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || !charts) return null;

  const variacion = parseFloat(data.sales.revenueVariationPercent);
  const variacionPositiva = variacion >= 0;

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Hola, {auth?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-on-surface/50 text-sm mt-1">{data.store.name}</p>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={FiPackage}
          label="Productos activos"
          value={data.products.total}
          color="text-blue-500"
        />
        <StatCard
          icon={FiAlertTriangle}
          label="Stock bajo"
          value={data.products.lowStock}
          color={
            data.products.lowStock > 0 ? "text-red-500" : "text-emerald-500"
          }
          highlight={data.products.lowStock > 0}
        />
        <StatCard
          icon={FiShoppingCart}
          label="Entradas este mes"
          value={data.movements.entriesThisMonth}
          color="text-emerald-500"
        />
        <StatCard
          icon={FiShoppingCart}
          label="Salidas este mes"
          value={data.movements.exitsThisMonth}
          color="text-amber-500"
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
          icon={FiTrendingUp}
          label="Ventas mes anterior"
          value={data.sales.lastMonth}
          sub={fmt(data.sales.revenueLastMonth)}
          color="text-primary"
        />
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 flex gap-4 items-start">
          <div
            className={`p-3 rounded-xl bg-base-200 ${variacionPositiva ? "text-emerald-500" : "text-red-500"}`}
          >
            {variacionPositiva ? (
              <FiArrowUp size={20} />
            ) : (
              <FiArrowDown size={20} />
            )}
          </div>
          <div>
            <p className="text-on-surface/50 text-sm">Variación mensual</p>
            <p
              className={`text-2xl font-bold ${variacionPositiva ? "text-emerald-600" : "text-red-500"}`}
            >
              {data.sales.revenueVariationPercent !== null
                ? `${variacionPositiva ? "+" : ""}${variacion.toFixed(1)}%`
                : "—"}
            </p>
            <p className="text-xs text-on-surface/40 mt-0.5">vs mes anterior</p>
          </div>
        </div>
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#2a78d6"
              strokeWidth={2}
              dot={false}
              name="count"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#1baf7a"
              strokeWidth={2}
              dot={false}
              name="revenue"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-on-surface/50">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Ventas
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Ingresos
          </span>
        </div>
      </div>

      {/* Ventas por día de semana + Movimientos */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Ventas por día de semana (este mes)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.salesByWeekDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, name) => [
                  name === "revenue" ? fmt(v) : v,
                  name === "revenue" ? "Ingresos" : "Ventas",
                ]}
              />
              <Bar
                dataKey="count"
                fill="#2a78d6"
                radius={[4, 4, 0, 0]}
                name="count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
          <SectionTitle>Movimientos por tipo (este mes)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={charts.movementsByType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, value }) =>
                  `${name === "Entry" ? "Entradas" : "Salidas"}: ${value}`
                }
              >
                {charts.movementsByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, name) => [
                  v,
                  name === "Entry" ? "Entradas" : "Salidas",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top productos */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-5">
        <SectionTitle>Productos más vendidos (este mes)</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts.topProducts} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              horizontal={false}
            />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={110}
            />
            <Tooltip
              formatter={(v, name) => [
                name === "revenue" ? fmt(v) : v,
                name === "revenue" ? "Ingresos" : "Cantidad",
              ]}
            />
            <Bar
              dataKey="quantitySold"
              fill="#2a78d6"
              radius={[0, 4, 4, 0]}
              name="quantitySold"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alertas de stock bajo */}
      {data.products.lowStockList.length > 0 && (
        <div className="bg-base-100 border border-red-200 rounded-2xl p-5">
          <SectionTitle>⚠ Productos con stock bajo</SectionTitle>
          <div className="space-y-2">
            {data.products.lowStockList.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <p className="text-on-surface font-medium">{p.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-on-surface/40 text-xs">
                    Mínimo: {p.lowStockThreshold}
                  </span>
                  <span className="badge badge-error badge-sm">
                    Stock: {p.currentStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <p className="font-medium text-on-surface">
                    {s.details
                      ?.map((d) => d.product?.name)
                      .join(", ")
                      .slice(0, 40) || "Venta"}
                  </p>
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
                  <p className="font-medium text-on-surface">
                    {m.details
                      ?.map((d) => d.product?.name)
                      .join(", ")
                      .slice(0, 40) || m.type}
                  </p>
                  <p className="text-on-surface/40 text-xs">
                    {m.user?.name} ·{" "}
                    {new Date(m.date).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span
                  className={`badge badge-sm ${m.type === "Entry" ? "badge-success" : "badge-warning"}`}
                >
                  {m.type === "Entry" ? "Entrada" : "Salida"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
