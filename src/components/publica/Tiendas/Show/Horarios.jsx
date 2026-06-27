import React from "react";
import { MdAccessTime } from "react-icons/md";

const Horarios = ({ horarios }) => {
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
    });
  };
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <h2 className="card-title text-base flex items-center gap-2">
          <MdAccessTime className="text-primary" />
          Horarios de atención
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {horarios.map((h) => (
            <div
              key={h.id}
              className="flex flex-col bg-base-200 rounded-lg px-3 py-2"
            >
              <span className="text-xs font-semibold text-primary">
                {diasNombres[h.weekDay]}
              </span>
              <span className="text-xs text-on-surface/70">
                {formatHora(h.startTime)} – {formatHora(h.endTime)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Horarios;
