const Input = ({ placeholder, type, id }) => {
  return (
    <input
      id={id}
      className="input input-bordered border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary w-full font-body-md text-body-md rounded-full"
      placeholder={placeholder}
      required
      type={type}
    />
  );
};

export default Input;
