import rawValidWords from '../data/validWords.json';
import rawAnswerWords from '../data/answerWords.json';
import { counts, letterCounts } from './utilities';

const validWords = new Set(rawValidWords);
const answerWords = new Set(rawAnswerWords);
const allWords = new Set([...validWords, ...answerWords]);
const allLetters = [...'abcdefghijklmnopqrstuvwxyz'];

const letterProbabilities = rawAnswerWords.reduce((acc, word) => {
    word.split('').forEach(letter => {
        acc[letter] += 1 / rawAnswerWords.length;
    });
    return acc;
}, allLetters.reduce((a, x) => ({...a, [x]: 0}), {} as Record<string, number>));

enum LetterStatus {
    Correct,
    WrongPosition,
    NotPresent
}

interface LetterResult {letter: string, position: number, status: LetterStatus}

class GuessResult {
    public guess: string;

    public result: LetterResult[];
    public correctCount: number;
    public wrongPositionCount: number;
    public correctLetterCounts(): Record<string, number> {
        return this.result.reduce((acc, {letter, status}) => {
            if (status === LetterStatus.Correct || status === LetterStatus.WrongPosition) {
                acc[letter] = (acc[letter] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }

    public pretty(): string {
        return this.result.map(({letter, position, status}) => {
            switch (status) {
                case LetterStatus.Correct:
                    return `🟩`;
                case LetterStatus.WrongPosition:
                    return `🟧`;
                case LetterStatus.NotPresent:
                    return `⬛`;
            }
        }).join('') + ' ' + this.guess.toUpperCase();
    }

    constructor(guess: string, result: LetterStatus[])
    constructor(guess: string, arg2: string | LetterStatus[]) {
        if (!allWords.has(guess)) {
            throw new Error('Guess must be a valid word');
        }
        this.guess = guess;
        if (guess.length !== arg2.length) {
            throw new Error('Length of guess and result must be the same');
        }

        if (typeof arg2 === 'string') {
            this.result = GuessResult.resultsFromSolution(guess, arg2);
        } else if (typeof arg2 === 'object') {
            this.result = arg2.map((x, i) => ({letter: guess[i], position: i, status: x}));
        } else {
            throw new TypeError('Argument 2 must be a string or an array of LetterStatus');
        }

        this.correctCount = this.result.filter(x => x.status === LetterStatus.Correct).length;
        this.wrongPositionCount = this.result.filter(x => x.status === LetterStatus.WrongPosition).length;
    }

    public static resultsFromSolution(guess: string, solution: string): LetterResult[] {
        if (guess.length !== solution.length) {
            throw new Error('Guess and solution must be the same length');
        }
        const solutionLetterCounts = letterCounts(solution);
        
        const result = [...guess].map((x, i) => ({
            letter: x,
            position: i,
            status: undefined as LetterStatus | undefined
        }));
        for (let i = 0; i < guess.length; i++) {
            const guessLetter = guess[i], solutionLetter = solution[i];
            if (guessLetter === solutionLetter) {
                result[i].status = LetterStatus.Correct;
                solutionLetterCounts[solutionLetter] -= 1;
            }
        }
        for (let i = 0; i < guess.length; i++) {
            if (result[i].status !== undefined)
                continue;
            const guessLetter = guess[i]
            const count = solutionLetterCounts[guessLetter];
            if (count) {
                result[i].status = LetterStatus.WrongPosition;
                solutionLetterCounts[guessLetter] -= 1;
            } else {
                result[i].status = LetterStatus.NotPresent;
            }
        }

        return result as LetterResult[];
    }
}

enum CountSpecificity {
    Exactly,
    GreaterThan
}

class Game {
    public guesses: GuessResult[] = [];
    public solved = false;
    private positions: {answer?: string, cantBe: string[]}[];
    public answerMustContain = new Map<string, { count: number, specificity: CountSpecificity }>();

    private possibleSolutions: Set<string> = new Set(answerWords);
    private possibleGuesses: Set<string> = new Set(allWords);

    constructor(length: number) {
        this.positions = [...Array(length)].map(x => ({
            cantBe: []
        }));
    }

    public guess(guess: GuessResult): void {
        if (this.solved) {
            throw new Error('Game already solved');
        }
        this.guesses.push(guess);
        this.updateLetterPossibilities(guess);
        this.solved = guess.result.every(x => x.status === LetterStatus.Correct);
    }

    private updateLetterPossibilities(guess: GuessResult): void {
        const correctLetterCounts = guess.correctLetterCounts();
        for (const letter in correctLetterCounts) {
            const mustContain = this.answerMustContain.get(letter);
            if (!mustContain || mustContain.count < correctLetterCounts[letter]) {
                this.answerMustContain.set(letter, {
                    count: correctLetterCounts[letter], 
                    specificity: CountSpecificity.GreaterThan
                });
            }
        }

        for (let i = 0; i < guess.guess.length; i++) {
            const letter = guess.guess[i];
            const status = guess.result[i].status;
            if (status === LetterStatus.Correct) {
                this.positions[i].answer = letter;
            } else if (status === LetterStatus.WrongPosition) {
                this.positions[i].cantBe.push(letter);
            }

            // Handle incorrect guesses
            if (guess.result[i].status === LetterStatus.NotPresent) {
                if (correctLetterCounts[letter]) {
                    this.answerMustContain.get(letter)!.specificity = CountSpecificity.Exactly;
                } else {
                    this.answerMustContain.set(letter, {
                        count: 0, 
                        specificity: CountSpecificity.Exactly
                    });
                }
            }
        }
    }

    private overlapping(a: string, b: string): number {
        const aLetterCounts = letterCounts(a);
        const bLetterCounts = letterCounts(b);


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
                let {count, specificity} = countInfo;
                if (count > 0) {
                    result += `(?=${('.*' + letter).repeat(count)}${specificity === CountSpecificity.Exactly ? `[^${letter}]*$` : ''})`;
                } else {
                    bannedLetters.push(letter);
                }
            }
        }
        const bannedLettersString = bannedLetters.join('');
        for (const pos of this.positions) {
            if (pos.answer) {
                result += pos.answer;
            } else if (pos.cantBe.length || bannedLettersString) {
                result += `[^${pos.cantBe.join('') + bannedLettersString}]`;
            } else {
                result += '.';
            }
        }
        result += '$';

        return new RegExp(result);
    }

    private bestGuess(useOnlyAnswerWords = false): string | undefined {
        const regex = this.generateRegex();
        let guessCount = 0;
        let bestGuess: {word: string, score: number} | undefined;
        for (const guess of !useOnlyAnswerWords ? allWords : answerWords) {
            if (regex.test(guess)) {
                guessCount++;
                const score = this.getWordScore(guess);
                if (!bestGuess || score > bestGuess.score) {
                    bestGuess = {word: guess, score};
                }
            }
        }

        return bestGuess?.word;
    }

    private getWordScore(word: string): number {
        if (!allWords.has(word)) {
            return 0;
        }
        let score = 0;
        const letters = [...word];
        letters.forEach(letter => {
            score += letterProbabilities[letter];
        });
        return score;
    }
}

const game = new Game('shake');
let gr = game.guess('adieu');
console.log(gr.pretty());
const useOnlyAnswerWords = true;
while (!game.solved) {
    let guess: string | undefined;
    guess = game.bestGuess(useOnlyAnswerWords)

    if (!guess) {
        console.log('❌❌❌❌❌ Failed to find solution');
        break;
    }
    gr = game.guess(guess);
    console.log(gr.pretty());
}