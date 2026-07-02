import { useState, useEffect } from "react";
import {
  MdCalendarMonth,
  MdAdd,
  MdEdit,
  MdRestoreFromTrash,
  MdAccessTime,
  MdOutlineFilterAlt,
} from "react-icons/md";
import { IoCloseCircle, IoCloseSharp } from "react-icons/io5";
import fetchCliente from "../../config/fetchCliente";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import Paginacion from "../../components/ui/Paginacion";

// ─── Utilidades de días y horas ───────────────────────────────────────────

// Mismo orden que usa el backend para ordenar los horarios
const WEEK_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

// Etiquetas en español para mostrar (el valor que viaja al backend es en inglés,
// igual que el enum WeekDay de Prisma en el cliente de JS)
const WEEKDAY_LABELS = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo",
};

const WEEKDAY_OPTIONS = Object.keys(WEEK_ORDER).sort(
  (a, b) => WEEK_ORDER[a] - WEEK_ORDER[b],
);

// Convierte "HH:mm" (de un <input type="time">) a un ISO string en UTC,
// usando una fecha arbitraria ya que el backend solo persiste la hora (@db.Time)
const timeToISO = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0)).toISOString();
};

// Convierte el valor que devuelve el backend a "HH:mm" para precargar el input
const isoToTimeInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Convierte el valor del backend a un formato legible, ej: "8:00 a. m."
const formatTimeDisplay = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
};

const getDayAbbrev = (weekDay) =>
  (WEEKDAY_LABELS[weekDay] ?? weekDay).slice(0, 3).toUpperCase();

// Avatar circular con la abreviatura del día, en la misma línea visual
// que el ProductAvatar de MisProductos
const DayAvatar = ({
  weekDay,
  size = "w-11 h-11",
  textSize = "text-label-sm",
}) => (
  <div
    className={`${size} rounded-xl bg-primary flex items-center justify-center shrink-0`}
  >
    <span className={`${textSize} font-bold text-on-primary`}>
      {getDayAbbrev(weekDay)}
    </span>
  </div>
);

const EMPTY_FORM = { weekDay: "", startTime: "", endTime: "" };

const MisHorarios = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [confirmId, setConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [weekDayFilter, setWeekDayFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal de crear/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchSchedules = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p });
      if (weekDayFilter) params.set("weekDay", weekDayFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetchCliente(
        `/attendance-schedules?${params.toString()}`,
      );
      setSchedules(res.data);
      setMeta(res.meta);
    } catch (err) {
      addToast({ message: "Error al cargar los horarios", type: "error" });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(page);
  }, [page]);

  useEffect(() => {
    if (page === 1) fetchSchedules(1);
    else setPage(1);
  }, [weekDayFilter, statusFilter]);

  const handleClearFilters = () => {
    setWeekDayFilter("");
    setStatusFilter("");
  };

  const hasFilters = weekDayFilter || statusFilter;

  // ─── Crear / Editar ─────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingSchedule(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setForm({
      weekDay: schedule.weekDay,
      startTime: isoToTimeInput(schedule.startTime),
      endTime: isoToTimeInput(schedule.endTime),
    });
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setShowFormModal(false);
    setEditingSchedule(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.weekDay || !form.startTime || !form.endTime) {
      setFormError("Todos los campos son obligatorios");
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError("El horario de salida debe ser mayor al horario de entrada");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        weekDay: form.weekDay,
        startTime: timeToISO(form.startTime),
        endTime: timeToISO(form.endTime),
      };

      if (editingSchedule) {
        await fetchCliente(`/attendance-schedules/${editingSchedule.id}`, {
          method: "PUT",
          body: payload,
        });
        addToast({
          message: "Horario actualizado correctamente",
          type: "success",
        });
      } else {
        await fetchCliente("/attendance-schedules", {
          method: "POST",
          body: payload,
        });
        addToast({ message: "Horario creado correctamente", type: "success" });
      }

      setShowFormModal(false);
      setEditingSchedule(null);
      setForm(EMPTY_FORM);
      fetchSchedules(page);
    } catch (err) {
      setFormError(err.message ?? "Error al guardar el horario");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Desactivar / Restaurar ─────────────────────────────────────────────

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await fetchCliente(`/attendance-schedules/delete/${id}`, {
        method: "PUT",
      });
      addToast({
        message: "Horario desactivado correctamente",
        type: "success",
      });
      fetchSchedules(page);
    } catch (err) {
      addToast({
        message: err.message ?? "Error al desactivar",
        type: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmId(null);
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try {
      await fetchCliente(`/attendance-schedules/restore/${id}`, {
        method: "PUT",
      });
      addToast({
        message: "Horario reactivado correctamente",
        type: "success",
      });
      fetchSchedules(page);
    } catch (err) {
      addToast({ message: err.message ?? "Error al reactivar", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <MdCalendarMonth className="text-lg sm:text-xl text-on-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
                Mis Horarios
              </h1>
              <p className="text-body-sm sm:text-body-md text-secondary">
                Define los horarios de atención de tu establecimiento
                {meta.total > 0 && (
                  <span className="text-on-surface-variant">
                    {" "}
                    · {meta.total} en total
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto"
          >
            <MdAdd className="text-xl" />
            Nuevo horario
          </button>
        </div>

        {/* Filtros */}
        <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm">
          <div className="card-body p-4 sm:p-5 gap-3">
            <div className="flex items-center gap-2 text-secondary">
              <MdOutlineFilterAlt className="text-base" />
              <span className="text-label-sm uppercase tracking-wide font-semibold">
                Filtros
              </span>
            </div>

            <div className="grid grid-cols-2 sm:flex gap-3">
              <select
                value={weekDayFilter}
                onChange={(e) => setWeekDayFilter(e.target.value)}
                className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-48 transition-colors"
              >
                <option value="">Todos los días</option>
                {WEEKDAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    {WEEKDAY_LABELS[day]}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary font-body-md text-body-sm sm:text-body-md rounded-full w-full sm:w-40 transition-colors"
              >
                <option value="">Todos los estados</option>
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo</option>
              </select>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleClearFilters}
                  className="btn btn-ghost btn-sm gap-1 text-secondary hover:text-error font-label-sm rounded-full"
                >
                  <IoCloseSharp className="text-sm" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Estado vacío / carga compartido */}
        {loading ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="space-y-4 p-4 sm:p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded-full" />
                    <div className="skeleton h-3 w-1/4 rounded-full" />
                  </div>
                  <div className="skeleton h-8 w-20 rounded-full hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-center py-16 sm:py-20 px-6 text-secondary">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <MdCalendarMonth className="text-3xl opacity-40" />
              </div>
              {hasFilters ? (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">
                    Sin resultados
                  </p>
                  <p className="text-body-md mt-1">
                    No encontramos horarios con esos filtros. Intenta
                    ajustarlos.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-on-surface text-body-lg">
                    Aún no tienes horarios
                  </p>
                  <p className="text-body-md mt-1">
                    Agrega tu primer horario de atención para comenzar.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
                  >
                    <MdAdd className="text-xl" /> Agregar horario
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Vista de TARJETAS — móvil y tablet */}
            <div className="lg:hidden space-y-3">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <DayAvatar weekDay={s.weekDay} />
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface text-body-md truncate">
                            {WEEKDAY_LABELS[s.weekDay] ?? s.weekDay}
                          </p>
                          <span className="inline-flex items-center gap-1 text-body-sm text-on-surface-variant mt-1">
                            <MdAccessTime className="text-sm" />
                            {formatTimeDisplay(s.startTime)} –{" "}
                            {formatTimeDisplay(s.endTime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(s)}
                          className="btn btn-ghost btn-sm btn-circle hover:bg-secondary-container/60"
                          aria-label="Editar"
                        >
                          <MdEdit className="text-lg text-secondary" />
                        </button>
                        {s.status === "Active" ? (
                          <button
                            onClick={() => setConfirmId(s.id)}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-error-container/60"
                            aria-label="Desactivar"
                          >
                            <IoCloseCircle className="text-lg text-error" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(s.id)}
                            disabled={actionLoading}
                            className="btn btn-ghost btn-sm btn-circle hover:bg-primary-container/20"
                            aria-label="Reactivar"
                          >
                            <MdRestoreFromTrash className="text-lg text-primary" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-outline-variant/50">
                      <span
                        className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                          s.status === "Active"
                            ? "bg-primary-fixed text-on-primary-fixed-variant"
                            : "bg-surface-container-high text-secondary"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === "Active" ? "bg-primary" : "bg-outline"
                          }`}
                        />
                        {s.status === "Active" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de TABLA — escritorio */}
            <div className="hidden lg:block card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm overflow-hidden">
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr className="bg-surface-container-high border-b border-outline-variant">
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 first:rounded-tl-2xl">
                          Día
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Hora inicio
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Hora fin
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5">
                          Estado
                        </th>
                        <th className="text-on-surface-variant text-label-sm uppercase tracking-wider font-semibold py-3.5 text-right last:rounded-tr-2xl">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60">
                      {schedules.map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <DayAvatar weekDay={s.weekDay} size="w-10 h-10" />
                              <span className="font-semibold text-on-surface text-body-md">
                                {WEEKDAY_LABELS[s.weekDay] ?? s.weekDay}
                              </span>
                            </div>
                          </td>
                          <td className="text-on-surface text-body-md">
                            <span className="inline-flex items-center gap-1.5">
                              <MdAccessTime className="text-base text-on-surface-variant" />
                              {formatTimeDisplay(s.startTime)}
                            </span>
                          </td>
                          <td className="text-on-surface text-body-md">
                            <span className="inline-flex items-center gap-1.5">
                              <MdAccessTime className="text-base text-on-surface-variant" />
                              {formatTimeDisplay(s.endTime)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center gap-1.5 badge badge-sm border-none font-medium ${
                                s.status === "Active"
                                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                                  : "bg-surface-container-high text-secondary"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  s.status === "Active"
                                    ? "bg-primary"
                                    : "bg-outline"
                                }`}
                              />
                              {s.status === "Active" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(s)}
                                className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-secondary-container/60"
                                data-tip="Editar"
                              >
                                <MdEdit className="text-lg text-secondary" />
                              </button>
                              {s.status === "Active" ? (
                                <button
                                  onClick={() => setConfirmId(s.id)}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-error-container/60"
                                  data-tip="Desactivar"
                                >
                                  <IoCloseCircle className="text-lg text-error" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRestore(s.id)}
                                  disabled={actionLoading}
                                  className="btn btn-ghost btn-sm btn-circle tooltip hover:bg-primary-container/20"
                                  data-tip="Reactivar"
                                >
                                  <MdRestoreFromTrash className="text-lg text-primary" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Paginación */}
        <Paginacion
          meta={meta}
          onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
          itemLabel="horarios"
        />
      </div>

      {/* Modal crear / editar horario */}
      {showFormModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
                <MdCalendarMonth className="text-xl text-on-primary-container" />
              </div>
              <button
                onClick={closeFormModal}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar"
              >
                <IoCloseSharp className="text-lg" />
              </button>
            </div>

            <h3 className="font-bold text-title-md text-on-surface">
              {editingSchedule ? "Editar horario" : "Nuevo horario"}
            </h3>
            <p className="text-body-md text-secondary mt-1">
              {editingSchedule
                ? "Modifica el día u horas de atención."
                : "Define un nuevo día y rango de atención."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-label-md font-semibold text-on-surface-variant">
                    Día de la semana
                  </span>
                </label>
                <select
                  value={form.weekDay}
                  onChange={(e) =>
                    setForm({ ...form, weekDay: e.target.value })
                  }
                  className="select select-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                >
                  <option value="" disabled>
                    Selecciona un día
                  </option>
                  {WEEKDAY_OPTIONS.map((day) => (
                    <option key={day} value={day}>
                      {WEEKDAY_LABELS[day]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Hora de entrada
                    </span>
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-label-md font-semibold text-on-surface-variant">
                      Hora de salida
                    </span>
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="input input-bordered bg-surface-container-low border-outline-variant focus:border-primary rounded-xl w-full"
                  />
                </div>
              </div>

              {formError && (
                <div className="alert bg-error-container border-none rounded-xl py-2.5">
                  <span className="text-body-sm text-on-error-container">
                    {formError}
                  </span>
                </div>
              )}

              <div className="modal-action gap-2 flex-col-reverse sm:flex-row pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={formLoading}
                  className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn bg-primary text-on-primary border-none rounded-full font-label-md hover:bg-primary-container w-full sm:w-auto"
                >
                  {formLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : editingSchedule ? (
                    "Guardar cambios"
                  ) : (
                    "Crear horario"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeFormModal} />
        </dialog>
      )}

      {/* Modal confirmación desactivar */}
      {confirmId && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-error-container flex items-center justify-center mb-3">
              <IoCloseCircle className="text-xl text-on-error-container" />
            </div>
            <h3 className="font-bold text-title-md text-on-surface">
              ¿Desactivar horario?
            </h3>
            <p className="text-body-md text-secondary mt-2">
              El horario dejará de aplicar en la atención al público. Puedes
              reactivarlo en cualquier momento.
            </p>
            <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
              <button
                onClick={() => setConfirmId(null)}
                className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={actionLoading}
                className="btn bg-error text-on-error border-none rounded-full font-label-md hover:brightness-95 w-full sm:w-auto"
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Desactivar"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmId(null)} />
        </dialog>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default MisHorarios;
