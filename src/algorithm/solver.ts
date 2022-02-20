import rawValidWords from "./data/validWords.json";
import rawAnswerWords from "./data/answerWords.json";
import { letterCounts } from "./utilities";
import { LetterStatus } from "./letterStatus";

export interface ScoredWord {
  word: string;
  score: number;
}

export interface LetterResult {
  letter: string;
  position: number;
  status: LetterStatus;
}

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

enum CountSpecificity {
  Exactly,
  GreaterThan,
}

export class Solver {
  public static readonly validWords = new Set(rawValidWords);
  public static readonly answerWords = new Set(rawAnswerWords);
  public static readonly allWords = new Set(rawValidWords.concat(rawAnswerWords));

  public guesses: GuessResult[] = [];
  public solved = false;
  private positions: { answer?: string; cantBe: string[] }[];
  public answerMustContain = new Map<
    string,
    { count: number; solved: number; specificity: CountSpecificity }
  >();

  private possibleSolutions: Set<string> = new Set(Solver.answerWords);
  private possibleGuesses: Set<string> = new Set(Solver.allWords);

  private possibleSolutionScoringHist: Record<string, number>;

  constructor(length: number) {
    this.positions = [...Array(length)].map(() => ({
      cantBe: [],
    }));
    this.possibleSolutionScoringHist = this.getScoreHistogram();
  }

  protected addGuess(guess: GuessResult): void {
    if (this.solved) {
      throw new Error("Game already solved");
    }
    this.guesses.push(guess);
    this.updateLetterPossibilities(guess);
    this.solved = guess.result.every((x) => x.status === LetterStatus.Correct);
  }

  private updateLetterPossibilities(guess: GuessResult): void {
    const correctLetterCounts = guess.correctLetterCounts();
    for (const letter in correctLetterCounts) {
      const mustContain = this.answerMustContain.get(letter);
      if (!mustContain || mustContain.count < correctLetterCounts[letter]) {
        this.answerMustContain.set(letter, {
          count: correctLetterCounts[letter],
          specificity: CountSpecificity.GreaterThan,
          solved: mustContain ? mustContain.solved : 0,
        });
      }
    }

    for (let i = 0; i < guess.guess.length; i++) {
      const letter = guess.guess[i];
      const status = guess.result[i].status;
      if (status === LetterStatus.Correct && !this.positions[i].answer) {
        this.positions[i].answer = letter;
        const mustContain = this.answerMustContain.get(letter);
        if (mustContain) {
          mustContain.solved += 1;
        }
      } else if (status === LetterStatus.Present) {
        this.positions[i].cantBe.push(letter);
      }

      // Handle incorrect guesses
      if (guess.result[i].status === LetterStatus.Absent) {
        if (correctLetterCounts[letter]) {
          this.answerMustContain.get(letter)!.specificity = CountSpecificity.Exactly;
        } else {
          this.answerMustContain.set(letter, {
            count: 0,
            specificity: CountSpecificity.Exactly,
            solved: 0,
          });
        }
      }
    }

    // Remove impossible solutions
    const solutionRx = this.generateRegex();
    this.possibleSolutions.forEach((x) => {
      if (!solutionRx.test(x)) {
        this.possibleSolutions.delete(x);
      }
    });

    // Update letter scoring histogram
    this.possibleSolutionScoringHist = this.getScoreHistogram();
  }

  private generateRegex(): RegExp {
    let result = "^";
    const bannedLetters = [] as string[];
    for (const mustContainRecord of this.answerMustContain) {
      const letter = mustContainRecord[0];
      const countInfo = mustContainRecord[1];
      if (countInfo.specificity === CountSpecificity.Exactly && countInfo.count === 0) {
        bannedLetters.push(letter);
      } else {
        const { count, specificity } = countInfo;
        result += `(?=${(".*" + letter).repeat(count)}${
          specificity === CountSpecificity.Exactly ? `[^${letter}]*$` : ""
        })`;
      }
    }
    const bannedLettersString = bannedLetters.join("");
    for (const pos of this.positions) {
      if (pos.answer) {
        result += pos.answer;
      } else if (pos.cantBe.length || bannedLettersString) {
        result += `[^${pos.cantBe.join("") + bannedLettersString}]`;
      } else {
        result += ".";
      }
    }
    result += "$";

    return new RegExp(result);
  }

  public bestGuesses(top = 10): ScoredWord[] {
    if (this.possibleSolutions.size === 0) {
      return [];
    } else if (this.possibleSolutions.size === 1) {
      return [{ word: this.possibleSolutions.values().next().value, score: 1 }];
    }

    const bannedLetters = new Set<string>();
    for (const [letter, countInfo] of this.answerMustContain) {
      if (countInfo.specificity === CountSpecificity.Exactly && countInfo.count === 0) {
        bannedLetters.add(letter);
      }
    }
    const guessScores: (ScoredWord & { tieBreaker: number })[] = [];
    this.possibleGuesses.forEach((x) => {
      const score = this.getWordScore(x);
      if (score === 0) {
        this.possibleGuesses.delete(x);
      } else {
        const isAnswerWord = Solver.answerWords.has(x);
        const isPossibleSolution = this.possibleSolutions.has(x);
        const tieBreaker = isPossibleSolution ? 2 : isAnswerWord ? 1 : 0;
        guessScores.push({ word: x, score, tieBreaker });
      }
    });

    guessScores.sort((a, b) => b.score - a.score || b.tieBreaker - a.tieBreaker);

    return top ? guessScores.slice(0, top) : guessScores;
  }

  public bestGuess(): string | undefined {
    const guesses = this.bestGuesses(1);
    return guesses.length ? guesses[0].word : undefined;
  }

  private getScoreHistogram(): Record<string, number> {
    const hist = {} as Record<string, number>;
    this.possibleSolutions.forEach((x) => {
      const seen = new Set<string>();
      Array.from(x).forEach((letter, i) => {
        if (letter === this.positions[i].answer || seen.has(letter)) return;
        hist[letter] = (hist[letter] || 0) + 1;
        seen.add(letter);
      });
    });

    return hist;
  }

  protected getWordScore(word: string): number {
    let score = 0;

    const seenLetters = new Set<string>();

    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const mustContain = this.answerMustContain.get(letter);
      const positionInfo = this.positions[i];

      if (seenLetters.has(letter)) {
        continue; // Don't count the same letter twice
      }
      seenLetters.add(letter);

      if (positionInfo.answer === letter) {
        continue; // Award no points if this position is already solved
      }

      if (
        mustContain &&
        mustContain.count === 0 &&
        mustContain.specificity === CountSpecificity.Exactly
      ) {
        continue; // Award no points if this letter is already known to be absent from the answer
      }

      if (positionInfo.cantBe.includes(letter)) {
        continue; // Award no points if this letter is already known to not be in this position
      }

      if (
        mustContain &&
        mustContain.count === mustContain.solved &&
        mustContain.specificity === CountSpecificity.Exactly
      ) {
        continue; // Award no points if we already have all the answers we need for this letter
      }

      score += this.possibleSolutionScoringHist[letter] || 0;
    }
    return score;
  }
}
