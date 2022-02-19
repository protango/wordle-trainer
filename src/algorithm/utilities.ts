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

export function randomItemFromSet<T>(set: Set<T>): T {
  if (set.size === 0) {
    throw new Error("Cannot get random item from empty set");
  }
  const index = Math.floor(Math.random() * set.size);
  const iterator = set.values();
  for (let i = 0; i < index; i++) {
    iterator.next();
  }

  return iterator.next().value;
}

export function sleep(time: number): Promise<void> {
  return new Promise((r) => setTimeout(r, time));
}
