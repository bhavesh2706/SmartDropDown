import {
  lightTheme,
  darkTheme,
  mergeTheme,
  scaleTheme,
  fontFor,
  textDir,
  rowDir,
} from '../theme';

describe('theme rtl', () => {
  it('ltr default', () => {
    expect(lightTheme.rtl).toBe(false);
    expect(rowDir(lightTheme)).toBe('row');
    expect(textDir(lightTheme)).toEqual({
      textAlign: 'left',
      writingDirection: 'ltr',
    });
  });

  it('rtl mirrors row + text', () => {
    const t = mergeTheme(lightTheme, { rtl: true });
    expect(rowDir(t)).toBe('row-reverse');
    expect(textDir(t)).toEqual({ textAlign: 'right', writingDirection: 'rtl' });
    expect(scaleTheme(t, 1.2).rtl).toBe(true);
  });
});

describe('theme fonts', () => {
  it('defaults: no custom family → default weight, no fontFamily', () => {
    expect(lightTheme.fonts).toEqual({});
    expect(fontFor(lightTheme)).toEqual({ fontWeight: '400' });
    expect(fontFor(lightTheme, 'medium')).toEqual({ fontWeight: '600' });
    expect(fontFor(lightTheme, 'bold')).toEqual({ fontWeight: '700' });
  });

  it('custom family → fontFamily only, NO fontWeight (iOS-safe)', () => {
    const t = mergeTheme(lightTheme, {
      fonts: { regular: 'Inter-Regular', bold: 'Inter-Bold' },
    });
    expect(fontFor(t)).toEqual({ fontFamily: 'Inter-Regular' });
    expect(fontFor(t, 'bold')).toEqual({ fontFamily: 'Inter-Bold' });
    // medium not set → falls back to regular family (still family-only)
    expect(fontFor(t, 'medium')).toEqual({ fontFamily: 'Inter-Regular' });
  });

  it('scaleTheme preserves fonts', () => {
    const t = mergeTheme(darkTheme, { fonts: { regular: 'Roboto' } });
    const scaled = scaleTheme(t, 1.2);
    expect(scaled.fonts.regular).toBe('Roboto');
  });
});
