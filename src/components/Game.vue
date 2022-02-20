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
              ]"
              :key="letterIdx"
            >
              <span>{{ letter.letter ?? "" }}</span>
            </div>
          </div>
        </div>
      </div>

      <Keyboard @key-press="handleKeyPress"></Keyboard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Feedback, Game } from "@/algorithm/game";
import { LetterResult } from "@/algorithm/solver";
import { LetterStatus } from "@/algorithm/letterStatus";
import { onMounted, onUnmounted, Ref, ref } from "vue";
import Keyboard from "./Keyboard.vue";
import FeedbackBar from "./FeedbackBar.vue";
import { sleep } from "@/algorithm/utilities";

interface LetterState {
  letter?: string;
  status?: LetterStatus;
  flip: boolean;
}

const numOfLetters = 5;
const numOfGuesses = 6;

const cursorPosition = [0, 0];
const feedback = ref<Feedback | undefined>(undefined);
const letterStates: Ref<LetterState[][]> = ref(
  Array.from(Array(numOfGuesses)).map(() => {
    return Array.from(Array(numOfLetters)).map(() => ({
      flip: false,
    }));
  })
);

let shakeRow = ref(false);

let game = new Game();
let isRevealing = false;

onMounted(() => {
  document.addEventListener("keydown", handleNativeKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleNativeKeyDown);
});

function handleNativeKeyDown(e: KeyboardEvent) {
  handleKeyPress(e.key.toUpperCase());
}

function handleKeyPress(key: string) {
  if (isRevealing) {
    return;
  }
  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACKSPACE") {
    if (cursorPosition[1] > 0) {
      letterStates.value[cursorPosition[0]][cursorPosition[1] - 1].letter = undefined;
      cursorPosition[1]--;
    }
  } else if (/^[A-Z]$/.test(key)) {
    if (cursorPosition[1] < numOfLetters) {
      letterStates.value[cursorPosition[0]][cursorPosition[1]].letter = key;
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
  if (!game.isValid(word)) {
    shakeRow.value = true;
    await sleep(600);
    shakeRow.value = false;
    return;
  }
  const newFeedback = game.feedback(word);
  const result = game.guess(word);
  await loadGuessResult(result);
  feedback.value = newFeedback;
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
  }

  await sleep(300);
  cursorPosition[0]++;
  cursorPosition[1] = 0;
  isRevealing = false;
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
}
.letterBox.unset {
  border: 2px solid var(--keyClr);
  color: var(--blackClr);
  padding: 0;
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
