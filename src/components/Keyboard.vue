<template>
  <div class="keyboard">
    <div class="suppControls">
      <div>
        <button
          v-for="(ls, i) in [
          undefined,
          ...Object.values(LetterStatus).filter((x): x is LetterStatus => typeof x === 'number'),
        ]"
          :key="i"
          class="clrBtn"
          :class="{
            [ls !== undefined ? LetterStatus[ls].toLowerCase() : 'unset']: true,
            selected: inputLetterStatus === ls,
            disabled: isColorDisabled(ls),
          }"
          @click="changeColor(ls)"
        ></button>
      </div>
      <div>
        <button class="suppCtrl" @click="$emit('keyPress', 'undo')" v-if="!solved">
          <fa icon="undo" /><span>UNDO</span>
        </button>
        <button class="suppCtrl" @click="$emit('keyPress', 'restart')" v-else>
          <fa icon="arrows-rotate" /><span>RESTART</span>
        </button>
        <button class="suppCtrl" @click="$emit('keyPress', 'hint')" v-if="!solved">
          <fa icon="lightbulb" /><span>HINT</span>
        </button>
      </div>
    </div>
    <div class="row" v-for="(keyRow, y) in keys" :key="y">
      <div v-if="y === 1" class="kbSpacer"></div>
      <button @click="$emit('keyPress', 'enter')" v-if="y === 2" class="key big-key">ENTER</button>
      <button
        @click="$emit('keyPress', key, inputLetterStatus)"
        :class="[
          internalKeyStatus?.[key] !== undefined
            ? LetterStatus[internalKeyStatus[key]].toLowerCase()
            : '',
        ]"
        v-for="(key, x) in keyRow"
        :key="x"
        class="key"
      >
        {{ key }}
      </button>
      <button @click="$emit('keyPress', 'backspace')" v-if="y === 2" class="key big-key">
        <fa icon="delete-left" />
      </button>
      <div v-if="y === 1" class="kbSpacer"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LetterStatus } from "@/algorithm/letterStatus";
import { PropType, ref, watch } from "vue";
import { AlertManager } from "./AlertManager";

const keys: string[][] = "qwertyuiop\nasdfghjkl\nzxcvbnm".split("\n").map((row) => [...row]);

const props = defineProps({
  keyStatus: Object as PropType<Record<string, LetterStatus>>,
  guessInProgress: Boolean as PropType<boolean>,
  solved: Boolean as PropType<boolean>,
  inputLetterStatus: Number as PropType<LetterStatus>,
});

const internalKeyStatus = ref<Record<string, LetterStatus>>({});

watch(
  () => props.keyStatus,
  (newVal) => {
    if (props.inputLetterStatus === undefined) {
      internalKeyStatus.value = newVal ?? {};
    }
  },
  { immediate: true }
);

const emit = defineEmits<{
  (e: "keyPress", key: string, status?: LetterStatus): void;
  (e: "update:inputLetterStatus", status?: LetterStatus): void;
}>();

function isColorDisabled(color?: LetterStatus) {
  return (
    props.guessInProgress &&
    ((props.inputLetterStatus === undefined && color !== undefined) ||
      (props.inputLetterStatus !== undefined && color === undefined))
  );
}

function changeColor(color?: LetterStatus) {
  if (isColorDisabled(color)) {
    AlertManager.show("Clear guess first");
    return;
  } else if (props.inputLetterStatus === color) {
    return;
  }
  emit("update:inputLetterStatus", color);
  if (color === undefined) {
    internalKeyStatus.value = props.keyStatus ?? {};
  } else {
    internalKeyStatus.value = keys.flat().reduce((acc, key) => {
      acc[key] = color;
      return acc;
    }, {} as Record<string, LetterStatus>);
  }
}
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
  text-transform: capitalize;
}

.correct {
  background: var(--correctClr);
  color: var(--whiteClr);
}

.present {
  background: var(--presentClr);
  color: var(--whiteClr);
}

.absent {
  background: var(--absentClr);
  color: var(--whiteClr);
}

.unset {
  background: var(--whiteClr);
  color: var(--blackClr);
}

.kbSpacer {
  flex: 0.5;
}

.key.big-key {
  flex: 1.5;
}

.suppControls {
  height: 35px;
  border-top: 1px solid var(--keyClr);
  border-bottom: 1px solid var(--keyClr);
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.clrBtn {
  height: 30px;
  width: 30px;
  border-radius: 50% 50%;
  border: 3px solid var(--keyClr);
  box-sizing: border-box;
  position: relative;
  margin-right: 5px;
  cursor: pointer;
  vertical-align: top;
}

.clrBtn.selected {
  border: 4px solid var(--keyClr);
}

.clrBtn.disabled {
  opacity: 0.4;
}

.clrBtn.disabled {
  opacity: 0.4;
}

.clrBtn.selected::after,
.clrBtn.disabled::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 12px 12px;
  background-repeat: no-repeat;
  background-position: center;
}

.clrBtn.selected::after {
  background-image: url("../assets/check.svg");
}

.clrBtn.disabled::after {
  background-image: url("../assets/xmark.svg");
}

@media (max-height: 670px) {
  .key {
    height: 40px;
  }
}

.suppCtrl {
  line-height: 27px;
  text-align: center;
  padding: 0 10px;
  box-sizing: border-box;
  border: 0;
  border-radius: 4px;
  background: var(--keyClr);
  cursor: pointer;
  margin: 0 2px;
  color: var(--blackClr);
}

.suppCtrl span {
  font-size: 12px;
  font-weight: 600;
  margin-left: 5px;
  vertical-align: middle;
}

.suppCtrl svg {
  vertical-align: middle;
}

.suppCtrl:disabled {
  color: var(--absentClr);
}
</style>
