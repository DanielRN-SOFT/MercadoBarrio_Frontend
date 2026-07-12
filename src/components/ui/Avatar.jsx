import { useState, useEffect } from "react";

/**
 * Avatar — círculo con foto (si hay) o iniciales/texto de respaldo.
 * Reemplaza ProductAvatar, UserAvatar y DayAvatar, que eran la misma
 * estructura copiada tres veces (los propios comentarios del código lo
 * decían: "misma línea visual que ProductAvatar").
 *
 * Props:
 * - text: string              → texto fuente para las iniciales (nombre, día, etc.)
 * - photo: string | null      → ruta relativa o URL de la foto (opcional, solo productos la usan)
 * - buildPhotoUrl: (photo) => string  → función para construir la URL completa (opcional)
 * - icon: componente          → ícono de respaldo si no hay texto (ej. cuando `text` viene vacío)
 * - size: string              → clases de tamaño, ej. "w-11 h-11" (default "w-11 h-11")
 * - textSize: string          → clases de tamaño de texto (default "text-label-sm")
 * - rounded: string           → radio de borde (default "rounded-xl")
 */

const getInitials = (str = "") =>
  str
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const Avatar = ({
  text = "",
  photo = null,
  buildPhotoUrl,
  icon: Icon,
  size = "w-11 h-11",
  textSize = "text-label-sm",
  rounded = "rounded-xl",
}) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = photo && buildPhotoUrl ? buildPhotoUrl(photo) : photo;

  // Si cambia la foto (ej. al cambiar de fila/producto), reseteamos el error
  useEffect(() => {
    setImgError(false);
  }, [photo]);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={text || "avatar"}
        onError={() => setImgError(true)}
        className={`${size} ${rounded} object-cover shrink-0 border border-outline-variant/50`}
      />
    );
  }

  const initials = getInitials(text);

  return (
    <div
      className={`${size} ${rounded} bg-primary flex items-center justify-center shrink-0`}
    >
      <span className={`${textSize} font-bold text-on-primary`}>
        {initials || (Icon ? <Icon className="text-on-primary text-lg" /> : "?")}
      </span>
    </div>
  );
};

export default Avatar;
