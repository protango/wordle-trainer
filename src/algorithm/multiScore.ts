export class MultiScore {
  public elements: number[] = [];
  constructor(...elements: number[]) {
    this.elements = elements;
  }

  public static sort(arr: MultiScore[], desc = false): void {
    arr.sort(!desc ? MultiScore.compare : (a, b) => MultiScore.compare(b, a));
  }

  public static compare(a: MultiScore, b: MultiScore): number {
    for (let i = 0; i < Math.max(a.elements.length, b.elements.length); i++) {
      const ai = a.elements[i] ?? 0;
      const bi = b.elements[i] ?? 0;
      if (ai !== bi) {
        return ai - bi;
      }
    }

    return 0;
  }
}
