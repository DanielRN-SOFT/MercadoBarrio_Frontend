/**
 * Button — botón de acción principal reutilizable. Compatible con el uso
 * original (`<Button mensaje="Enviar" />` para formularios de Auth) y
 * extendido con `disabled`/`loading`, que antes se pasaban pero el
 * componente los ignoraba silenciosamente (ej. Login.jsx pasaba
 * `disabled={loading}` sin ningún efecto real).
 *
 * Props:
 * - mensaje: string        → texto del botón (compatibilidad con el uso original)
 * - children: ReactNode    → alternativa a `mensaje` para contenido más rico
 * - type: string           → default "submit" (mismo default que antes)
 * - disabled: boolean
 * - loading: boolean       → muestra spinner y fuerza disabled
 * - fullWidth: boolean     → default true (mismo comportamiento que antes)
 * - variant: "primary" | "ghost" | "error" (default "primary")
 * - onClick, className, ...rest
 */

const VARIANT_STYLES = {
  primary:
    "btn-primary bg-primary-container text-on-primary hover:bg-primary border-none",
  ghost: "btn-ghost",
  error: "bg-error text-on-error border-none hover:brightness-95",
};

const Button = ({
  mensaje,
  children,
  type = "submit",
  disabled = false,
  loading = false,
  fullWidth = true,
  variant = "primary",
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`btn ${VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary} ${
        fullWidth ? "w-full" : ""
      } mt-4 font-label-md text-label-md h-12 disabled:opacity-60 ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        children ?? mensaje
      )}
    </button>
  );
};

export default Button;
