/**
 * ConfirmModal — modal de confirmación para acciones destructivas o
 * irreversibles (desactivar, eliminar, cancelar). Reemplaza el patrón
 * `<dialog open className="modal modal-bottom sm:modal-middle">...</dialog>`
 * que estaba copiado en 12 páginas distintas, cada una con su propio ícono
 * y textos pero la misma estructura.
 *
 * Props:
 * - open: boolean                 → si es false, no renderiza nada
 * - icon: componente de ícono     → ej. MdDelete, IoWarning (react-icons)
 * - tone: "error" | "primary"     → color del círculo del ícono (default "error")
 * - title: string
 * - message: string | ReactNode
 * - confirmLabel: string          → texto del botón de confirmar (default "Confirmar")
 * - cancelLabel: string           → texto del botón de cancelar (default "Cancelar")
 * - loading: boolean              → muestra spinner y deshabilita botones
 * - onConfirm: () => void
 * - onCancel: () => void
 */

const TONE_STYLES = {
  error: {
    iconBg: "bg-error-container",
    iconText: "text-on-error-container",
    confirmBtn: "bg-error text-on-error hover:brightness-95",
  },
  primary: {
    iconBg: "bg-primary-container",
    iconText: "text-on-primary-container",
    confirmBtn: "bg-primary text-on-primary hover:bg-primary-container",
  },
};

const ConfirmModal = ({
  open,
  icon: Icon,
  tone = "error",
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const styles = TONE_STYLES[tone] ?? TONE_STYLES.error;

  return (
    <dialog open className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl">
        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-3`}
          >
            <Icon className={`text-xl ${styles.iconText}`} />
          </div>
        )}
        <h3 className="font-bold text-title-md text-on-surface">{title}</h3>
        {message && (
          <p className="text-body-md text-secondary mt-2">{message}</p>
        )}
        <div className="modal-action gap-2 flex-col-reverse sm:flex-row">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost rounded-full font-label-md w-full sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn border-none rounded-full font-label-md w-full sm:w-auto ${styles.confirmBtn}`}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={loading ? undefined : onCancel} />
    </dialog>
  );
};

export default ConfirmModal;
