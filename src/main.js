import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.config.productionTip = false;

Vue.use(ElementUI, { size: "small", zIndex: 3000 });

// for http request
axios.defaults.baseURL = "http://localhost:8081";
axios.defaults.headers.common["aya-token"] = "aya-ronli";
axios.defaults.headers.post["content-type"] = "application/json";
Vue.prototype.$axios = axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
