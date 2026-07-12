/**
 * EmptyState — bloque de "sin resultados" / "aún no tienes X", con ícono,
 * título, mensaje y una acción opcional. Reemplaza el bloque que se repetía
 * en cada listado (productos, usuarios, proveedores, movimientos, etc.)
 * con las mismas clases y solo cambiaban los textos.
 *
 * Props:
 * - icon: componente de ícono
 * - title: string
 * - message: string
 * - action: { label, to, onClick, icon } | undefined
 *     Si trae `to`, se renderiza como <Link>; si no, como <button>.
 * - actionAs: componente <Link> a inyectar cuando se usa `to` (evita
 *   importar react-router-dom dentro de este componente genérico)
 */

const EmptyState = ({ icon: Icon, title, message, action, actionAs: LinkComponent }) => {
  const ActionIcon = action?.icon;

  return (
    <div className="text-center py-16 sm:py-20 px-6 text-secondary">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mx-auto mb-4">
          <Icon className="text-3xl opacity-40" />
        </div>
      )}
      <p className="font-semibold text-on-surface text-body-lg">{title}</p>
      {message && <p className="text-body-md mt-1">{message}</p>}

      {action &&
        (action.to && LinkComponent ? (
          <LinkComponent
            to={action.to}
            className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
          >
            {ActionIcon && <ActionIcon className="text-xl" />}
            {action.label}
          </LinkComponent>
        ) : (
          <button
            onClick={action.onClick}
            className="btn bg-primary text-on-primary border-none rounded-full mt-6 font-label-md text-label-md hover:bg-primary-container"
          >
            {ActionIcon && <ActionIcon className="text-xl" />}
            {action.label}
          </button>
        ))}
    </div>
  );
};

export default EmptyState;
