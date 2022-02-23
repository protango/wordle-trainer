<template>
  <div
    class="feedbackBar"
    :style="{
      background: achievementLevel?.color,
    }"
    :class="{
      initial: !feedback,
    }"
  >
    <div class="icon">
      <div v-if="!achievementLevel" class="initialIcon">
        <fa icon="thumbs-up" />
        <fa icon="thumbs-down" />
      </div>
      <fa v-else :icon="achievementLevel.icon" />
    </div>
    <div class="feedback">
      <span class="fbTitle">{{ achievementLevel ? achievementLevel.text : "Enter a guess" }}</span>
      <span v-if="achievementLevel?.description" class="fbDesc">{{
        achievementLevel.description
      }}</span>
    </div>
    <div class="score">
      <span class="scoreTitle">WORD<br />SCORE</span>
      <span class="scoreValue">{{ props.feedback?.guessScorePercent ?? 0 }}</span>
      <span class="pcnt">%</span>
    </div>
    <div class="expandBtn" style="display: none">
      <fa icon="angle-down" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Feedback } from "@/algorithm/game";
import { computed, PropType } from "vue";

interface AchievementLevel {
  text: string;
  icon: string;
  color: string;
  threshold: number;
  description?: string;
}

const props = defineProps({
  feedback: Object as PropType<Feedback>,
});

const achievementLevels: AchievementLevel[] = [
  { text: "Best Word", icon: "brain", threshold: 100, color: "var(--blueClr)" },
  { text: "Excellent", icon: "star", threshold: 75, color: "var(--correctClr)" },
  { text: "Good", icon: "thumbs-up", threshold: 50, color: "var(--presentClr)" },
  { text: "Mistake", icon: "thumbs-down", threshold: 25, color: "var(--absentClr)" },
  { text: "Blunder", icon: "question", threshold: 0, color: "var(--redClr)" },
];

const achievementLevel = computed<AchievementLevel | undefined>(() => {
  if (!props.feedback) {
    return undefined;
  }
  const bestWordDesc = `The best word was "${props.feedback.bestGuesses[0].word.toUpperCase()}"`;
  if (props.feedback.lucky) {
    return {
      text: "Lucky Guess",
      icon: "clover",
      color: "var(--luckyClr)",
      threshold: 0,
      description: bestWordDesc,
    };
  } else if (props.feedback.missedWin) {
    return {
      text: "Missed Win",
      icon: "xmark",
      color: "var(--redClr)",
      threshold: 0,
      description: "There is only one possible word",
    };
  }
  for (const al of achievementLevels) {
    if (props.feedback.guessScorePercent >= al.threshold) {
      return {
        ...al,
        description: al.threshold === 100 ? "This was the top algorithm word" : bestWordDesc,
      };
    }
  }
  return undefined;
});
</script>

<style scoped>
.feedbackBar {
  height: 50px;
  box-shadow: 0 1px 3px var(--absentClr);
  padding: 1px 6px;
  box-sizing: border-box;
  display: flex;
  background: var(--keyClr);
  margin-bottom: 7px;
  position: relative;
  color: var(--whiteClr);
  transition: background-color 500ms linear;
}

.feedbackBar.initial {
  color: var(--blackClr);
}

.icon {
  height: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon > svg {
  height: 30px;
  width: 30px;
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
  color: var(--absentClr);
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
}

.score {
  display: flex;
  align-items: center;
}

.score .scoreValue {
  font-size: 36px;
  font-weight: bold;
  margin-left: 5px;
  text-align: center;
  display: inline-block;
  position: relative;
}

.score .pcnt {
  position: relative;
  top: -8px;
  font-size: 20px;
  margin-left: 2px;
}

.feedback {
  display: flex;
  justify-content: center;
  margin: 0 8px;
  flex: 1;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
}

.feedback .fbTitle {
  font-family: "Suez One", serif;
}

.feedback .fbDesc {
  font-size: 12px;
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
