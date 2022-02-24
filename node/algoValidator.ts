import { PerfMonitor } from "./perfMonitor";
import { Game } from "../src/algorithm/game";

const perfMon = new PerfMonitor(Game.answerWords.size);
let avgMovesToSolve = 0;
for (const soln of Game.answerWords) {
  const game = new Game(soln);

  while (!game.solved && game.guesses.length < 6) {
    const bestGuess = game.bestGuess();
    if (!bestGuess) {
      break;
    }
    game.guess(bestGuess);
  }

  if (game.solved) {
    avgMovesToSolve += game.guesses.length;
  } else {
    console.error(`Failed to find a solution while solving for "${soln.toUpperCase()}"`);
  }
  perfMon.doneOne();
}

avgMovesToSolve /= Game.answerWords.size;

console.log(`Average moves to solve: ${avgMovesToSolve}`);
