import { createRequire } from 'module';

const { Minimatch, minimatch } = createRequire(require.resolve('nodemon'))(
  'minimatch'
);

describe('minimatch GHSA-g3hv-75wg-m249 regression', () => {
  test('bounds globparts amplification at optimization level 2', () => {
    const braceExpandMax = 16;
    const pattern = Array(8).fill('**/../a/b').join('/');
    const matcher = new Minimatch(pattern, {
      optimizationLevel: 2,
      braceExpandMax
    });

    expect(matcher.globParts.length).toBeLessThanOrEqual(braceExpandMax);
  });

  test('preserves nodemon-style file matching', () => {
    const options = { dot: true };

    expect(minimatch('routes/api/users.js', '**/*.js', options)).toBe(true);
    expect(minimatch('.config/settings.js', '**/*.js', options)).toBe(true);
    expect(minimatch('client/src/App.css', '**/*.js', options)).toBe(false);
  });
});
