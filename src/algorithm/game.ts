import { GuessResult, LetterResult, ScoredWord, Solver } from "./solver";
import { randomItemFromSet } from "./utilities";

export interface Feedback {
  bestGuesses: ScoredWord[];
  guess: string;
  guessScorePercent: number;
  lucky: boolean;
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

  public guess(guess: string): LetterResult[] {
    guess = guess.toLowerCase();
    if (!this.isValid(guess)) {
      throw new Error("Not a valid word");
    }
    const gr = new GuessResult(guess.toLowerCase(), this.solution);
    this.addGuess(gr);
    return gr.result;
  }

  public feedback(guess: string): Feedback {
    guess = guess.toLowerCase();
    const bestGuesses = this.bestGuesses(10);
    let guessScorePercent = 0;
    if (bestGuesses.length === 1 && guess === bestGuesses[0].word) {
      guessScorePercent = 100;
    } else if (bestGuesses.length) {
      guessScorePercent = +((this.getWordScore(guess) / bestGuesses[0].score) * 100).toFixed(1);
    }

    return {
      bestGuesses,
      guess,
      guessScorePercent,
      lucky: false,
    };
  }

  public isValid(guess: string): boolean {
    guess = guess.toLowerCase();
    return Solver.allWords.has(guess);
  }
}
