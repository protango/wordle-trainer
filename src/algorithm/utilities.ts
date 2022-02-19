export function letterCounts(str: string): Record<string, number> {
  return counts(Array.from(str), (x) => x);
}

export function counts<T, TKey extends number | string>(
  data: T[],
  keySelector: (item: T) => TKey
): Record<TKey, number> {
  return groupBy(data, keySelector, (acc, item) => acc + 1, 0);
}

export function groupBy<T, TKey extends number | string, TResult>(
  data: T[],
  keySelector: (item: T) => TKey,
  reducer: (acc: TResult, item: T) => TResult,
  initialValue: TResult
): Record<TKey, TResult> {
  return data.reduce((acc, item) => {
    const key = keySelector(item);
    const currentVal = acc[key];
    acc[key] = reducer(currentVal !== undefined ? currentVal : initialValue, item);
    return acc;
  }, {} as Record<TKey, TResult>);
}
