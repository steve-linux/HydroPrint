import { describe, expect, it } from 'vitest';
import { scaledSize } from './image';

describe('riduzione della scansione di sfondo', () => {
  it('una foto grande viene ridotta a 1600 px sul lato lungo, senza deformarla', () => {
    expect(scaledSize(4000, 1582)).toEqual({ width: 1600, height: 633 });
    expect(scaledSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it('un\'immagine già piccola non viene ingrandita', () => {
    expect(scaledSize(1200, 474)).toEqual({ width: 1200, height: 474 });
  });
});
