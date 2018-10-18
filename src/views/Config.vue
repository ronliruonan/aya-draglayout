<template>
  <el-container>
    <PortalEditor></PortalEditor>
    <!-- <el-aside id="nav" style="width:200px;overflow:hidden;">
      <el-menu default-active="1">
        <el-menu-item index="1">
          <i class="el-icon-menu"></i>
          <router-link to="/" slot="title">看板</router-link>
        </el-menu-item>
        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>二级导航</span>
          </template>
          <el-menu-item index="2-1"><router-link to="hello" slot="title">Hello 你好</router-link></el-menu-item>
          <el-menu-item index="2-3">二级导航01</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside> -->
    <!-- <router-view></router-view> -->
  </el-container>
</template>

<script>
// import { Loading } from "element-ui";
import PortalEditor from "@/components/portalconfig/PortalEditor.vue";

export default {
  name: "portal",
  components: { PortalEditor }
};
</script>
