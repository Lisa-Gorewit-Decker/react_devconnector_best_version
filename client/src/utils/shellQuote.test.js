import { parse, quote } from 'shell-quote';

describe('shell-quote GHSA-pqg4-j6r4-53mv regression', () => {
  test.each(['\n', '\r', '\u2028', '\u2029'])(
    'rejects a line terminator %j after a comment token',
    (terminator) => {
      expect(() =>
        quote(['echo', 'ok', { comment: 'x' }, `a${terminator}id;#`])
      ).toThrow(TypeError);
      expect(() =>
        quote(parse('echo http://example.com/#frag').concat(`a${terminator}id;#`))
      ).toThrow(TypeError);
    }
  );

  test('preserves quoting without a comment token', () => {
    const tokens = ['echo', 'a\nb', 'a\rb', 'a\u2028b', 'a\u2029b'];
    expect(parse(quote(tokens))).toEqual(tokens);
  });
});
