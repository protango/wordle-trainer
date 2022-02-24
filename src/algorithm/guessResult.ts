import { letterCounts } from "./utilities";
import { LetterStatus } from "./letterStatus";
import { LetterResult } from "./solver";

export class GuessResult {
  public guess: string;

  public result: LetterResult[];
  public correctCount: number;
  public wrongPositionCount: number;
  public correctLetterCounts(): Record<string, number> {
    return this.result.reduce((acc, { letter, status }) => {
      if (status === LetterStatus.Correct || status === LetterStatus.Present) {
        acc[letter] = (acc[letter] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  public pretty(): string {
    return (
      this.result
        .map(({ status }) => {
          switch (status) {
            case LetterStatus.Correct:
              return `🟩`;
            case LetterStatus.Present:
              return `🟧`;
            case LetterStatus.Absent:
              return `⬛`;
          }
        })
        .join("") +
      " " +
      this.guess.toUpperCase()
    );
  }

  constructor(guess: string, result: LetterStatus[]);
  constructor(guess: string, solution: string);
  constructor(guess: string, arg2: string | LetterStatus[]) {
    this.guess = guess;
    if (guess.length !== arg2.length) {
      throw new Error("Length of guess and result must be the same");
    }

    if (typeof arg2 === "string") {
      this.result = GuessResult.resultsFromSolution(guess, arg2);
    } else if (typeof arg2 === "object") {
      this.result = arg2.map((x, i) => ({ letter: guess[i], position: i, status: x }));
    } else {
      throw new TypeError("Argument 2 must be a string or an array of LetterStatus");
    }
    this.correctCount = 0;
    this.wrongPositionCount = 0;
    for (const { status } of this.result) {
      if (status === LetterStatus.Correct) {
        this.correctCount += 1;
      } else if (status === LetterStatus.Present) {
        this.wrongPositionCount += 1;
      }
    }
  }

  private static resultsFromSolution(guess: string, solution: string): LetterResult[] {
    if (guess.length !== solution.length) {
      throw new Error("Guess and solution must be the same length");
    }
    const solutionLetterCounts = letterCounts(solution);

    const result = [...guess].map((x, i) => ({
      letter: x,
      position: i,
      status: undefined as LetterStatus | undefined,
    }));
    for (let i = 0; i < guess.length; i++) {
      const guessLetter = guess[i],
        solutionLetter = solution[i];
      if (guessLetter === solutionLetter) {
        result[i].status = LetterStatus.Correct;
        solutionLetterCounts[solutionLetter] -= 1;
      }
    }
    for (let i = 0; i < guess.length; i++) {
      if (result[i].status === undefined) {
        const count = solutionLetterCounts[guess[i]];
        if (count) {
          result[i].status = LetterStatus.Present;
          solutionLetterCounts[guess[i]] -= 1;
        } else {
          result[i].status = LetterStatus.Absent;
        }
      }
    }

    return result as LetterResult[];
  }
}
