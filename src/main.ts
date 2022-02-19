import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleQuestion,
  faSquarePollVertical,
  faGear,
  faDeleteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import App from "./App.vue";

library.add(faCircleQuestion, faSquarePollVertical, faGear, faDeleteLeft);

createApp(App).component("fa", FontAwesomeIcon).mount("#app");
