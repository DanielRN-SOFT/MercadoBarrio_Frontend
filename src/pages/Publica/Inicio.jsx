import React from "react";

const Inicio = () => {
  return (
    <main className="pt-16 max-w-max-width mx-auto">
      <section className="bg-primary-container text-on-primary py-12 px-margin-mobile md:px-margin-desktop md:rounded-b-3xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg mb-2">
            MercadoBarrio
          </h2>
          <p className="font-body-md text-body-md opacity-90 mb-8">
            Tu mercado local en un click
          </p>
          <div className="relative max-w-xl mx-auto">
            <div className="flex items-center bg-surface rounded-full p-1 shadow-lg">
              <span
                className="material-symbols-outlined text-outline ml-4"
                data-icon="search"
              >
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface px-4 py-2 font-body-md text-body-md"
                placeholder="¿Qué buscas hoy en tu barrio?"
                type="text"
              />
              <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md active:scale-95 transition-all hover:opacity-90">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8 px-margin-mobile md:px-margin-desktop">
        <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-2">
          <button className="px-6 py-2 rounded-full border border-primary bg-primary text-on-primary whitespace-nowrap font-label-md text-label-md transition-all">
            Todos
          </button>
          <button className="px-6 py-2 rounded-full border border-outline hover:border-primary hover:text-primary whitespace-nowrap font-label-md text-label-md transition-all">
            Alimentos
          </button>
          <button className="px-6 py-2 rounded-full border border-outline hover:border-primary hover:text-primary whitespace-nowrap font-label-md text-label-md transition-all">
            Aseo
          </button>
          <button className="px-6 py-2 rounded-full border border-outline hover:border-primary hover:text-primary whitespace-nowrap font-label-md text-label-md transition-all">
            Lácteos
          </button>
          <button className="px-6 py-2 rounded-full border border-outline hover:border-primary hover:text-primary whitespace-nowrap font-label-md text-label-md transition-all">
            Panadería
          </button>
          <button className="px-6 py-2 rounded-full border border-outline hover:border-primary hover:text-primary whitespace-nowrap font-label-md text-label-md transition-all">
            Verduras
          </button>
        </div>
      </section>
      <section className="mt-8 px-margin-mobile md:px-margin-desktop mb-24 md:mb-12">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Tiendas cercanas
          </h3>
          <button className="text-primary font-label-md text-label-md hover:underline">
            Ver mapa
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-32 bg-surface-container relative">
              <img
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                data-alt="A warm and inviting local neighborhood grocery store interior with organized shelves of fresh produce and artisanal goods. The lighting is soft and natural, creating a community-focused and friendly atmosphere consistent with a modern minimalist aesthetic using a blue and white color palette."
                src="https://lh3.googleusercontent.com/aida/AP1WRLs8TY8i8hHAhvhEDvyhFsVUCG9EqZ3NmDp66A25O22SwyEF2p93EwRUCHWf3_2vsFepfxbxPL17mSOE7GGm1fxYgopl42MJ5egbRJeSvEyIhRkrXX1KlRBSTfYCnbyNqRMb3EciefCdUNTFkCS7A2zi_znZJu-O0iphYjgQOCUioPaz0Toya6o_kiZzulNaDnlBXJWAECCdnvhOYYalyFosMte9jWNE6Qxxc3VnYf0az7FeuW7lEo4PpUI"
              />
              <div className="absolute bottom-2 right-2">
                <span className="bg-success text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Abierto
                </span>
              </div>
            </div>
            <div className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-on-primary-container"
                  data-icon="storefront"
                >
                  storefront
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline-md text-headline-md text-on-surface mb-1">
                  Panadería "El Sol"
                </h4>
                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-4">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    data-icon="location_on"
                  >
                    location_on
                  </span>
                  <span className="">350m • Calle Mayor 12</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex text-tertiary">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      data-icon="star"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      star
                    </span>
                    <span className="ml-1 font-label-md text-label-md">
                      4.8
                    </span>
                  </div>
                  <button className="text-primary font-label-md text-label-md hover:bg-primary-fixed px-3 py-1 rounded-lg transition-colors">
                    Ver tienda
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-32 bg-surface-container relative">
              <img
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                data-alt="A vibrant local market stall featuring neatly arranged fresh fruits and vegetables in rustic wooden crates. The scene is bright and airy, reflecting a high-quality community shopping experience. The color story highlights natural greens and earthy tones against a clean, minimalist background with subtle blue accents."
                src="https://lh3.googleusercontent.com/aida/AP1WRLtDjmkImMQMV1pSVAgizNuVHoEI1-B8VQV75pt6WPnjlfC-zI_LXbGkEtRkLMrqs76aclqUpHJWf_Pasxaika65ZPW6Je9dXHM5j7-XU2qOpWJ00BCRKZBnQlkZI1LMI3gszHUoHRq0POdNPhJ0qTjYu4CHJty4K7CHAtHu51_NBzDlPhvnILzcYdpWuz07OuwS7blfu7Vjrww04SecoEK-n6jV6r6oShtGDv85iYp6tzmcXYOgxuQO4Q"
              />
              <div className="absolute bottom-2 right-2">
                <span className="bg-success text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Abierto
                </span>
              </div>
            </div>
            <div className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-on-secondary-container"
                  data-icon="nutrition"
                >
                  nutrition
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline-md text-headline-md text-on-surface mb-1">
                  Frutas Doña María
                </h4>
                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-4">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    data-icon="location_on"
                  >
                    location_on
                  </span>
                  <span className="">520m • Av. Central 45</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex text-tertiary">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      data-icon="star"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      star
                    </span>
                    <span className="ml-1 font-label-md text-label-md">
                      4.5
                    </span>
                  </div>
                  <button className="text-primary font-label-md text-label-md hover:bg-primary-fixed px-3 py-1 rounded-lg transition-colors">
                    Ver tienda
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow group opacity-75">
            <div className="h-32 bg-surface-container relative grayscale">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                data-alt="A clean, organized neighborhood mini-market with well-stocked shelves showing household cleaning supplies and dairy products. The lighting is bright and even, giving a professional and reliable feel to the local business. The style is modern and flat, prioritizing clarity and ease of use in a neighborhood context."
                src="https://lh3.googleusercontent.com/aida/AP1WRLuuswBEhGHUDeb1_9_wJBz8TpJNKbn8WNtOFhgvQWZoB2Y2mfCkOBlQ2O8jtAXXf4UXTS8uUefAVsDpJr0zNPO3fgB0sXNj3OBBpKtX3zJY_FcbOJQi5TBfsgatBobOF_kSsrxQZ21VIHQApEcjdinBiOPN2RC7MlqtWidwVdiCnRkBM30RJT00e0RoNG_geMfzCvGSXpbecDFfb3Pg8ItV0ryA8yOCSe8TfcwhViypXMM7w-dzvNyVHqY"
              />
              <div className="absolute bottom-2 right-2">
                <span className="bg-error text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Cerrado
                </span>
              </div>
            </div>
            <div className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-dim flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="cleaning_services"
                >
                  cleaning_services
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline-md text-headline-md text-on-surface mb-1">
                  Minimarket Express
                </h4>
                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-4">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    data-icon="location_on"
                  >
                    location_on
                  </span>
                  <span className="">800m • Pasaje Luna 3</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex text-tertiary">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      data-icon="star"
                      style={{
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      star
                    </span>
                    <span className="ml-1 font-label-md text-label-md">
                      4.2
                    </span>
                  </div>
                  <button className="text-primary font-label-md text-label-md hover:bg-primary-fixed px-3 py-1 rounded-lg transition-colors">
                    Ver tienda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inicio;
