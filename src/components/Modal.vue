<template>
  <div class="modalBg" :class="{ fadeOut }" v-if="display">
    <div class="modal">
      <header>
        <h1><fa v-if="icon" :icon="icon" />{{ title }}</h1>
        <button class="closeBtn" @click="$emit('update:show', false)"><fa icon="xmark" /></button>
      </header>
      <main>
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { sleep } from "@/algorithm/utilities";
import { ref, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: String,
  icon: String,
});

defineEmits<{
  (event: "update:show", show: boolean): void;
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
.modal {
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

@keyframes slidein {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}

.fadeOut {
  animation: fadeout 400ms;
  animation-fill-mode: forwards;
}
</style>
