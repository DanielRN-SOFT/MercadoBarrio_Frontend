const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const fetchCliente = async (endpoint, options = {}) => {
  const { body, headers: customHeaders, ...rest } = options;
  const isFormData = body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    credentials: "include",
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message ?? `Error ${response.status}`,
      status: response.status,
      ...errorData,
    };
  }
  return response.json();
};

export default fetchCliente;
