const SelectorCategorias = () => {
  return (
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
  );
};

export default SelectorCategorias;
