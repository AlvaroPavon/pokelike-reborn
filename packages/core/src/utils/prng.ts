/**
 * Mulberry32 Seeded PRNG
 *
 * A deterministic pseudo-random number generator using the Mulberry32 algorithm.
 * Same seed always produces the exact same sequence of numbers.
 *
 * This is critical for game features like:
 * - Reproducible battle outcomes (for replays and debugging)
 * - Consistent map generation from a seed
 * - Synced multiplayer (same seed = same outcomes)
 *
 * The Mulberry32 algorithm is chosen for its:
 * - Simplicity (~5 lines of code, easy to audit)
 * - Good distribution for game use
 * - 32-bit state (fits in a JS number)
 * - Deterministic behavior across runtimes
 */

/**
 * Seeded PRNG using the Mulberry32 algorithm.
 *
 * Create an instance with a seed, then call methods to generate
 * deterministic random values. Sequences are fully determined
 * by the initial seed.
 *
 * @example
 * ```ts
 * const rng = new SeededRNG(42);
 * rng.random();        // 0.138...
 * rng.randomInt(1, 6); // Dice roll: 4
 * rng.randomElement(["a", "b", "c"]); // "b"
 * ```
 */
export class SeededRNG {
  /** Internal 32-bit state. Must stay in [0, 2^32) range. */
  private state: number;

  /**
   * Create a new PRNG instance with the given seed.
   *
   * @param seed - Integer seed. Non-integers are coerced via Math.floor.
   *               The seed determines the entire random sequence.
   */
  constructor(seed: number) {
    this.state = Math.floor(seed) >>> 0; // Convert to unsigned 32-bit
    if (this.state === 0) {
      this.state = 1; // Mulberry32 requires non-zero state
    }
  }

  /**
   * Reset the generator to a new seed, starting a fresh sequence.
   *
   * @param seed - New integer seed
   */
  seed(seed: number): void {
    this.state = Math.floor(seed) >>> 0;
    if (this.state === 0) {
      this.state = 1;
    }
  }

  /**
   * Generate the next pseudo-random number in [0, 1).
   *
   * Uses the Mulberry32 algorithm:
   *   state += 0x6D2B79F5
   *   let t = state ^ (state >>> 15)
   *   t = (t ^ (t << 7 | t)) & 0xFFFFFFFF  (with XOR)
   *   return (t ^ (t >>> 16)) / 2^32
   *
   * @returns A float in [0, 1)
   */
  random(): number {
    // Advance state with a large prime increment
    this.state = (this.state + 0x6d2b79f5) | 0;

    // Bit mixing — ensures good distribution
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);

    // Final mixing pass
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    // Normalize to [0, 1) by dividing by 2^32
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer in [min, max] (inclusive).
   *
   * @param min - Lower bound (inclusive)
   * @param max - Upper bound (inclusive)
   * @returns A random integer between min and max
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random element from an array.
   *
   * @param array - The array to pick from
   * @returns A random element, or undefined if the array is empty
   */
  randomElement<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Shuffle an array in-place using the Fisher-Yates algorithm.
   *
   * The shuffle is deterministic — same seed + same input = same output.
   *
   * @param array - The array to shuffle (mutated in place)
   * @returns The same array reference (mutated)
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      // Swap
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
    return array;
  }
}
