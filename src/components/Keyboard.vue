<template>
  <div class="keyboard">
    <div class="row" v-for="(keyRow, y) in keys" :key="y">
      <div v-if="y === 1" class="kbSpacer"></div>
      <button @click="$emit('keyPress', 'ENTER')" v-if="y === 2" class="key big-key">ENTER</button>
      <button
        @click="$emit('keyPress', key)"
        :class="[props.keyStatus?.[key] ? LetterStatus[props.keyStatus[key]].toLowerCase() : '']"
        v-for="(key, x) in keyRow"
        :key="x"
        class="key"
      >
        {{ key }}
      </button>
      <button @click="$emit('keyPress', 'BACKSPACE')" v-if="y === 2" class="key big-key">
        <fa icon="delete-left" />
      </button>
      <div v-if="y === 1" class="kbSpacer"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LetterStatus } from "@/algorithm/letterStatus";
import { PropType } from "vue";

const keys: string[][] = "QWERTYUIOP\nASDFGHJKL\nZXCVBNM".split("\n").map((row) => [...row]);

const props = defineProps({
  keyStatus: Object as PropType<Record<string, LetterStatus>>,
});

defineEmits<{
  (e: "keyPress", key: string): void;
}>();
</script>

<style scoped>
.keyboard {
  margin: 0 3px;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 6px 0;
}

.key {
  background: var(--keyClr);
  border: none;
  height: 54px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  padding: 0;
  margin: 0 3px;
  color: var(--blackClr);
  user-select: none;
  touch-action: manipulation;
}

.key.correct {
  background: var(--correctClr);
}

.key.present {
  background: var(--presentClr);
}

.key.absent {
  background: var(--absentClr);
}

.kbSpacer {
  flex: 0.5;
}

.key.big-key {
  flex: 1.5;
}

@media (max-height: 670px) {
  .key {
    height: 40px;
  }
}
</style>
