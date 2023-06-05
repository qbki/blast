/**
 * @throws TypeError
 */
export function assertNonNullable<T>(value: T | null | undefined): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new TypeError('Expected non-nullable value');
  }
}
