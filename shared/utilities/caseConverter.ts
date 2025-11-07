/**
 * Converts snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 */
export function objectKeysToCamel<T = Record<string, unknown>>(
  obj: Record<string, unknown>
): T {
  if (obj === null || typeof obj !== "object" || obj instanceof Date) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objectKeysToCamel(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = objectKeysToCamel(value as Record<string, unknown>);
  }
  return result as T;
}

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 */
export function objectKeysToSnake<T = Record<string, unknown>>(
  obj: Record<string, unknown>
): T {
  if (obj === null || typeof obj !== "object" || obj instanceof Date) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objectKeysToSnake(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = objectKeysToSnake(value as Record<string, unknown>);
  }
  return result as T;
}
