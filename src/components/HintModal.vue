<template>
  <div class="modalBg" :class="{ fadeOut }" v-if="display">
    <div class="hint">
      <header>
        <h1><fa icon="lightbulb" />Hint</h1>
        <button class="closeBtn" @click="$emit('update:show', false)"><fa icon="xmark" /></button>
      </header>
      <main>
        <p class="instructions">Tap a word to add it to the game board.</p>
        <h2>Top algorithm words:</h2>
        <div class="topWords">
          <div
            v-for="word in topWords"
            :key="word.word"
            class="extWordPill"
            @click="
              $emit('update:show', false);
              $emit('acceptWord', word.word);
            "
          >
            <span class="wordPill">{{ word.word }}</span
            ><span class="suppInfo">{{ +word.scorePcnt.toFixed(1) }}% </span>
          </div>
          <div v-if="!topWords || !topWords.length" class="noHint">
            <span>No suggestions available</span>
          </div>
        </div>
        <h2>Possible Solutions:</h2>
        <div class="possibleSolns">
          <span
            v-for="word in possibleSolutions.slice(0, 10)"
            :key="word"
            class="wordPill"
            @click="
              $emit('update:show', false);
              $emit('acceptWord', word);
            "
            >{{ word }}</span
          >
          <div v-if="possibleSolutions && possibleSolutions.length > 10" class="plusMore">
            <span>+{{ possibleSolutions.length - 10 }} More</span>
          </div>
          <div>
            <div v-if="!possibleSolutions || !possibleSolutions.length" class="noHint">
              <span>No suggestions available</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ScoredWord } from "@/algorithm/solver";
import { sleep } from "@/algorithm/utilities";
import { PropType, ref, watch } from "vue";

const props = defineProps({
  topWords: {
    type: Array as PropType<ScoredWord[]>,
    default: () => [],
  },
  possibleSolutions: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  show: {
    type: Boolean,
    required: true,
  },
});

defineEmits<{
  (event: "update:show", show: boolean): void;
  (event: "acceptWord", word: string): void;
}>();

const display = ref(false);
const fadeOut = ref(false);

watch(
  () => props.show,
  (newVal) => {
    if (newVal === display.value) {
      return;
    }
    if (!newVal) {
      fadeOut.value = true;
      sleep(500).then(() => {
        display.value = false;
        fadeOut.value = false;
      });
    } else {
      fadeOut.value = false;
      display.value = true;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.modalBg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--alertClr);
  z-index: 100;
  animation: fadein 500ms;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hint {
  max-width: 500px;
  width: calc(100% - 20px);
  min-height: 200px;
  background: var(--whiteClr);
  border-radius: 10px;
  animation: slidein 500ms;
  box-sizing: border-box;
  padding: 10px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
  padding-left: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--keyClr);
}

header > h1 {
  margin: 0;
  font-size: 20px;
  font-family: "Suez One", serif;
  font-weight: normal;
}

header > h1 > svg {
  margin-right: 10px;
}

.closeBtn {
  border: 0;
  background: var(--keyClr);
  border-radius: 50%;
  color: var(--blackClr);
  width: 25px;
  text-align: center;
  line-height: 25px;
  padding: 0;
  cursor: pointer;
}
main {
  margin-top: 10px;
}

main h2 {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

main p {
  margin: 0;
}

.extWordPill {
  border-radius: 5px;
  display: inline-block;
  margin-right: 4px;
  cursor: pointer;
}

.extWordPill .suppInfo {
  color: var(--whiteClr);
  background: var(--absentClr);
  line-height: 22px;
  display: inline-block;
  padding: 0 3px;
  font-size: 10px;
  border-radius: 0 5px 5px 0;
  text-align: center;
  min-width: 35px;
  vertical-align: top;
}
.extWordPill .wordPill {
  border-radius: 5px 0 0 5px;
  margin-right: 0;
}

.wordPill {
  line-height: 22px;
  padding: 0 6px;
  border-radius: 5px;
  background: var(--keyClr);
  font-family: "Courier Prime", monospace;
  letter-spacing: 1px;
  display: inline-block;
  margin: 0 4px 4px 0;
  cursor: pointer;
  vertical-align: top;
}

.noHint {
  color: var(--absentClr);
  font-size: 12px;
  text-align: center;
}

@keyframes slidein {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}

.topWords {
  margin-bottom: 20px;
}

.fadeOut {
  animation: fadeout 400ms;
  animation-fill-mode: forwards;
}

.plusMore {
  display: inline-block;
  color: var(--absentClr);
  font-size: 12px;
  text-align: center;
  margin: 0px 2px;
}

.instructions {
  margin: 20px 0 20px 0;
  font-size: 14px;
}
</style>
