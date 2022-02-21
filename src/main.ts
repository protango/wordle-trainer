import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleQuestion,
  faSquarePollVertical,
  faGear,
  faDeleteLeft,
  faThumbsUp,
  faThumbsDown,
  faAngleDown,
  faStar,
  faQuestion,
  faBrain,
  faUndo,
  faArrowsRotate,
  faClover,
  faLightbulb,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import App from "./App.vue";

library.add(
  faCircleQuestion,
  faSquarePollVertical,
  faGear,
  faDeleteLeft,
  faThumbsUp,
  faThumbsDown,
  faAngleDown,
  faStar,
  faQuestion,
  faBrain,
  faUndo,
  faArrowsRotate,
  faClover,
  faLightbulb,
  faXmark
);

createApp(App).component("fa", FontAwesomeIcon).mount("#app");
