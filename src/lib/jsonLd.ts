// Serialize an object for embedding in a <script type="application/ld+json">
// tag. Plain JSON.stringify is unsafe there: a value containing
// `</script>` (e.g. an admin-entered product title or description) would
// break out of the script element and let the value run as HTML — a
// stored-XSS vector through the admin panel. Escaping <, > and & (plus
// the U+2028/U+2029 line separators, which are legal in JSON strings
// but terminate JS strings) keeps the JSON valid — the escapes are legal
// JSON string escapes — while making breakout impossible.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
