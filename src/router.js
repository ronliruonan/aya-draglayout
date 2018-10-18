import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      // name: "home",
      component: Home,
      children: [
        {
          path: "/",
          name: "home",
          component: () => import("./components/home/PortalView.vue")
        },
        {
          path: "hello",
          component: () => import("./components/home/HelloWorld.vue")
        }
      ]
    },
    // { // 示例代码，留作参考
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () =>
    //     import(/* webpackChunkName: "about" */ "./views/About.vue")
    // },
    {
      path: "/config",
      name: "config",
      component: () => import("./views/Config.vue")
    },
    {
      path: "/quicklinks",
      name: "quicklinks",
      component: () => import("./views/QuickLinks.vue")
    }
  ]
});
