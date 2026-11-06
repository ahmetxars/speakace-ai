const uncertainOutcome =
  "İşlem sonucu doğrulanamadı. Tekrar göndermeden önce listeyi yenileyerek kontrol et.";

/** Never retry an admin mutation: a lost response may still have changed the record. */
export async function requestAdminAction<T extends object = { error?: string }>(
  url: string,
  options: RequestInit,
  failureMessage: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error(uncertainOutcome);
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(response.ok ? uncertainOutcome : failureMessage);
  }
  if (!response.ok) {
    const error =
      data && typeof data === "object" && "error" in data ? data.error : null;
    throw new Error(
      typeof error === "string" && error.trim() ? error : failureMessage,
    );
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error(uncertainOutcome);
  return data as T;
}
