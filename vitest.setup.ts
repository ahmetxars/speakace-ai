const nativeFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl =
    input instanceof Request
      ? input.url
      : input instanceof URL
        ? input.toString()
        : String(input);

  try {
    if (new URL(rawUrl, "http://localhost").hostname === "api.openai.com") {
      throw new Error("Real OpenAI network calls are disabled in tests.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("OpenAI network calls")) {
      throw error;
    }
  }

  return nativeFetch(input, init);
}) as typeof fetch;
