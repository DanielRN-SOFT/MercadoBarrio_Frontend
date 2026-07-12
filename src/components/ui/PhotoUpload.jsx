import { MdAddAPhoto, MdBrokenImage, MdClose } from "react-icons/md";

/**
 * PhotoUpload — zona de subida/preview de una sola imagen (dashed box +
 * input file oculto + botón "Cambiar imagen"). Extraído de ProductoForm y
 * MiTienda, que tenían el mismo bloque duplicado.
 *
 * El estado (archivo, preview, error de carga) sigue viviendo en la página
 * que lo usa — este componente es puramente presentacional/controlado.
 *
 * Props:
 * - id: string             → id del <input type="file">, debe ser único en la página
 * - previewUrl: string     → URL (blob o remota) a mostrar; vacío = estado "sin imagen"
 * - error: boolean         → true si la imagen de previewUrl falló al cargar
 * - onError: () => void    → se dispara en el onError del <img>
 * - onChange: (e) => void  → onChange del <input type="file">
 * - onRemove: () => void   → click en el botón "quitar" (ícono X sobre la imagen)
 * - emptyTitle/emptyHint: string → textos del estado vacío (personalizable por página)
 * - accept: string         → default "image/jpeg,image/png,image/webp"
 */
const PhotoUpload = ({
  id = "photo-upload",
  previewUrl = "",
  error = false,
  onError,
  onChange,
  onRemove,
  emptyTitle = "Aún no hay imagen",
  emptyHint = "Haz clic para subir una imagen",
  accept = "image/jpeg,image/png,image/webp",
}) => (
  <>
    <div className="relative rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center bg-surface-container-lowest min-h-40 overflow-hidden">
      {previewUrl && !error ? (
        <>
          <img
            src={previewUrl}
            alt="Vista previa"
            className="min-h-40 w-full object-cover"
            onError={onError}
          />
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-circle btn-sm absolute top-2 right-2 bg-surface/90 hover:bg-error hover:text-on-error border-none shadow-sm"
            aria-label="Quitar imagen"
          >
            <MdClose className="text-base" />
          </button>
        </>
      ) : previewUrl && error ? (
        <div className="flex flex-col items-center gap-2 text-error p-8">
          <MdBrokenImage className="text-3xl" />
          <p className="font-label-md text-label-md">
            No se pudo cargar la imagen
          </p>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex flex-col items-center p-8 cursor-pointer w-full h-full"
        >
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4">
            <MdAddAPhoto className="text-primary text-3xl" />
          </div>
          <p className="font-label-md text-label-md text-on-surface mb-1">
            {emptyTitle}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {emptyHint}
          </p>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
    </div>

    {previewUrl && (
      <label
        htmlFor={id}
        className="btn btn-sm btn-outline w-full rounded-full cursor-pointer"
      >
        Cambiar imagen
      </label>
    )}
  </>
);

export default PhotoUpload;
