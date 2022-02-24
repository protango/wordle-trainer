import { GuessResult } from "../src/algorithm/guessResult";
import { Solver } from "../src/algorithm/solver";
import fs from "fs";

const results: { word: string; averageMatchedWordCount: number }[] = [];

// const answerWordsConcat = Array.from(Solver.answerWords).join("\n");
const startTime = Date.now();
let i = 0;
const reportEvery = 10;
for (const guess of Solver.allWords) {
  let averageMatchedWordCount = 0;
  for (const solution of Solver.answerWords) {
    const gr = new GuessResult(guess, solution);
    const rx = gr.generateRegex();
    for (const word of Solver.answerWords) {
      if (rx.test(word)) {
        averageMatchedWordCount += 1;
      }
    }
    // averageMatchedWordCount += Array.from(answerWordsConcat.matchAll(rx)).length;
  }

  averageMatchedWordCount /= Solver.answerWords.size;
  results.push({ word: guess, averageMatchedWordCount });
  i++;

  if (i % reportEvery === 0) {
    const now = Date.now();
    const elapsed = now - startTime;
    const processingRatePerSec = i / (elapsed / 1000);
    console.log(
      `${processingRatePerSec.toFixed(2)} words/sec. Estimated time left: ${(
        (Solver.allWords.size - i) /
        processingRatePerSec
      ).toFixed(2)}s`
    );
  }
}

fs.writeFileSync("./results.json", JSON.stringify(results));
console.log('Saved to "results.json"');
