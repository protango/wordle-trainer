<template>
  <div style="flex: 1; display: flex; align-items: center">
    <div class="gameBoard" :style="{ 'aspect-ratio': numOfLetters + '/' + numOfGuesses }">
      <div class="row" v-for="(row, guessIdx) in letterStates" :key="guessIdx">
        <div
          class="letterBox"
          v-for="(letter, letterIdx) in row"
          :class="[LetterStatus[letter.status].toLowerCase()]"
          :key="letterIdx"
        >
          {{ letter.letter ?? "" }}
        </div>
      </div>
    </div>
  </div>

  <Keyboard></Keyboard>
</template>

<script lang="ts" setup>
import { LetterStatus } from "@/letterStatus";
import Keyboard from "./Keyboard.vue";

interface LetterState {
  letter?: string;
  status: LetterStatus;
}

const numOfLetters = 5;
const numOfGuesses = 6;

const letterStates: LetterState[][] = Array.from(Array(numOfGuesses)).map(() => {
  return Array.from(Array(numOfLetters)).map(() => ({
    status: LetterStatus.Absent,
  }));
});
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
  border: 2px solid var(--keyClr);
}

.row {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex: 1;
}
</style>
