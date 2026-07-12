/**
 * SkeletonList — filas de "esqueleto" mientras carga un listado. Reemplaza
 * el bloque `{[1,2,3,4].map(...)}` con skeletons que estaba copiado casi
 * igual en todas las páginas de listado.
 *
 * Props:
 * - rows: number             → cantidad de filas placeholder (default 4)
 * - avatar: boolean          → si muestra el círculo de avatar (default true)
 * - actionPill: boolean      → si muestra la píldora de acción a la derecha, solo visible en escritorio (default true)
 */
const SkeletonList = ({ rows = 4, avatar = true, actionPill = true }) => (
  <div className="space-y-4 p-4 sm:p-6">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        {avatar && <div className="skeleton w-11 h-11 rounded-xl shrink-0" />}
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/3 rounded-full" />
          <div className="skeleton h-3 w-1/4 rounded-full" />
        </div>
        {actionPill && (
          <div className="skeleton h-8 w-20 rounded-full hidden sm:block" />
        )}
      </div>
    ))}
  </div>
);

export default SkeletonList;
