import React from "react";
import { MdAccessTime } from "react-icons/md";

const WEEK_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const diasNombres = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo",
};

const formatHora = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
};

const Horarios = ({ horarios }) => {
  // Agrupa las jornadas por día de la semana
  const porDia = horarios.reduce((acc, h) => {
    if (!acc[h.weekDay]) acc[h.weekDay] = [];
    acc[h.weekDay].push(h);
    return acc;
  }, {});

  // Ordena los días según el orden de la semana (Lunes -> Domingo)
  // y, dentro de cada día, ordena las jornadas por hora de inicio
  const dias = Object.keys(porDia)
    .sort((a, b) => WEEK_ORDER[a] - WEEK_ORDER[b])
    .map((weekDay) => ({
      weekDay,
      jornadas: porDia[weekDay].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime),
      ),
    }));

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <h2 className="card-title text-base flex items-center gap-2">
          <MdAccessTime className="text-primary" />
          Horarios de atención
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {dias.map(({ weekDay, jornadas }) => (
            <div
              key={weekDay}
              className="flex flex-col bg-base-200 rounded-lg px-3 py-2"
            >
              <span className="text-xs font-semibold text-primary">
                {diasNombres[weekDay]}
              </span>
              <div className="flex flex-col gap-0.5">
                {jornadas.map((h) => (
                  <span key={h.id} className="text-xs text-on-surface/70">
                    {formatHora(h.startTime)} – {formatHora(h.endTime)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Horarios;
