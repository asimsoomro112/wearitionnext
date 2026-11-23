// Pricing — the server order route prices every order from these
// functions (never from client numbers), so the published policy is
// locked here: shipping Rs. 250 first suit + Rs. 50 each extra, free at
// Rs. 12,500; customer tax 3% on COD only, 0% on advance payment,
// store absorbs the other 1% of the 4% government tax.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateShipping } from '../src/lib/shipping.ts';
import { calculateCustomerTax, calculateStoreAbsorbedTax } from '../src/lib/tax.ts';

describe('calculateShipping', () => {
  it('charges Rs. 250 for the first suit', () => {
    assert.equal(calculateShipping(4000, 1), 250);
  });
  it('adds Rs. 50 per additional suit', () => {
    assert.equal(calculateShipping(8000, 2), 300);
    assert.equal(calculateShipping(12000, 3), 350);
  });
  it('is free at Rs. 12,500 subtotal', () => {
    assert.equal(calculateShipping(12500, 3), 0);
    assert.equal(calculateShipping(20000, 5), 0);
  });
  it('is zero for an empty order', () => {
    assert.equal(calculateShipping(0, 0), 0);
    assert.equal(calculateShipping(4000, 0), 0);
  });
});

describe('calculateCustomerTax', () => {
  it('charges 3% on COD, rounded to the rupee', () => {
    assert.equal(calculateCustomerTax(5000, 'cod'), 150);
    assert.equal(calculateCustomerTax(3333, 'cod'), 100);
  });
  it('is zero on advance payment', () => {
    for (const method of ['easypaisa', 'jazzcash', 'bank']) {
      assert.equal(calculateCustomerTax(5000, method), 0);
    }
  });
  it('is zero on a zero subtotal', () => {
    assert.equal(calculateCustomerTax(0, 'cod'), 0);
  });
});

describe('calculateStoreAbsorbedTax', () => {
  it('is 1% on COD (bookkeeping only, never charged)', () => {
    assert.equal(calculateStoreAbsorbedTax(5000, 'cod'), 50);
  });
  it('is zero on advance payment', () => {
    assert.equal(calculateStoreAbsorbedTax(5000, 'bank'), 0);
  });
});

describe('order total', () => {
  it('is subtotal + shipping + customer tax (Rs. 5,000 COD suit = Rs. 5,400)', () => {
    const subtotal = 5000;
    const total =
      subtotal +
      calculateShipping(subtotal, 1) +
      calculateCustomerTax(subtotal, 'cod');
    assert.equal(total, 5400);
  });
});
