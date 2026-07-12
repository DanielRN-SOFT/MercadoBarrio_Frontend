/**
 * PageHeader — encabezado estándar de las páginas privadas: ícono cuadrado,
 * título, subtítulo (con contador opcional) y un botón/link de acción a la
 * derecha. Reemplaza el bloque `<div className="flex ... justify-between">`
 * copiado al inicio de cada página de listado.
 *
 * Props:
 * - icon: componente de ícono
 * - title: string
 * - subtitle: string | ReactNode
 * - action: { label, to, onClick, icon } | undefined
 * - actionAs: componente <Link> (para usar `to`)
 */

const PageHeader = ({ icon: Icon, title, subtitle, action, actionAs: LinkComponent }) => {
  const ActionIcon = action?.icon;

  const actionClass =
    "btn bg-primary text-on-primary border-none hover:bg-primary-container gap-2 rounded-full font-label-md text-label-md shadow-sm shadow-primary/25 transition-colors w-full sm:w-auto";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <Icon className="text-lg sm:text-xl text-on-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm sm:text-body-md text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action &&
        (action.to && LinkComponent ? (
          <LinkComponent to={action.to} className={actionClass}>
            {ActionIcon && <ActionIcon className="text-xl" />}
            {action.label}
          </LinkComponent>
        ) : (
          <button onClick={action.onClick} className={actionClass}>
            {ActionIcon && <ActionIcon className="text-xl" />}
            {action.label}
          </button>
        ))}
    </div>
  );
};

export default PageHeader;
