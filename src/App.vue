<template>
  <header>
    <div class="header-buffer">
      <fa icon="circle-question" class="headerBtn" />
    </div>
    <h1 class="logo">Wordle Coach</h1>
    <div class="header-buffer">
      <fa icon="square-poll-vertical" class="headerBtn" />
      <fa icon="gear" class="headerBtn" />
    </div>
  </header>
  <main>
    <Game></Game>
  </main>
  <footer>
    <span
      >Built with <i class="heart">❤</i> by
      <a href="https://github.com/protango">protango</a>. </span
    ><br />
    <span>Not endorsed by, nor affiliated with the New York Times. </span>
  </footer>
</template>

<script setup lang="ts">
import Game from "./components/Game.vue";
</script>

<style>
header {
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
  font-size: 28px;
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

footer {
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
}

@media (max-height: 400px) {
  footer {
    display: none;
  }
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

main {
  flex: 1 1 auto;
  min-height: 0;
}

body {
  margin: 0;
  font-family: "Roboto", sans-serif;
}

:root {
  --bgClr: #fff;
  --keyClr: #d3d6da;
  --correctClr: #6aaa64;
  --presentClr: #c9b458;
  --absentClr: #787c7e;
  --blackClr: #000;
  --whiteClr: #fff;
}
</style>
