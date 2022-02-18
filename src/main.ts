import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleQuestion,
  faSquarePollVertical,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import App from "./App.vue";

library.add(faCircleQuestion, faSquarePollVertical, faGear);

createApp(App).component("fa", FontAwesomeIcon).mount("#app");
