<template>
  <div
    class="alert"
    v-for="alert in alerts"
    :key="alert.index"
    :class="{ fadeOut: alert.pendingRemoval }"
    :style="{ top: (alert.index + 1) * 50 + 'px' }"
    @click="removeNow(alert)"
  >
    {{ alert.message }}
  </div>
</template>

<script lang="ts" setup>
import { sleep } from "@/algorithm/utilities";
import { AlertManager } from "@/components/AlertManager";
import { ref } from "vue";

interface AlertData {
  message: string;
  pendingRemoval: boolean;
  index: number;
}

const currentIndex = ref(0);
const alerts = ref(new Set<AlertData>()).value;

AlertManager.onMessage = async (message: string) => {
  const alert = ref({
    message,
    pendingRemoval: false,
    index: currentIndex.value,
  }).value;
  currentIndex.value++;
  alerts.add(alert);
  await sleep(2000);
  removeNow(alert);
};

async function removeNow(alert: AlertData) {
  if (alert.pendingRemoval || !alerts.has(alert)) {
    return;
  }
  alert.pendingRemoval = true;
  await sleep(500);
  alerts.delete(alert);
  if (alerts.size === 0) {
    currentIndex.value = 0;
  }
}
</script>

<style scoped>
.alert {
  position: fixed;
  line-height: 40px;
  top: 50px;
  width: 300px;
  left: calc(50% - 150px);
  background: var(--alertClr);
  color: var(--whiteClr);
  font-weight: bold;
  border-radius: 5px;
  animation: fadein 500ms;
  cursor: pointer;
  display: block;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

.fadeOut {
  animation: fadeout 500ms;
  animation-fill-mode: forwards;
}
</style>
