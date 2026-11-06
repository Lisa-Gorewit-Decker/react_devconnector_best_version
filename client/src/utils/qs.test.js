import qs from 'qs';

describe('qs GHSA-6pq8-jhm2-2vcw regression', () => {
  describe.each([false, true])('encodeValuesOnly: %s', (encodeValuesOnly) => {
    const options = { arrayFormat: 'comma', encodeValuesOnly };

    test.each([
      ['JSON', () => JSON.parse('{"a":[{"toString":"x"}]}')],
      [
        'allowPrototypes',
        () => qs.parse('a[0][toString]=x', { allowPrototypes: true })
      ],
      ['plainObjects', () => qs.parse('a[][b]=c', { plainObjects: true })],
      ['nested arrays', () => ({ a: [[{ toString: 'x' }]] })]
    ])('serializes %s object elements without throwing', (_source, create) => {
      expect(qs.stringify(create(), options)).toBe('a=%5Bobject%20Object%5D');
    });

    test('preserves ordinary comma serialization', () => {
      expect(qs.stringify({ a: ['x', 'y'] }, options)).toBe(
        encodeValuesOnly ? 'a=x,y' : 'a=x%2Cy'
      );
      expect(qs.stringify({ a: [{ toString: () => 'z' }] }, options)).toBe('a=z');
    });
  });

  test('preserves the default array format', () => {
    expect(qs.stringify({ a: [{ toString: 'x' }] })).toBe(
      'a%5B0%5D%5BtoString%5D=x'
    );
  });
});
