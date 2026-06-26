const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const fetchCliente = async (endpoint, options = {}) => {
  const { body, headers: customHeaders, ...rest } = options;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Lanzas el objeto completo, no un new Error()
    throw {
      message: errorData.message ?? `Error ${response.status}`,
      status: response.status,
      ...errorData, // todas las propiedades que envíe tu API
    };
  }

  return response.json();
};

export default fetchCliente;
