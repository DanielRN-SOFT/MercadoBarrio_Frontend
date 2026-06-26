import { useEffect, useState } from "react";
import {
  IoCheckmarkCircle,
  IoWarning,
  IoCloseCircle,
  IoInformationCircle,
  IoClose,
} from "react-icons/io5";

const icons = {
  success: <IoCheckmarkCircle className="text-xl shrink-0" />,
  warning: <IoWarning className="text-xl shrink-0" />,
  error: <IoCloseCircle className="text-xl shrink-0" />,
  info: <IoInformationCircle className="text-xl shrink-0" />,
};

const styles = {
  success: "bg-primary text-on-primary",
  warning: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error text-on-error",
  info: "bg-surface-container-highest text-on-surface",
};

const Toast = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleRemove = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-65 max-w-85 transition-all duration-300 ${styles[toast.type]} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {icons[toast.type]}
      <p className="font-body-md text-body-md flex-1">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <IoClose className="text-lg" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
