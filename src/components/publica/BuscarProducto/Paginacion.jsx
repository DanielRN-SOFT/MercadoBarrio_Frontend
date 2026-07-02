import React from "react";

const Paginacion = ({setPage, getPaginas, meta, page}) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="join">
        <button
          className="join-item btn btn-primary"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          «
        </button>

        {getPaginas(page, meta.totalPages).map((p, idx) =>
          p === "..." ? (
            <button key={`dots-${idx}`} className="join-item btn btn-disabled">
              ...
            </button>
          ) : (
            <button
              key={p}
              className={`join-item btn ${p === page ? "btn-active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className="join-item btn btn-primary"
          disabled={page === meta.totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Paginacion;
