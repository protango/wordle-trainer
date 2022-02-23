<template>
  <Modal title="Hint" icon="lightbulb" :show="show" @update:show="(x) => $emit('update:show', x)">
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
    <p class="algoDisclaimer">
      <a v-if="!showAlgoDisclaimer" @click="showAlgoDisclaimer = true"
        >Why was an impossible word suggested?</a
      >
      <span v-if="showAlgoDisclaimer">
        The algorithm may pick words that are not possible solutions, this happens when it needs to
        reveal more letters before attempting a solution.
      </span>
    </p>
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
  </Modal>
</template>

<script lang="ts" setup>
import { ScoredWord } from "@/algorithm/solver";
import { sleep } from "@/algorithm/utilities";
import { PropType, ref, watch } from "vue";
import Modal from "./Modal.vue";

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

const showAlgoDisclaimer = ref(false);

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      showAlgoDisclaimer.value = false;
    }
  }
);
</script>

<style scoped>
h2 {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

p {
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

.topWords {
  margin-bottom: 10px;
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

.algoDisclaimer a {
  text-decoration: underline;
  cursor: pointer;
}

.algoDisclaimer {
  margin: 10px 0 20px 0;
  font-size: 12px;
}
</style>
