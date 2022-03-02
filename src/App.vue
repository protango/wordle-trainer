<template>
  <header class="mainHeader">
    <div class="header-buffer">
      <fa @click="showWelcomeModal = true" icon="circle-question" class="headerBtn" />
    </div>
    <h1 class="logo">Wordle Trainer</h1>
    <div class="header-buffer">
      <fa v-if="showHeaderControls" icon="square-poll-vertical" class="headerBtn" />
      <fa v-if="showHeaderControls" icon="gear" class="headerBtn" />
    </div>
  </header>
  <main class="main">
    <Game></Game>
  </main>
  <Modal v-model:show="showWelcomeModal" title="Welcome" icon="door-open" class="welcomeModal">
    <div>
      <span>
        <strong>WORDLE TRAINER</strong> rates the quality of each guess, and lets you know its top
        pick:</span
      >
      <FeedbackBar style="margin-top: 5px" :feedback="exampleFeedback"></FeedbackBar>
    </div>
    <div>
      <span>
        The <strong>HINT</strong> tool displays the algorithm's top guesses, along with possible
        solutions:</span
      >
      <div style="text-align: center; margin-top: 5px">
        <button class="suppCtrl"><fa icon="lightbulb" /><span>HINT</span></button>
      </div>
    </div>
    <div>
      <span>
        <strong>SOLVE MODE</strong> allows you to enter pre-coloured guesses from another WORDLE,
        which can then be solved using the hint tool:</span
      >
      <div class="demoToggle">
        <span :style="{ color: !fakeToggle ? 'var(--blackClr)' : '' }">PLAY</span>
        <ToggleSwitch style="font-size: 20px" v-model="fakeToggle" />
        <span :style="{ color: fakeToggle ? 'var(--blackClr)' : '' }">SOLVE</span>
      </div>
    </div>
    <div class="welcomeFooter">
      <span>
        Built with <i class="heart">❤</i> by <a href="https://github.com/protango">protango</a>.
      </span>
      <div class="licenceContainer">
        <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
          <img alt="Creative Commons License" style="border-width: 0" src="by-nc-sa.png" />
        </a>
        <a class="showLicence" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Licence.</a>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import Game from "./components/Game.vue";
import Modal from "./components/Modal.vue";
import FeedbackBar from "./components/FeedbackBar.vue";
import { Feedback } from "./algorithm/game";
import { MultiScore } from "./algorithm/multiScore";
import ToggleSwitch from "./components/ToggleSwitch.vue";

const showHeaderControls = ref(false);
const showWelcomeModal = ref(localStorage.getItem("wordleTrainerVisited") === null);
const fakeToggle = ref(true);

localStorage.setItem("wordleTrainerVisited", "true");

const exampleFeedback: Ref<Feedback> = ref({
  bestGuesses: [
    {
      word: "saucy",
      score: new MultiScore(1),
      scorePcnt: 100,
    },
  ],
  guess: "lorry",
  guessScorePercent: 81,
  lucky: false,
  missedWin: false,
  solutionSetShrinkPcnt: 100,
});

function cycleFeedback() {
  switch (exampleFeedback.value.guessScorePercent) {
    case 2.1:
      exampleFeedback.value.bestGuesses[0].word = "brick";
      exampleFeedback.value.guessScorePercent = 27;
      break;
    case 27:
      exampleFeedback.value.bestGuesses[0].word = "orate";
      exampleFeedback.value.guessScorePercent = 65;
      break;
    case 65:
      exampleFeedback.value.bestGuesses[0].word = "saucy";
      exampleFeedback.value.guessScorePercent = 81;
      break;
    case 81:
      exampleFeedback.value.bestGuesses[0].word = "extra";
      exampleFeedback.value.guessScorePercent = 100;
      break;
    case 100:
      exampleFeedback.value.bestGuesses[0].word = "hound";
      exampleFeedback.value.guessScorePercent = 2.1;
      break;
  }
}

let demoIntervals: number[] = [];
watch(
  () => showWelcomeModal.value,
  (newVal) => {
    if (newVal) {
      demoIntervals.push(setInterval(cycleFeedback, 5000));
      demoIntervals.push(
        setInterval(() => {
          fakeToggle.value = false;
          setTimeout(() => {
            fakeToggle.value = true;
          }, 500);
        }, 5000)
      );
    } else {
      for (const int of demoIntervals) {
        clearInterval(int);
      }
      demoIntervals = [];
    }
  },
  { immediate: true }
);
</script>

<style>
.mainHeader {
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #d3d6db;
  padding: 0 16px;
  white-space: nowrap;
}

.header-buffer {
  flex: 1 0 0;
}

.header-buffer:last-child {
  text-align: right;
}

.logo {
  font-family: "Suez One", serif;
  font-size: 24px;
  margin: 0;
  text-align: center;
  padding: 0 8px;
  transform: scale(1, 1.25);
}

.headerBtn {
  width: 21px;
  height: 21px;
  cursor: pointer;
  padding: 0 4px;
}

footer.mainFooter {
  font-size: 14px;
  color: #777;
  text-align: center;
  line-height: 20px;
  padding-bottom: 8px;
}

.heart {
  color: #e25555;
  font-style: normal;
}

@media (max-width: 400px) {
  .logo {
    font-size: 24px;
  }
}

@media (max-height: 815px) {
  footer br {
    display: none;
  }
  footer {
    font-size: 12px;
    line-height: unset;
    padding-bottom: 2px;
  }

  .logo {
    font-size: 24px;
  }

  header {
    height: 45px;
  }
}

@media (max-height: 700px) {
  footer {
    display: none;
  }
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

main.main {
  flex: 1 1 auto;
  min-height: 0;
}

body {
  margin: 0;
  font-family: "Roboto", sans-serif;
  height: 100%;
  position: relative;
}

html {
  height: 100%;
}

button {
  touch-action: manipulation;
}

:root {
  --bgClr: #fff;
  --keyClr: #d3d6da;
  --blueClr: #6496aa;
  --redClr: #aa6464;
  --correctClr: #6aaa64;
  --presentClr: #c9b458;
  --absentClr: #787c7e;
  --blackClr: #000;
  --alertClr: rgba(0, 0, 0, 0.8);
  --whiteClr: #fff;
  --selectedClr: #2855e9;
  --luckyClr: #1d8025;
}

p {
  margin: 0;
}

.welcomeModal {
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 20px;
}

.welcomeModal main > p,
.welcomeModal main > div:not(:last-child) {
  margin-bottom: 40px;
}

.welcomeModal .feedbackBar .fbDesc {
  font-size: 11px;
}

.welcomeModal .feedbackBar .scoreValue {
  font-size: 32px;
}

.welcomeModal .demoToggle span {
  vertical-align: middle;
  font-size: 10px;
  font-weight: bold;
  color: var(--absentClr);
}

.welcomeModal .demoToggle .toggleSwitch {
  vertical-align: middle;
  font-size: 20px;
  margin: 0 5px;
}

.welcomeModal .demoToggle {
  text-align: center;
  margin: 5px 0;
}

.welcomeModal .welcomeFooter {
  text-align: center;
  margin-top: 20px;
  color: var(--absentClr);
  font-size: 12px;
  line-height: 14px;
}

.welcomeModal .suppCtrl {
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

.welcomeModal .suppCtrl span {
  font-size: 12px;
  font-weight: 600;
  margin-left: 5px;
}

.welcomeModal .suppCtrl svg {
  vertical-align: middle;
}

.licenceContainer {
  margin-top: 2px;
}

.licenceContainer a {
  vertical-align: top;
  line-height: 15px;
}

.licenceContainer .showLicence {
  text-decoration: underline;
  margin-left: 5px;
  cursor: pointer;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeout {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
