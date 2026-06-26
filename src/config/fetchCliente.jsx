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
    credentials: "include", // ← envía las cookies automáticamente
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `Error ${response.status}`);
  }

  return response.json();
};

export default fetchCliente;
