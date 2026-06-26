const Input = ({ placeholder, type, id, value, onChange }) => {
  return (
    <input
      id={id}
      value={value}
      className="input input-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-full"
      placeholder={placeholder}
      type={type}
      onChange={onChange}
    />
  );
};

export default Input;
