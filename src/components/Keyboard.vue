<template>
  <div class="keyboard">
    <div class="suppControls">
      <div class="modeSwitcher">
        <span :style="{ color: !solveMode ? 'var(--blackClr)' : '' }">PLAY</span>
        <ToggleSwitch v-model="solveMode" style="font-size: 20px" />
        <span :style="{ color: solveMode ? 'var(--blackClr)' : '' }">SOLVE</span>
      </div>
      <div v-if="solveMode" class="clrBtns">
        <button
          v-for="(ls, i) in [
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
          <fa icon="undo" /><span v-if="!solveMode">UNDO</span>
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
import ToggleSwitch from "./ToggleSwitch.vue";

const keys: string[][] = "qwertyuiop\nasdfghjkl\nzxcvbnm".split("\n").map((row) => [...row]);

const props = defineProps({
  keyStatus: Object as PropType<Record<string, LetterStatus>>,
  guessInProgress: Boolean as PropType<boolean>,
  solved: Boolean as PropType<boolean>,
  inputLetterStatus: Number as PropType<LetterStatus>,
});

const internalKeyStatus = ref<Record<string, LetterStatus>>({});
let savedInputLetterStatus = LetterStatus.Absent;
const solveMode = ref(false);

watch(
  () => props.keyStatus,
  (newVal) => {
    if (props.inputLetterStatus === undefined) {
      internalKeyStatus.value = newVal ?? {};
    }
  },
  { immediate: true }
);

watch(
  () => solveMode.value,
  (newVal) => {
    if (newVal) {
      changeColor(savedInputLetterStatus);
    } else {
      if (props.inputLetterStatus !== undefined) {
        savedInputLetterStatus = props.inputLetterStatus;
      }
      changeColor(undefined);
    }
  }
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
  if (props.inputLetterStatus === color) {
    return;
  }
  emit("update:inputLetterStatus", color);
}

watch(
  () => props.inputLetterStatus,
  (newVal) => {
    solveMode.value = newVal !== undefined;
    if (newVal === undefined) {
      internalKeyStatus.value = props.keyStatus ?? {};
      solveMode.value = false;
    } else {
      internalKeyStatus.value = keys.flat().reduce((acc, key) => {
        acc[key] = newVal;
        return acc;
      }, {} as Record<string, LetterStatus>);
      solveMode.value = true;
    }
  }
);
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
  animation: fadein 200ms ease;
  animation-fill-mode: backwards;
}

.clrBtn:nth-child(2) {
  animation-delay: 100ms;
}
.clrBtn:nth-child(3) {
  animation-delay: 200ms;
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
  height: 28px;
  display: inline-flex;
  align-items: center;
}

.suppCtrl span {
  font-size: 12px;
  font-weight: 600;
  margin-left: 5px;
}

.suppCtrl:disabled {
  color: var(--absentClr);
}

.modeSwitcher * {
  vertical-align: middle;
}

.modeSwitcher .toggleSwitch {
  margin: 0 4px;
}

.modeSwitcher span {
  color: var(--absentClr);
  font-size: 10px;
  font-weight: 600;
}

.clrBtns {
}
</style>
