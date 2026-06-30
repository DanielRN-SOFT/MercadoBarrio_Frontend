import React from "react";

const Paginacion = ({meta, obtenerStores, filtros}) => {
  const handlePageChange = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > meta.totalPages) return;
    obtenerStores(nuevaPagina, filtros);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Genera un rango corto de páginas (ej: 1 ... 4 5 [6] 7 8 ... 12)
  const getPageNumbers = () => {
    const { page, totalPages } = meta;
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };
  return (
    <div className="flex flex-col items-center gap-2 mt-10">
      <div className="join">
        <button
          className="join-item btn btn-primary"
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={meta.page === 1}
        >
          «
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <button key={`dots-${idx}`} className="join-item btn btn-disabled">
              ...
            </button>
          ) : (
            <button
              key={p}
              className={`join-item btn ${p === meta.page ? "btn-active" : ""}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className="join-item btn btn-primary"
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={meta.page === meta.totalPages}
        >
          »
        </button>
      </div>

      <span className="text-sm text-base-content/60">
        Página {meta.page} de {meta.totalPages} ({meta.total} tiendas)
      </span>
    </div>
  );
};

export default Paginacion;
