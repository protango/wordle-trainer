<template>
  <div
    class="toggleSwitch"
    :class="{ on: modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  ></div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

defineProps({
  modelValue: {
    type: Boolean as PropType<boolean>,
    required: true,
  },
});

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style scoped>
.toggleSwitch {
  font-size: 25px;
  height: 1em;
  width: calc(2em - 6px);
  border-radius: 9999px;
  background: var(--keyClr);
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.toggleSwitch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  height: calc(1em - 6px);
  width: calc(1em - 6px);
  border-radius: 50%;
  box-sizing: border-box;
  background: var(--absentClr);
  transition: left 0.2s ease-in-out;
}

.toggleSwitch.on::after {
  left: calc(1em - 3px);
}
</style>
