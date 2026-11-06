/** @jest-environment node */
import { webcrypto } from 'crypto';
import { runInNewContext } from 'vm';

global.crypto = webcrypto;
const serialize = require('serialize-javascript');

describe('serialize-javascript GHSA-gfhx-hw2g-v5hg regression', () => {
  const source =
    "function f(x){ return x</script=+/ + '</script><img src=x onerror=alert(1)>' }";

  test('escapes script end tags in function bodies without changing behavior', () => {
    const original = runInNewContext(`(${source})`);
    const output = serialize({ h: original });

    expect(output).not.toMatch(/<\/script(?=[\t\n\f\r />])/i);

    const restored = runInNewContext(`(${output})`);
    expect(typeof restored.h).toBe('function');
    expect(restored.h('input')).toBe(original('input'));
  });

  describe('serialize-javascript GHSA-m5mm-p8h7-m29v regression', () => {
    test.each(['</script', '</ScRiPt'])(
      'escapes a bare %s at the end of a function source',
      (endTag) => {
        function f() {}
        f.toString = () => `function f(){ return 1 }//${endTag}`;
        function g() {}
        g.toString = () =>
          'function g(x){ return x } > <img src=x onerror=alert(1)>';

        const output = serialize({ a: { f }, g }, { space: 2 });

        expect(output).not.toMatch(/<\/script(?=[\t\n\f\r />]|$)/i);
        expect(output).toContain('\\u003C\\u002F');
      }
    );
  });

  test('continues escaping the same payload as data', () => {
    const output = serialize({ source }, { isJSON: true });

    expect(output).not.toMatch(/<\/script/i);
    expect(JSON.parse(output)).toEqual({ source });
  });
});
