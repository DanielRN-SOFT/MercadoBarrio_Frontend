import React from "react";

const PaginacionProductos = ({page, meta, setPage}) => {
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
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`join-item btn ${p === page ? "btn-active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
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

export default PaginacionProductos;
