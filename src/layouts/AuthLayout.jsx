import { Link, Outlet } from "react-router-dom";
import { IoStorefrontSharp, IoArrowForward } from "react-icons/io5";
import { useEffect, useState } from "react";

const AuthLayout = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative bg-background text-on-background min-h-screen flex flex-col overflow-hidden">
      {/* Textura de puntos de fondo */}
      <div
        className="absolute inset-0 -z-20 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: "var(--outline-variant, #9199a1)",
        }}
      />

      {/* Halos de fondo, más grandes y con movimiento sutil */}
      <div className="absolute top-[-15%] left-[-10%] w-md h-112 bg-primary/10 rounded-full blur-3xl -z-10 motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-md h-112 bg-secondary/10 rounded-full blur-3xl -z-10 motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />

      <main className="grow flex items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div
          className={`relative w-full max-w-md transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="card card-bordered bg-surface-container-lowest/90 backdrop-blur-xl border-outline-variant/60 shadow-md w-full overflow-hidden rounded-3xl transition-all duration-300">
            {/* Toldo de puesto de mercado */}
            <div className="relative drop-shadow-md">
              <svg
                viewBox="0 0 400 64"
                preserveAspectRatio="none"
                className="w-full h-16 block"
              >
                <defs>
                  <pattern
                    id="awningStripes"
                    width="40"
                    height="64"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="20" height="64" className="fill-primary" />
                    <rect
                      x="20"
                      width="20"
                      height="64"
                      className="fill-secondary-container"
                    />
                  </pattern>
                </defs>
                {/* Remate superior, tono más oscuro simulando el dobladillo */}
                <rect width="400" height="6" className="fill-primary/90" />
                <path
                  d="M0,6 H400 V22
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     a20,20 0 0 1 -40,0
                     Z"
                  fill="url(#awningStripes)"
                />
              </svg>

              {/* Ícono "colgando" del toldo, con anillo de pulso */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 ">
                <span className="absolute inset-0 rounded-xl bg-primary/40" />
                <div className="relative w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container shadow-lg ring-4 ring-surface-container-lowest transition-transform hover:scale-105 hover:-rotate-3">
                  <IoStorefrontSharp className="text-4xl" />
                </div>
              </div>
            </div>

            <div className="card-body gap-6 p-8 pt-11">
              <div className="flex flex-col items-center gap-3 text-center">
                <h1 className="font-headline-lg text-headline-lg text-primary bg-clip-text text-transparent tracking-tight">
                  MercadoBarrio
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-70">
                  Bienvenido de nuevo a tu comunidad local.
                </p>
              </div>

              <div className="h-px bg-linear-to-r from-transparent via-outline-variant to-transparent" />

              {/* Formulario */}
              <Outlet />
              {/* FinFormulario */}
            </div>
          </div>

          <div className="flex justify-center items-center mt-6">
            <Link
              className="group font-label-md text-label-md text-primary font-bold flex items-center gap-1.5 rounded-full border border-outline-variant/60 px-4 py-2 transition-all hover:bg-primary-container/30 hover:border-primary/40"
              to={"/"}
            >
              Acceder a la página pública
              <IoArrowForward className="text-base transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
