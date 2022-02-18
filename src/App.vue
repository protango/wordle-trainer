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
  <main></main>
  <footer>
    <span
      >Built with <i class="heart">❤</i> by
      <a href="https://github.com/protango">protango</a></span
    ><br />
    <span>Not endorsed by, nor affiliated with the New York Times</span>
  </footer>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import HelloWorld from "./components/HelloWorld.vue";

@Options({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {}
</script>

<style>
@font-face {
  font-family: suez-one;
  src: url("./assets/SuezOne-Regular.ttf");
}

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
  font-family: suez-one;
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

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

main {
  flex: 1 1 auto;
}

body {
  margin: 0;
  font-family: sans-serif;
}
</style>
