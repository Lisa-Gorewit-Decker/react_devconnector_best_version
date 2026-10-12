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

  test('continues escaping the same payload as data', () => {
    const output = serialize({ source }, { isJSON: true });

    expect(output).not.toMatch(/<\/script/i);
    expect(JSON.parse(output)).toEqual({ source });
  });
});
