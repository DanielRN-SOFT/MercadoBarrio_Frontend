const Button = ({ mensaje }) => {
  return (
    <button
      type="submit"
      className="btn btn-primary w-full bg-primary-container text-on-primary hover:bg-primary border-none mt-4 font-label-md text-label-md h-12"
    >
      {mensaje}
    </button>
  );
};

export default Button;
