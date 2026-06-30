const Input = ({ placeholder, type, id, name, value, onChange, disabled = false, className = "" }) => {
  return (
    <input
      id={id}
      name={name}
      value={value}
      className={`input input-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-full ${className}`}
      placeholder={placeholder}
      type={type}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default Input;
