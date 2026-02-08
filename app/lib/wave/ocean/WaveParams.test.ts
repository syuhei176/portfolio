import { describe, it, expect } from "vitest";
import {
  DEFAULT_WAVES,
  getWaveDirections,
  getWaveSteepnesses,
  getWaveLengths,
} from "./WaveParams.js";

describe("WaveParams", () => {
  it("should have 6 default waves", () => {
    expect(DEFAULT_WAVES).toHaveLength(6);
  });

  it("should return flat array of 12 direction values (2 per wave)", () => {
    const directions = getWaveDirections(DEFAULT_WAVES);
    expect(directions).toHaveLength(12);
  });

  it("should return 6 steepness values", () => {
    const steepnesses = getWaveSteepnesses(DEFAULT_WAVES);
    expect(steepnesses).toHaveLength(6);
    expect(steepnesses[0]).toBe(0.25);
  });

  it("should return 6 wavelength values", () => {
    const lengths = getWaveLengths(DEFAULT_WAVES);
    expect(lengths).toHaveLength(6);
    expect(lengths[0]).toBe(60);
  });

  it("should compute correct direction for 0 degrees", () => {
    const directions = getWaveDirections([
      { direction: 0, steepness: 0.25, wavelength: 60 },
    ]);
    expect(directions[0]).toBeCloseTo(0, 5);
    expect(directions[1]).toBeCloseTo(1, 5);
  });

  it("should compute correct direction for 90 degrees", () => {
    const directions = getWaveDirections([
      { direction: 90, steepness: 0.25, wavelength: 60 },
    ]);
    expect(directions[0]).toBeCloseTo(1, 5);
    expect(directions[1]).toBeCloseTo(0, 3);
  });

  it("should have steepness values in valid range (0-0.5)", () => {
    for (const wave of DEFAULT_WAVES) {
      expect(wave.steepness).toBeGreaterThanOrEqual(0);
      expect(wave.steepness).toBeLessThanOrEqual(0.5);
    }
  });

  it("should have positive wavelength values", () => {
    for (const wave of DEFAULT_WAVES) {
      expect(wave.wavelength).toBeGreaterThan(0);
    }
  });
});
