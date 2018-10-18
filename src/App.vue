<template>
  <el-container id="app">
    <el-header class="app__header">
      <img alt="Vue logo" src="@/assets/logo.png" style="display:inline-block;vertical-align:middle; height:80%;">
      <span style="padding:20px;font-size:24px;vertical-align:middle;">门户DEMO</span>
      <ul class="el-menu el-menu--horizontal" style="float:right;">
        <li class="el-menu-item">当前用户, {{$store.state.username?$store.state.username:'(￢_￢)～'}}</li>
        <li class="el-menu-item">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">
              {{$store.state.username?$store.state.username:'选择用户'}}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="liruonan">曏小強</el-dropdown-item>
              <el-dropdown-item command="liyuyang">李雨阳</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
        <li class="el-menu-item" style="padding:0;"><el-button type="text" @click="logout">退出</el-button></li>
      </ul>
      <el-menu default-active="1" mode="horizontal" class="aya-el-menu" style="float:right;">
        <el-menu-item index="1"><router-link to="/" slot="title"> 首 页 </router-link></el-menu-item>
        <el-menu-item index="3"><router-link to="/quicklinks" slot="title">快速导航</router-link></el-menu-item>
        <el-menu-item index="2"><router-link to="/config">相关配置</router-link></el-menu-item>
      </el-menu>
    </el-header>
    <router-view></router-view>
  </el-container>
</template>
<script>
export default {
  methods: {
    handleCommand(command) {
      this.$axios
        .get("http://localhost:8081/user/" + command)
        .then(response => {
          let { userid, alias } = response.data;
          this.$store.state.userid = userid;
          this.$store.state.username = alias;
        })
        .catch(errors => {
          console.warn(errors);
        });
    },
    logout() {
      this.$store.state.userid = "aya";
      this.$store.state.username = "";
    }
  }
};
</script>
<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // 头部Header
  & > header {
    height: 60px;
    padding-left: 40px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
    // 头部导航
    & > .el-menu {
      border: none;
      & > .el-menu-item {
        height: 50px;
      }
      & > .aya-el-menu {
        padding: 0;
        & > a {
          padding: 0 20px;
        }
      }
    }
  }
  a {
    display: inline-block;
    width: 100%;
    color: inherit;
    text-decoration: none;
  }
}
header::after {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}
ul {
  list-style: none;
  padding: 0;
}
.el-row {
  padding-top: 10px;
}
</style>
