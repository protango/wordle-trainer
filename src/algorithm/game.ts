import { LetterStatus } from "./letterStatus";
import { GuessResult, LetterResult, ScoredWord, Solver } from "./solver";
import { randomItemFromSet } from "./utilities";

export interface Feedback {
  bestGuesses: ScoredWord[];
  guess: string;
  guessScorePercent: number;
  lucky: boolean;
  solutionSetShrinkPcnt: number;
  missedWin: boolean;
}
export class Game extends Solver {
  public solution: string;
  constructor(solution?: string) {
    if (!solution) {
      solution = randomItemFromSet(Solver.answerWords);
    }
    super(solution.length);

    this.solution = solution;
    console.log(solution);
  }

  public guess(guess: string, result?: LetterStatus[]): LetterResult[] {
    guess = guess.toLowerCase();
    if (!this.isValid(guess) && !result) {
      throw new Error("Not a valid word");
    }
    if (result && result.length !== guess.length) {
      throw new Error("Invalid result length");
    }
    const gr: GuessResult = result
      ? new GuessResult(guess.toLowerCase(), result)
      : new GuessResult(guess.toLowerCase(), this.solution);
    this.addGuess(gr);
    if (result && !this.possibleSolutions.has(this.solution) && this.possibleSolutions.size) {
      // Pick another solution if the current one is no longer possible
      this.solution = randomItemFromSet(this.possibleSolutions);
      console.log(this.solution);
    }
    return gr.result;
  }

  public feedback(guess: string): Feedback {
    guess = guess.toLowerCase();
    const bestGuesses = this.bestGuesses(10);
    let guessScorePercent = 0;
    if (this.possibleSolutions.size === 1) {
      guessScorePercent = this.possibleSolutions.has(guess) ? 100 : 0;
    } else if (this.possibleSolutions.size === 2) {
      guessScorePercent = this.possibleSolutions.has(guess)
        ? 100
        : this.getWordScore(guess) > 0
        ? 50
        : 0;
    } else if (bestGuesses.length) {
      guessScorePercent = +((this.getWordScore(guess) / bestGuesses[0].score) * 100).toFixed(1);
    }

    return {
      bestGuesses,
      guess,
      guessScorePercent,
      lucky: false,
      solutionSetShrinkPcnt: 0,
      missedWin: this.possibleSolutions.size === 1 && guessScorePercent === 0,
    };
  }

  public isValid(guess: string): boolean {
    guess = guess.toLowerCase();
    return Solver.allWords.has(guess);
  }

  public reset(): void {
    super.reset();
    this.solution = randomItemFromSet(this.possibleSolutions);
    console.log(this.solution);
  }
}
