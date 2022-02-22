export function letterCounts(str: string): Record<string, number> {
  return counts(Array.from(str), (x) => x);
}

export function counts<T, TKey extends number | string>(
  data: T[],
  keySelector: (item: T) => TKey
): Record<TKey, number> {
  return groupBy(data, keySelector, (acc) => acc + 1, 0);
}

export function groupBy<T, TKey extends number | string>(
  data: T[],
  keySelector: (item: T) => TKey
): Record<TKey, T[]>;
export function groupBy<T, TKey extends number | string, TResult>(
  data: T[],
  keySelector: (item: T) => TKey,
  reducer: (acc: TResult, item: T, index: number) => TResult,
  initialValue: TResult
): Record<TKey, TResult>;
export function groupBy<T, TKey extends number | string>(
  data: T[],
  keySelector: (item: T) => TKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducer?: (acc: any, item: T, index: number) => unknown,
  initialValue?: unknown
): Record<TKey, unknown> {
  if (!reducer || initialValue === undefined) {
    reducer = (acc: unknown[], x) => {
      acc.push(x);
      return acc;
    };
    initialValue = [];
  }
  return data.reduce((acc, item, index) => {
    const key = keySelector(item);
    const currentVal = acc[key];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    acc[key] = reducer!(currentVal !== undefined ? currentVal : initialValue, item, index);
    return acc;
  }, {} as Record<TKey, unknown>);
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

export function htmlToElement(html: string): Element {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  const element = template.content.firstElementChild;
  if (!element) {
    throw new Error("Invalid HTML");
  }
  return element;
}
