import rawValidWords from '../data/validWords.json';
import rawAnswerWords from '../data/answerWords.json';

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
    public solution: string;

    public result: LetterResult[];
    public correctCount = 0;
    public wrongPositionCount = 0;
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

    constructor(guess: string, solution: string) {
        this.guess = guess;
        this.solution = solution;
        if (guess.length !== solution.length) {
            throw new Error('Guess and solution must be the same length');
        }
        const solutionLetters = [...solution] as (string | undefined)[];
        const result = [...guess].map((x, i) => ({
            letter: x,
            position: i,
            status: undefined as LetterStatus | undefined
        }));
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === solution[i]) {
                this.correctCount++;
                result[i].status = LetterStatus.Correct;
                solutionLetters[i] = undefined;
            }
        }
        for (let i = 0; i < guess.length; i++) {
            if (result[i].status !== undefined) {
                continue;
            }
            const index = solutionLetters.indexOf(guess[i]);
            if (index !== -1) {
                result[i].status = LetterStatus.WrongPosition;
                solutionLetters[index] = undefined;
                this.wrongPositionCount++;
            } else {
                result[i].status = LetterStatus.NotPresent;
            }
        }

        this.result = result as LetterResult[];

    }
}

enum CountSpecificity {
    Exactly,
    GreaterThan
}

class Game {
    public solution: string;
    public guesses: GuessResult[] = [];
    public solved = false;
    private positions: {answer?: string, cantBe: string[]}[];
    public answerMustContain = new Map<string, { count: number, specificity: CountSpecificity }>();
    constructor(solution: string) {
        this.solution = solution;
        this.positions = [...Array(solution.length)].map(x => ({
            cantBe: []
        }));
    }

    public guess(guess: string): GuessResult {
        if (!allWords.has(guess)) {
            throw new Error('Guess must be a valid word');
        }
        if (this.solved) {
            throw new Error('Game already solved');
        }
        const gr = new GuessResult(guess, this.solution);
        this.guesses.push(gr);
        this.updateLetterPossibilities(gr);
        this.solved = guess === this.solution;
        return gr;
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

    private generateRegex(discoveryMode = false): RegExp {
        let result = "^";
        const bannedLetters = [] as string[];
        const lookingForLetters: string[] = [];
        for (const mustContainRecord of this.answerMustContain) {
            const letter = mustContainRecord[0];
            const countInfo = mustContainRecord[1];
            if (countInfo.specificity === CountSpecificity.Exactly && countInfo.count === 0) {
                bannedLetters.push(letter);
            } else {
                let {count, specificity} = countInfo;
                if (discoveryMode) {
                    const solvedCount = this.positions.filter(x => x.answer === letter).length;
                    count -= solvedCount;
                }
                if (count > 0) {
                    result += `(?=${('.*' + letter).repeat(count)}${specificity === CountSpecificity.Exactly ? `[^${letter}]*$` : ''})`;
                    lookingForLetters.push(letter);
                } else {
                    bannedLetters.push(letter);
                }
            }
        }
        const bannedLettersString = bannedLetters.join('');
        for (const pos of this.positions) {
            if (pos.answer && !discoveryMode) {
                result += pos.answer;
            } else if (pos.cantBe.length || bannedLettersString || (pos.answer && discoveryMode)) {
                result += `[^${pos.cantBe.join('') + bannedLettersString}` + 
                    `${discoveryMode && pos.answer ? pos.answer + lookingForLetters.join('') : ''}]`;
            } else {
                result += '.';
            }
        }
        result += '$';

        return new RegExp(result);
    }

    private internalBestGuess(discoveryMode = false, useOnlyAnswerWords = false): string | undefined {
        const regex = this.generateRegex(discoveryMode);
        let guessCount = 0;
        let bestGuess: {word: string, score: number} | undefined;
        for (const guess of discoveryMode && !useOnlyAnswerWords ? allWords : answerWords) {
            if (regex.test(guess)) {
                guessCount++;
                const score = this.getWordScore(guess, discoveryMode);
                if (!bestGuess || score > bestGuess.score) {
                    bestGuess = {word: guess, score};
                }
            }
        }

        if (!discoveryMode) {
            if (guessCount <= 5) {
                return bestGuess?.word;
            } else {
                return this.internalBestGuess(true, useOnlyAnswerWords) ?? bestGuess?.word;
            }
        }

        return bestGuess?.word;
    }

    public bestGuess(useOnlyAnswerWords = false) {
        return this.internalBestGuess(false, useOnlyAnswerWords);
    }

    private getWordScore(word: string, discoveryMode = false): number {
        if (!allWords.has(word)) {
            return 0;
        }
        let score = 0;
        const letters = discoveryMode ? new Set(word) : [...word]; // Don't award points for double letters
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