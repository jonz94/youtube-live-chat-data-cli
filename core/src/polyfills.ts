// credits: https://github.com/rauschma/set-methods-polyfill/blob/894c17391303aec7190801636c64465f653479d8/src/library.ts

interface SetReadOperations<T> {
  size: number
  has(key: T): boolean
  keys(): IterableIterator<T>
}

function isObject(value: unknown) {
  if (value === null) return false
  const t = typeof value
  return t === 'object' || t === 'function'
}

/**
 * A simpler version of GetSetRecord that only performs checks.
 */
function CheckSetRecord<T>(obj: SetReadOperations<T>): void {
  if (!isObject(obj)) {
    throw new TypeError()
  }
  const rawSize = obj.size
  const numSize = Number(rawSize)
  // NaN if rawSize is `undefined`
  if (Number.isNaN(numSize)) {
    throw new TypeError()
  }
  // const intSize = ToIntegerOrInfinity(numSize);
  const has = obj.has
  if (typeof has !== 'function') {
    throw new TypeError()
  }
  const keys = obj.keys
  if (typeof keys !== 'function') {
    throw new TypeError()
  }
  // return {Set: obj, Size: intSize, Has: has, Keys: keys};
}

function _difference<T>(this: Set<T>, other: SetReadOperations<T>): Set<T> {
  CheckSetRecord(other)
  const result = new Set<T>(this)
  if (this.size <= other.size) {
    for (const elem of this) {
      if (other.has(elem)) {
        result.delete(elem)
      }
    }
  } else {
    for (const elem of other.keys()) {
      if (result.has(elem)) {
        result.delete(elem)
      }
    }
  }
  return result
}

function uncurryThisForSetResult<T>(
  func: (this: Set<T>, other: SetReadOperations<T>) => Set<T>,
): <X>(arg: Set<X>, other: SetReadOperations<X>) => Set<X> {
  return Function.prototype.call.bind(func as any) as any
}

export const difference = uncurryThisForSetResult(_difference)
