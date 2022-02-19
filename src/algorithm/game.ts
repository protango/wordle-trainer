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
    const gr = new GuessResult(guess, this.solution);
    this.addGuess(gr);
    return gr.result;
  }
}
