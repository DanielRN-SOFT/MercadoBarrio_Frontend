/**
 * StatusBadge — badge con punto de color, para estados (Activo/Inactivo,
 * Completada/Cancelada, stock bajo, etc). Reemplaza el patrón repetido de
 * `<span className="badge badge-sm ...">` que aparecía copiado en casi
 * todas las páginas privadas.
 *
 * Props:
 * - label: string                → texto a mostrar
 * - tone: "primary" | "error" | "tertiary" | "secondary" | "neutral" | "pending"
 * - size: "sm" | "md"            → tamaño del badge (default "sm")
 * - withDot: boolean             → muestra el puntito de color (default true)
 * - className: string            → clases extra (ej. "hidden sm:inline-flex")
 */

const TONE_STYLES = {
  // Usado para: Activo, Completada, entradas de movimiento, stock normal
  primary: {
    bg: "bg-primary-fixed",
    text: "text-on-primary-fixed-variant",
    dot: "bg-primary",
  },
  // Usado para: Cancelada, Inactivo (crítico), salidas de movimiento
  error: {
    bg: "bg-error-container",
    text: "text-on-error-container",
    dot: "bg-error",
  },
  // Usado para: stock bajo/crítico, alertas suaves
  tertiary: {
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
    dot: "bg-tertiary-container",
  },
  // Usado para: stock normal (alternativa a primary en algunas tablas)
  secondary: {
    bg: "bg-secondary-fixed",
    text: "text-on-secondary-fixed-variant",
    dot: "bg-primary",
  },
  // Usado para: Inactivo, sin categoría, estados neutros
  neutral: {
    bg: "bg-surface-container-high",
    text: "text-secondary",
    dot: "bg-outline",
  },
  // Usado para: Pendiente (ej. tienda a la espera de aprobación)
  pending: {
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
    dot: "bg-secondary",
  },
};

const SIZE_STYLES = {
  sm: "badge-sm",
  md: "badge-md",
  lg: "badge-lg",
};

const StatusBadge = ({
  label,
  tone = "neutral",
  size = "sm",
  withDot = true,
  className = "",
}) => {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 badge ${SIZE_STYLES[size]} border-none font-medium ${styles.bg} ${styles.text} ${className}`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {label}
    </span>
  );
};

export default StatusBadge;
