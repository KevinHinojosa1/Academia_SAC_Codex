export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "cloudflare:workers") {
    return {
      url: new URL("../lib/server/cloudflare-shim.mjs", import.meta.url).href,
      shortCircuit: true,
    };
  }
  return defaultResolve(specifier, context);
}
