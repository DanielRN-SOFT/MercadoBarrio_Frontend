import { IoChevronBack, IoChevronForward } from "react-icons/io5";

/**
 * Paginación reutilizable.
 *
 * Props:
 * - meta: { page, totalPages, total }
 * - onPageChange: (nuevaPagina) => void   → función que carga los datos de esa página
 * - itemLabel: string                     → nombre en plural de lo que se está paginando (ej: "productos", "tiendas")
 * - scrollTop: boolean                    → si hace scroll suave al cambiar de página (default true)
 */
const Paginacion = ({
  meta,
  onPageChange,
  itemLabel = "resultados",
  scrollTop = true,
}) => {
  if (!meta || meta.totalPages <= 1) return null;

  const handlePageChange = (nuevaPagina) => {
    if (
      nuevaPagina < 1 ||
      nuevaPagina > meta.totalPages ||
      nuevaPagina === meta.page
    )
      return;
    onPageChange(nuevaPagina);
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={meta.page === 1}
          className="btn btn-ghost btn-sm btn-circle disabled:opacity-30"
          aria-label="Página anterior"
        >
          <IoChevronBack className="text-lg" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span
              key={`dots-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-body-md select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 rounded-full text-label-md font-semibold transition-colors ${
                p === meta.page
                  ? "bg-primary text-on-primary shadow-sm shadow-primary/25"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              aria-current={p === meta.page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={meta.page === meta.totalPages}
          className="btn btn-ghost btn-sm btn-circle disabled:opacity-30"
          aria-label="Página siguiente"
        >
          <IoChevronForward className="text-lg" />
        </button>
      </div>

      <span className="text-body-md text-on-surface-variant">
        Página{" "}
        <span className="font-semibold text-on-surface">{meta.page}</span> de{" "}
        {meta.totalPages}
        {typeof meta.total === "number" && (
          <>
            {" "}
            ({meta.total} {itemLabel})
          </>
        )}
      </span>
    </div>
  );
};

export default Paginacion;
