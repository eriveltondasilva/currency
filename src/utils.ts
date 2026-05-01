export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && !isNil(value) && !isArray(value);
}

export function isEmpty(value: unknown): boolean {
  if (isNil(value)) {
    return true;
  }

  if (isString(value)) {
    return value.trim().length === 0;
  }

  if (isArray(value)) {
    return value.length === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}
