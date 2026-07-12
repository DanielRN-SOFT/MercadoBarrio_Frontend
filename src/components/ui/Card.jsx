/**
 * Card — contenedor con el estilo estándar (`card bg-surface-container-lowest
 * border ... rounded-2xl shadow-sm`) que se repite como envoltorio de casi
 * todo: filtros, tablas, listas, estados vacíos. En vez de forzar un único
 * layout interno, deja el contenido libre y solo estandariza el marco.
 *
 * Props:
 * - children: ReactNode
 * - className: string     → clases extra en el <div> exterior
 * - bodyClassName: string → clases del padding interno (default "p-4 sm:p-5")
 *                           pasar "" o "p-0" para controlar el padding manualmente (ej. tablas)
 * - overflowHidden: boolean → agrega overflow-hidden (útil para tablas con scroll interno)
 */
const Card = ({
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
  overflowHidden = false,
}) => (
  <div
    className={`card bg-surface-container-lowest border border-outline-variant/70 rounded-2xl shadow-sm ${
      overflowHidden ? "overflow-hidden" : ""
    } ${className}`}
  >
    <div className={`card-body ${bodyClassName}`}>{children}</div>
  </div>
);

export default Card;
