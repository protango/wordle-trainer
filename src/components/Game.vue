<template>
  <div style="flex: 1; display: flex; align-items: center">
    <div class="gameBoard" :style="{ 'aspect-ratio': numOfLetters + '/' + numOfGuesses }">
      <div class="row" v-for="(row, guessIdx) in letterStates" :key="guessIdx">
        <div
          class="letterBox"
          v-for="(letter, letterIdx) in row"
          :class="[
            LetterStatus[letter.status].toLowerCase(),
            letter.letter ? 'filled pop' : '',
            letter.status !== LetterStatus.Unset ? 'flip' : '',
          ]"
          :key="letterIdx"
        >
          <span>{{ letter.letter ?? "" }}</span>
        </div>
      </div>
    </div>
  </div>

  <Keyboard @key-press="handleKeyPress"></Keyboard>
</template>

<script lang="ts" setup>
import { Game } from "@/algorithm/game";
import { LetterStatus } from "@/letterStatus";
import { onMounted, onUnmounted, Ref, ref } from "vue";
import Keyboard from "./Keyboard.vue";

interface LetterState {
  letter?: string;
  status: LetterStatus;
}

const numOfLetters = 5;
const numOfGuesses = 6;

const cursorPosition = [0, 0];
const letterStates: Ref<LetterState[][]> = ref(
  Array.from(Array(numOfGuesses)).map(() => {
    return Array.from(Array(numOfLetters)).map(() => ({
      status: LetterStatus.Unset,
    }));
  })
);

let game = new Game(5);

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
  if (key === "ENTER") {
    // TODO: handle enter
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
  box-sizing: border-box;
  color: var(--whiteClr);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 21px;
  font-weight: bold;
}
.letterBox.unset {
  border: 2px solid var(--keyClr);
  color: var(--blackClr);
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
  animation-duration: 250ms;
  animation-timing-function: ease-in;
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
</style>
