/**
 * IconButton — botón circular estilo "ghost" para acciones de fila/tarjeta
 * (editar, desactivar, ver historial, etc). Reemplaza los `<button>`/`<Link>`
 * con las mismas 4-5 clases repetidas decenas de veces en tablas y tarjetas.
 *
 * Props:
 * - icon: componente de ícono
 * - onClick: () => void          → si se usa como botón
 * - to: string                   → si se usa como link (requiere `as`)
 * - as: componente <Link>        → inyectado para no acoplar a react-router-dom
 * - label: string                → texto accesible (aria-label) y tooltip en escritorio
 * - tone: "secondary" | "error" | "primary" | "neutral" (default "neutral")
 * - showTooltip: boolean         → muestra el tooltip de daisyUI (default true, solo aplica en escritorio vía data-tip)
 * - disabled: boolean
 */

const TONE_HOVER = {
  secondary: "hover:bg-secondary-container/60",
  error: "hover:bg-error-container/60",
  primary: "hover:bg-primary-container/40",
  neutral: "hover:bg-surface-container-high",
};

const TONE_TEXT = {
  secondary: "text-secondary",
  error: "text-error",
  primary: "text-primary",
  neutral: "text-on-surface-variant",
};

const IconButton = ({
  icon: Icon,
  onClick,
  to,
  as: LinkComponent,
  label,
  tone = "neutral",
  showTooltip = true,
  disabled = false,
}) => {
  const className = `btn btn-ghost btn-sm btn-circle ${showTooltip ? "tooltip" : ""} ${TONE_HOVER[tone] ?? TONE_HOVER.neutral}`;
  const iconEl = <Icon className={`text-lg ${TONE_TEXT[tone] ?? TONE_TEXT.neutral}`} />;

  if (to && LinkComponent) {
    return (
      <LinkComponent to={to} className={className} data-tip={showTooltip ? label : undefined} aria-label={label}>
        {iconEl}
      </LinkComponent>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-tip={showTooltip ? label : undefined}
      aria-label={label}
    >
      {iconEl}
    </button>
  );
};

export default IconButton;
