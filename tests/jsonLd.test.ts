// safeJsonLd — JSON-LD embedded in a <script> tag must not let a value
// break out of the element (stored XSS through an admin-entered product
// title/description containing </script>).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeJsonLd } from '../src/lib/jsonLd.ts';

describe('safeJsonLd', () => {
  it('escapes a closing script tag so it cannot break out of the element', () => {
    const out = safeJsonLd({
      name: '</script><script>alert(1)</script>',
    });
    assert.ok(!out.includes('</script'), 'must not contain a closing script tag');
    assert.ok(out.includes('\\u003c/script\\u003e'), 'escapes the angle brackets');
    // The escaped JSON still parses back to the original value.
    assert.deepEqual(JSON.parse(out), {
      name: '</script><script>alert(1)</script>',
    });
  });

  it('escapes & and the U+2028/U+2029 line separators', () => {
    const out = safeJsonLd({ text: 'A & B\u2028C\u2029D' });
    assert.ok(out.includes('\\u0026'), 'escapes &');
    assert.ok(out.includes('\\u2028'), 'escapes U+2028');
    assert.ok(out.includes('\\u2029'), 'escapes U+2029');
    assert.equal(JSON.parse(out).text, 'A & B\u2028C\u2029D');
  });

  it('round-trips a normal product object unchanged in meaning', () => {
    const product = {
      '@type': 'Product',
      name: 'JAZMIN 586 DHANAK 3 PIECE',
      offers: { '@type': 'Offer', priceCurrency: 'PKR', price: 4600 },
    };
    assert.deepEqual(JSON.parse(safeJsonLd(product)), product);
  });
});
