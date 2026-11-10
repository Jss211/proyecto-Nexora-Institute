const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const TOKEN_STORAGE_KEY = 'nexora_token';

interface RawApiResponse<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly message?: string;
}

/**
 * Typed HTTP helper that automatically attaches the stored Bearer JWT token.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type') && options?.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor backend. Verifica que esté ejecutándose.',
    );
  }

  const payload = (await response.json()) as RawApiResponse<T>;
  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.message ?? 'Error al comunicarse con el servidor',
    );
  }

  return payload.data as T;
}
