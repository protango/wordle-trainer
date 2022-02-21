<template>
  <div style="display: flex; flex-direction: column; height: 100%">
    <FeedbackBar :feedback="feedback"></FeedbackBar>
    <div class="playArea">
      <div style="flex: 1; display: flex; align-items: center; min-height: 0">
        <div class="gameBoard" :style="{ 'aspect-ratio': numOfLetters + '/' + numOfGuesses }">
          <div
            class="row"
            v-for="(row, guessIdx) in letterStates"
            :key="guessIdx"
            :class="[shakeRow && cursorPosition[0] === guessIdx ? 'shake' : '']"
          >
            <div
              class="letterBox"
              v-for="(letter, letterIdx) in row"
              :class="[
                letter.letter ? 'filled pop' : '',
                letter.status !== undefined ? LetterStatus[letter.status].toLowerCase() : 'unset',
                letter.flip ? 'flip' : '',
                letter.status !== undefined && letter.isStatusInput ? 'input' : '',
              ]"
              :key="letterIdx"
            >
              <span>{{ letter.letter ?? "" }}</span>
            </div>
          </div>
        </div>
      </div>

      <Keyboard
        @key-press="handleKeyPress"
        v-model:inputLetterStatus="kbInputStatus"
        :key-status="kbStatus"
        :guess-in-progress="!!cursorPosition[1]"
        :solved="isSolved"
      ></Keyboard>
    </div>
    <AlertManager></AlertManager>
    <HintModal
      v-model:show="showHints"
      :possibleSolutions="possibleSolutions"
      :top-words="topWords"
      @accept-word="acceptWord"
    ></HintModal>
  </div>
</template>

<script lang="ts" setup>
import { Feedback, Game } from "@/algorithm/game";
import { LetterResult, ScoredWord } from "@/algorithm/solver";
import { LetterStatus } from "@/algorithm/letterStatus";
import { onMounted, onUnmounted, Ref, ref } from "vue";
import Keyboard from "./Keyboard.vue";
import FeedbackBar from "./FeedbackBar.vue";
import { sleep } from "@/algorithm/utilities";
import AlertManager from "./AlertManager.vue";
import { AlertManager as Alert } from "./AlertManager";
import HintModal from "./HintModal.vue";

interface LetterState {
  letter?: string;
  status?: LetterStatus;
  flip: boolean;
  isStatusInput: boolean;
}

const numOfLetters = 5;
const numOfGuesses = 6;

const cursorPosition = [0, 0];
const feedback = ref<Feedback | undefined>(undefined);
const letterStates: Ref<LetterState[][]> = ref(
  Array.from(Array(numOfGuesses)).map(() => {
    return Array.from(Array(numOfLetters)).map(() => ({
      flip: false,
      isStatusInput: false,
    }));
  })
);

const kbStatus = ref<Record<string, LetterStatus>>({});
const kbInputStatus = ref<LetterStatus | undefined>(undefined);
const showHints = ref(false);
const possibleSolutions = ref<string[]>([]);
const topWords = ref<ScoredWord[]>([]);

let shakeRow = ref(false);

let game = new Game();
let isRevealing = false;
const isSolved = ref(false);

onMounted(() => {
  document.addEventListener("keydown", handleNativeKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleNativeKeyDown);
});

function handleNativeKeyDown(e: KeyboardEvent) {
  handleKeyPress(e.key.toLowerCase());
}

function handleKeyPress(key: string, status = kbInputStatus.value) {
  if (isRevealing) {
    return;
  } else if (key === "restart") {
    reset();
  } else if (key === "undo") {
    undo();
  } else if (key === "hint") {
    topWords.value = game.bestGuesses(5);
    possibleSolutions.value = Array.from(game.possibleSolutions);
    showHints.value = true;
  } else if (game.solved) {
    return;
  } else if (key === "enter") {
    submitGuess();
  } else if (key === "backspace") {
    if (cursorPosition[1] > 0) {
      const letterState = letterStates.value[cursorPosition[0]][cursorPosition[1] - 1];
      letterState.letter = undefined;
      letterState.status = undefined;
      letterState.isStatusInput = false;
      cursorPosition[1]--;
    }
  } else if (/^[a-z]$/.test(key)) {
    if (cursorPosition[1] < numOfLetters) {
      const letterState = letterStates.value[cursorPosition[0]][cursorPosition[1]];
      letterState.letter = key;
      letterState.status = status;
      letterState.isStatusInput = status !== undefined;
      cursorPosition[1]++;
    }
  }
}

async function submitGuess() {
  if (
    cursorPosition[0] >= numOfGuesses ||
    cursorPosition[1] < numOfLetters ||
    shakeRow.value ||
    isRevealing
  ) {
    return;
  }
  const word = letterStates.value[cursorPosition[0]].map((x) => x.letter).join("");
  const inputResult = letterStates.value[cursorPosition[0]].map((x) => x.status);
  if (!game.isValid(word)) {
    Alert.show("Not in word list");
    doShakeRow();
    return;
  }
  const newFeedback = game.feedback(word);
  const ogPossibleSolutionCount = game.possibleSolutions.size;
  const result = game.guess(
    word,
    inputResult.every((x): x is LetterStatus => x !== undefined) ? inputResult : undefined
  );
  if (game.possibleSolutions.size === 0) {
    Alert.show(game.solved ? "Not a possible solution" : "No possible solutions");
    game.undoLastGuess();
    doShakeRow();
    return;
  }
  newFeedback.solutionSetShrinkPcnt =
    (1 - game.possibleSolutions.size / ogPossibleSolutionCount) * 100;
  if (
    (newFeedback.guessScorePercent <= 50 &&
      (game.solved || newFeedback.solutionSetShrinkPcnt > 80)) ||
    (game.solved && cursorPosition[0] === 0)
  ) {
    newFeedback.lucky = true;
  }
  console.log(
    `${ogPossibleSolutionCount} -> ${game.possibleSolutions.size} (${newFeedback.solutionSetShrinkPcnt}%)`
  );

  await loadGuessResult(result);
  feedback.value = newFeedback;
  kbStatus.value = game.letterStates;

  if (game.solved) {
    const messages = [
      "🤥 Ok sis...",
      "🤯 Einstein 2.0?",
      "🤩 Awesome!",
      "😊 Nice",
      "😉 Not bad",
      "😅 Phew!",
    ];
    const message = messages[cursorPosition[0] - 1] ?? "🤩 Awesome!";
    isSolved.value = true;
    Alert.show(message);
  } else if (cursorPosition[0] === numOfGuesses) {
    Alert.show("☹ Maybe next time");
    Alert.show("Answer: " + game.solution);
  }
}

async function doShakeRow() {
  shakeRow.value = true;
  await sleep(600);
  shakeRow.value = false;
}

async function loadGuessResult(guessResult: LetterResult[]): Promise<void> {
  if (cursorPosition[0] >= numOfGuesses) {
    return;
  }
  isRevealing = true;
  const wordLetterStates = letterStates.value[cursorPosition[0]];
  for (let i = 0; i < wordLetterStates.length; i++) {
    wordLetterStates[i].flip = true;
    await sleep(300);
    wordLetterStates[i].status = guessResult[i].status;
    wordLetterStates[i].letter = guessResult[i].letter;
    wordLetterStates[i].isStatusInput = false;
  }

  await sleep(300);
  cursorPosition[0]++;
  cursorPosition[1] = 0;
  isRevealing = false;
}

function reset() {
  game.reset();
  isSolved.value = false;
  kbStatus.value = {};

  cursorPosition[0] = 0;
  cursorPosition[1] = 0;

  letterStates.value = Array.from(Array(numOfGuesses)).map(() => {
    return Array.from(Array(numOfLetters)).map(() => ({
      flip: false,
      isStatusInput: false,
    }));
  });

  feedback.value = undefined;
  kbInputStatus.value = undefined;
  showHints.value = false;
  possibleSolutions.value = [];
  topWords.value = [];
}

function undo() {
  Alert.show("Undo");
  if (cursorPosition[0] === 0) {
    return;
  }
  isSolved.value = false;
  cursorPosition[0]--;
  cursorPosition[1] = 0;
  game.undoLastGuess();
  kbStatus.value = game.letterStates;
  feedback.value = undefined;
  letterStates.value[cursorPosition[0]].forEach((x) => {
    x.letter = undefined;
    x.status = undefined;
    x.isStatusInput = false;
    x.flip = false;
  });
}

function acceptWord(word: string) {
  Alert.show(`Accepted ${word}`);
  if (game.solved || cursorPosition[0] >= numOfGuesses) {
    return;
  }
  letterStates.value[cursorPosition[0]].forEach((x) => {
    x.letter = undefined;
    x.status = undefined;
    x.isStatusInput = false;
    x.flip = false;
  });
}
</script>

<style scoped>
.gameBoard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  margin: 0 auto;
  height: 100%;
  max-height: 400px;
}
.letterBox {
  flex: 1;
  color: var(--whiteClr);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  font-weight: bold;
  text-transform: capitalize;
  padding: 2px;
  position: relative;
}
.letterBox.unset {
  border: 2px solid var(--keyClr);
  color: var(--blackClr);
  padding: 0;
}

.letterBox.input {
  border: 2px solid var(--absentClr);
  padding: 0;
}

.letterBox.input::after {
  position: absolute;
  width: 100%;
  height: 100%;
  content: "";
  border: 3px solid var(--whiteClr);
  box-sizing: border-box;
}

.letterBox.correct {
  background: var(--correctClr);
}
.letterBox.present {
  background: var(--presentClr);
}
.letterBox.absent {
  background: var(--absentClr);
}

.letterBox.filled.unset {
  border-color: var(--absentClr);
}

.row {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex: 1;
}

.playArea {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 5px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.pop {
  animation-name: Pop;
  animation-duration: 100ms;
}

@keyframes Pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  40% {
    opacity: 1;
    transform: scale(1.1);
  }
}
.flip {
  animation-duration: 600ms;
  animation-timing-function: ease-in-out;
  animation-name: Flip;
}
@keyframes Flip {
  0% {
    transform: rotateX(0);
  }
  50% {
    transform: rotateX(-90deg);
  }
  100% {
    transform: rotateX(0);
  }
}

@media (max-height: 670px) {
  .row {
    gap: 4px;
  }
  .gameBoard {
    gap: 4px;
  }
}

@media (max-height: 400px) {
  .letterBox {
    font-size: 5px;
    padding: 0;
    background: var(--keyClr);
    min-width: 5px;
    min-height: 5px;
  }
  .letterBox.unset {
    border: none;
  }
}

.shake {
  animation-name: Shake;
  animation-duration: 600ms;
}

@keyframes Shake {
  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
}
</style>
