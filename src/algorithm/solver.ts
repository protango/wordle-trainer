import rawValidWords from "./data/validWords.json";
import rawAnswerWords from "./data/answerWords.json";
import { groupBy } from "./utilities";
import { LetterStatus } from "./letterStatus";
import { MultiScore } from "./multiScore";
import { GuessResult } from "./guessResult";

export interface ScoredWord {
  word: string;
  score: MultiScore;
  scorePcnt: number;
}

export interface LetterResult {
  letter: string;
  position: number;
  status: LetterStatus;
}

enum CountSpecificity {
  Exactly,
  GreaterThan,
}

interface PositionData {
  answer?: string;
  cantBe: string[];
}

interface SolverUndoData {
  guessResult: GuessResult;
  answerMustContain: Record<string, MustContain>;
  deltaPossibleSolutions: string[];
  positions: PositionData[];
}

interface MustContain {
  letter: string;
  count: number;
  solved: number;
  specificity: CountSpecificity;
}

interface ScoringHist {
  /**
   * The number of words that contain a letter up to a specified count: [letter][letter count] = [number of words].
   * Eg. ['a'][3] === 2 means that there are 2 words that contain 1-3 'a' characters
   */
  wordsWithLetterCount: Record<string, Record<number, number>>;
  /**
   * The number of words that contain a letter in a specific position: [letter][position] = [number of words].
   * Eg. ['a'][3] === 2 means that there are 2 words that contain an 'a' in the 3rd position
   */
  wordsWithLetterInPos: Record<string, Record<number, number>>;
}
export class Solver {
  public static readonly validWords = new Set(rawValidWords);
  public static readonly answerWords = new Set(rawAnswerWords);
  public static readonly allWords = new Set(rawValidWords.concat(rawAnswerWords));

  private undoData: SolverUndoData[] = [];
  public guesses: GuessResult[] = [];
  public solved = false;
  private positions: PositionData[];
  public answerMustContain = new Map<string, MustContain>();

  public possibleSolutions: Set<string> = new Set(Solver.answerWords);
  private possibleGuesses: Set<string> = new Set(Solver.allWords);

  private possibleSolutionScoringHist: ScoringHist;
  public letterStates: Record<string, LetterStatus> = {};

  constructor(length: number) {
    this.positions = [...Array(length)].map(() => ({
      cantBe: [],
    }));
    this.possibleSolutionScoringHist = this.getScoreHistogram();
  }

  public undoLastGuess(): void {
    const undoData = this.undoData.pop();
    if (!undoData) {
      return;
    }
    if (undoData.guessResult !== this.guesses[this.guesses.length - 1]) {
      throw new Error("Malformed undo data");
    }
    this.guesses.pop();
    undoData.deltaPossibleSolutions.forEach((x) => this.possibleSolutions.add(x));
    if (this.possibleGuesses.size !== Solver.allWords.size) {
      this.possibleGuesses = new Set(Solver.allWords);
    }
    this.answerMustContain = new Map(Object.entries(undoData.answerMustContain));
    this.positions = undoData.positions;
    this.updateLetterStates();
    this.possibleSolutionScoringHist = this.getScoreHistogram();
    if (this.guesses.length) {
      this.solved = this.guesses[this.guesses.length - 1].result.every(
        (x) => x.status === LetterStatus.Correct
      );
    } else {
      this.solved = false;
    }
  }

  public reset(): void {
    this.guesses = [];
    this.undoData = [];
    this.solved = false;
    this.positions = [...Array(this.positions.length)].map(() => ({
      cantBe: [],
    }));
    this.answerMustContain = new Map();
    this.possibleSolutions = new Set(Solver.answerWords);
    this.possibleGuesses = new Set(Solver.allWords);
    this.possibleSolutionScoringHist = this.getScoreHistogram();
    this.updateLetterStates();
  }

  protected addGuess(guess: GuessResult): void {
    if (this.solved) {
      throw new Error("Game already solved");
    }
    this.undoData.push(this.newUndoData(guess));
    this.guesses.push(guess);
    this.updateLetterPossibilities(guess);
    this.solved = guess.result.every((x) => x.status === LetterStatus.Correct);

    this.updateLetterStates();
  }

  private newUndoData(guess: GuessResult): SolverUndoData {
    return {
      guessResult: guess,
      answerMustContain: [...this.answerMustContain.entries()].reduce((a, [k, v]) => {
        a[k] = { ...v };
        return a;
      }, {} as Record<string, MustContain>),
      deltaPossibleSolutions: [],
      positions: this.positions.map((x) => ({ ...x, cantBe: [...x.cantBe] })),
    };
  }

  private updateLetterStates(): void {
    const result: Record<string, LetterStatus> = {};
    for (const [letter, mc] of this.answerMustContain) {
      if (result[letter] === undefined) {
        result[letter] = mc.solved
          ? LetterStatus.Correct
          : mc.count > 0
          ? LetterStatus.Present
          : LetterStatus.Absent;
      }
    }
    this.letterStates = result;
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
          letter,
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
        const mustContain = this.answerMustContain.get(letter);
        if (correctLetterCounts[letter] && mustContain) {
          mustContain.specificity = CountSpecificity.Exactly;
        } else {
          this.answerMustContain.set(letter, {
            count: 0,
            specificity: CountSpecificity.Exactly,
            solved: 0,
            letter,
          });
        }
      }
    }

    // Remove impossible solutions
    const solutionRx = this.generateRegex();
    this.possibleSolutions.forEach((x) => {
      if (!solutionRx.test(x)) {
        this.possibleSolutions.delete(x);
        this.undoData[this.undoData.length - 1].deltaPossibleSolutions.push(x);
      }
    });

    // Infer position solutions from remaining solutions
    for (let posIdx = 0; posIdx < this.positions.length; posIdx++) {
      const pos = this.positions[posIdx];
      if (pos.answer) {
        continue;
      }
      let letterInPos: string | undefined;
      for (const word of this.possibleSolutions) {
        if (letterInPos && word[posIdx] !== letterInPos) {
          letterInPos = undefined;
          break;
        }
        letterInPos = word[posIdx];
      }
      if (letterInPos) {
        pos.answer = letterInPos;
      }
    }

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
        result += `(?=${(`[^${letter}]*` + letter).repeat(count)}${
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
    } else if (this.possibleSolutions.size <= 2) {
      return [...this.possibleSolutions].map((x) => ({
        word: x,
        score: new MultiScore(100),
        scorePcnt: 100,
      }));
    }

    const bannedLetters = new Set<string>();
    for (const [letter, countInfo] of this.answerMustContain) {
      if (countInfo.specificity === CountSpecificity.Exactly && countInfo.count === 0) {
        bannedLetters.add(letter);
      }
    }
    const guessScores: ScoredWord[] = [];
    this.possibleGuesses.forEach((x) => {
      const score = this.getWordScore(x);
      if (score.elements[0] === 0) {
        // Word doesn't match any of the possible solutions
        this.possibleGuesses.delete(x);
      } else {
        guessScores.push({ word: x, score, scorePcnt: 0 });
      }
    });

    guessScores.sort((a, b) => MultiScore.compare(b.score, a.score));

    // Assign percentage scores
    function applyScoring(bottom: number, top: number, scoreGroup: ScoredWord[]) {
      const topMinorScore = scoreGroup[0].score.elements[1];
      for (const scoredWord of scoreGroup) {
        const ratio = topMinorScore ? scoredWord.score.elements[1] / topMinorScore : 1;
        scoredWord.scorePcnt = ratio * (top - bottom) + bottom;
      }
    }
    let scoreGroup = [] as ScoredWord[];
    for (const gs of guessScores) {
      if (scoreGroup.length === 0 || scoreGroup[0].score.elements[0] === gs.score.elements[0]) {
        scoreGroup.push(gs);
      } else {
        applyScoring(
          (gs.score.elements[0] / guessScores[0].score.elements[0]) * 100,
          (scoreGroup[0].score.elements[0] / guessScores[0].score.elements[0]) * 100,
          scoreGroup
        );
        scoreGroup = [gs];
      }
    }

    if (scoreGroup.length > 0) {
      applyScoring(
        0,
        (scoreGroup[0].score.elements[0] / guessScores[0].score.elements[0]) * 100,
        scoreGroup
      );
    }

    // Return top guesses
    return top ? guessScores.slice(0, top) : guessScores;
  }

  public bestGuess(): string | undefined {
    const guesses = this.bestGuesses(1);
    return guesses.length ? guesses[0].word : undefined;
  }

  private getScoreHistogram(): ScoringHist {
    const hist = { wordsWithLetterCount: {}, wordsWithLetterInPos: {} } as ScoringHist;
    // Populate wordsWithLetterCount
    for (const word of this.possibleSolutions) {
      const letterCounts = groupBy(
        Array.from(word),
        (x) => x,
        (acc, letter, i) => {
          if (letter === this.positions[i].answer) {
            return acc;
          }
          return acc + 1;
        },
        0
      );

      for (const letter in letterCounts) {
        const count = letterCounts[letter];
        for (let i = 1; i <= count; i++) {
          hist.wordsWithLetterCount[letter] = hist.wordsWithLetterCount[letter] ?? {};
          hist.wordsWithLetterCount[letter][i] = (hist.wordsWithLetterCount[letter][i] ?? 0) + 1;
        }
      }
    }

    // Populate wordsWithLetterInPos
    for (const word of this.possibleSolutions) {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        if (letter !== this.positions[i].answer) {
          hist.wordsWithLetterInPos[letter] = hist.wordsWithLetterInPos[letter] ?? {};
          hist.wordsWithLetterInPos[letter][i] = (hist.wordsWithLetterInPos[letter][i] ?? 0) + 1;
        }
      }
    }

    return hist;
  }

  protected getWordScore(word: string): MultiScore {
    const letterCounts = {} as Record<string, number>;
    const letterPositions = {} as Record<string, number>;
    const trickyAdjustmentLetters = {} as Record<string, number[]>;
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const mustContain = this.answerMustContain.get(letter);
      const positionInfo = this.positions[i];

      if (mustContain) {
        if (mustContain.count === 0 && mustContain.specificity === CountSpecificity.Exactly) {
          continue; // Award no points if this letter is already known to be absent from the answer
        }
        if (mustContain.count === mustContain.solved) {
          if (mustContain.specificity === CountSpecificity.Exactly) {
            continue; // Award no points if we already have all the answers we need for this letter
          } else if (mustContain.specificity === CountSpecificity.GreaterThan) {
            // Tricky scenario here, we have enough answers for this letter, but there could be more.
            // We'll add it to a list of tricky letters and apply a score adjustment after initial calculation.
            if (trickyAdjustmentLetters[letter]) {
              trickyAdjustmentLetters[letter].push(i);
            } else {
              trickyAdjustmentLetters[letter] = [i];
            }
            continue;
          }
        }
      }

      if (positionInfo.answer === letter) {
        continue; // Award no points if this position is already solved
      }

      if (positionInfo.cantBe.includes(letter)) {
        continue; // Award no points if this letter is already known to not be in this position
      }

      letterCounts[letter] = (letterCounts[letter] ?? 0) + 1;
      letterPositions[letter] = i;
    }
    let majorScore = Object.entries(letterCounts).reduce((a, [letter, count]) => {
      let letterCountScore = 0;
      for (let i = count; i >= 1; i--) {
        const maybeScore = this.possibleSolutionScoringHist.wordsWithLetterCount[letter]?.[i];
        if (maybeScore !== undefined) {
          letterCountScore = maybeScore;
          break;
        }
      }

      return a + letterCountScore;
    }, 0);

    // Apply tricky letter adjustment
    for (const [letter, indicies] of Object.entries(trickyAdjustmentLetters)) {
      const mc = this.answerMustContain.get(letter);
      if (!mc) {
        throw new Error("Tricky letter adjustment for letter not in must contain list");
      }
      // Here, we already know that the mustContain is "greater-than"
      if (mc.count === indicies.length) {
        // So this guess is only testing positions
        for (const i of indicies) {
          // Scoring hist does not award points for solved positions, so we don't need to check again here
          const maybeScore = this.possibleSolutionScoringHist.wordsWithLetterInPos[letter]?.[i];
          if (maybeScore !== undefined) {
            majorScore += maybeScore;
          }
        }
      } else if (indicies.length > mc.count) {
        // This guess checks for double/triple/2-n letters etc
        let letterCountScore = 0;
        // Then award points as normal
        for (let i = indicies.length; i >= 1; i--) {
          const maybeScore = this.possibleSolutionScoringHist.wordsWithLetterCount[letter]?.[i];
          if (maybeScore !== undefined) {
            letterCountScore = maybeScore;
            break;
          }
        }

        majorScore += letterCountScore;
      }
    }

    // Minor score is based on hitting correct positions
    const minorScore = Object.entries(letterPositions).reduce((a, [letter, pos]) => {
      const letterPosScore =
        this.possibleSolutionScoringHist.wordsWithLetterInPos[letter]?.[pos] ?? 0;
      return a + letterPosScore;
    }, 0);

    // Tie breaker is designed to favour possible solutions when all other things are equal
    const tieBreaker = this.possibleSolutions.has(word) ? 2 : Solver.answerWords.has(word) ? 1 : 0;

    return new MultiScore(majorScore, minorScore, tieBreaker);
  }
}
