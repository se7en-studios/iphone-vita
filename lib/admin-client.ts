/*
 * Cliente de /api/admin para componentes del panel.
 * Toda respuesta no-ok se convierte en Error con el `error` que manda la API,
 * para mostrarlo tal cual en un toast o en el formulario.
 */
export async function adminApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isForm = init?.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: isForm
        ? init?.headers
        : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Sin conexión con el servidor. Revisá tu internet.");
  }
  const body = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;
  if (!res.ok) {
    if (res.status === 401)
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    throw new Error(body?.error ?? `Error ${res.status}`);
  }
  return body as T;
}
