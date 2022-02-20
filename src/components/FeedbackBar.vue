<template>
  <div class="feedbackBar">
    <div class="icon">
      <div v-if="initial" class="initialIcon">
        <fa icon="thumbs-up" />
        <fa icon="thumbs-down" />
      </div>
    </div>
    <div class="feedback">
      <span>Enter first guess</span>
    </div>
    <div class="score">
      <span class="scoreTitle">WORD<br />SCORE</span>
      <span class="scoreValue">0</span>
      <span class="pcnt">%</span>
    </div>
    <div class="expandBtn">
      <fa icon="angle-down" />
    </div>
  </div>
</template>

<script lang="ts" setup>
let initial = true;
</script>

<style scoped>
.feedbackBar {
  height: 50px;
  border-bottom: 1px solid var(--keyClr);
  padding: 1px 6px;
  box-sizing: border-box;
  display: flex;
  color: var(--absentClr);
  background: var(--keyClr);
  margin-bottom: 7px;
  position: relative;
}

.feedback {
  font-family: "Suez One", serif;
  flex: 1;
}

.icon {
  height: 100%;
  aspect-ratio: 1 / 1;
}

.initialIcon {
  width: 100%;
  height: 100%;
  position: relative;
}

.initialIcon > svg {
  position: absolute;
  width: 40%;
  height: 40%;
  color: var(--blackClr);
}

.initialIcon > svg:first-child {
  position: absolute;
  top: 20%;
  left: 20%;
  transform: translate(-20%, -20%);
}
.initialIcon > svg:last-child {
  position: absolute;
  top: 80%;
  left: 80%;
  transform: translate(-80%, -80%);
}

.scoreTitle {
  text-align: right;
  font-size: 10px;
  font-weight: bold;
  line-height: 9px;
  margin-right: 5px;
  font-family: "Roboto", sans-serif;
}

.score {
  display: flex;
  align-items: center;
  font-family: "Suez One", serif;
}

.score .scoreValue {
  font-size: 40px;
  margin-left: 5px;
  text-align: center;
  display: inline-block;
  position: relative;
  top: -4px;
  color: var(--blackClr);
}

.score .pcnt {
  position: relative;
  top: -8px;
  font-size: 20px;
  margin-left: 2px;
  color: var(--blackClr);
}

.feedback {
  display: flex;
  align-items: center;
  margin: 0 8px;
  color: var(--blackClr);
}

.expandBtn {
  position: absolute;
  bottom: -11px;
  left: calc(50% - 11px);
  width: 22px;
  height: 22px;
  background: var(--whiteClr);
  border-radius: 50%;
  border: 1px solid var(--keyClr);
  cursor: pointer;
}

.expandBtn svg {
  width: 14px;
  height: 14px;
  margin: 4px;
  color: var(--blackClr);
}
</style>
