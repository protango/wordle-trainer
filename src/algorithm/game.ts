import { GuessResult, LetterResult, Solver } from "./solver";
import { randomItemFromSet } from "./utilities";
export class Game extends Solver {
  public solution: string;
  constructor(solution?: string) {
    if (!solution) {
      solution = randomItemFromSet(Solver.answerWords);
    }
    super(solution.length);

    this.solution = solution;
  }

  public guess(guess: string): LetterResult[] {
    if (!this.isValid(guess)) {
      throw new Error("Not a valid word");
    }
    const gr = new GuessResult(guess.toLowerCase(), this.solution);
    this.addGuess(gr);
    return gr.result;
  }

  public isValid(guess: string): boolean {
    return Solver.allWords.has(guess.toLowerCase());
  }
}
