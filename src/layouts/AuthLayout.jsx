import { Link, Outlet } from "react-router-dom";
import { IoStorefrontSharp } from "react-icons/io5";
const AuthLayout = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <main className="grow flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
          <div className="card card-bordered bg-surface-container-lowest border-outline-variant shadow-sm w-full transition-all duration-300">
            <div className="card-body gap-6 p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center text-on-primary shadow-lg transform transition-transform hover:scale-105">
                  <IoStorefrontSharp className="text-4xl" />
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  MercadoBarrio
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-70">
                  Bienvenido de nuevo a tu comunidad local.
                </p>
              </div>
              {/* Formulario */}
              <Outlet />
              {/* FinFormulario */}
            </div>
          </div>
          <div className="flex justify-center items-center mt-5">
            <Link
              className="font-label-md text-label-md text-primary font-bold hover:underline ml-1"
              to={"/"}
            >
              Acceder a la pagina publica
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
