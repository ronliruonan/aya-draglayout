<template>
  <div id="app">
    <div id="nav">
      <router-link to="./home">Home</router-link> |
      <router-link to="./about">About</router-link>|
      <router-link to="./">Portal</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 10px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 5px 10px;
  padding: 5px 10px;
  border: 1px solid #e6e6e6;
}
.el-row {
  padding-top: 20px;
}
</style>
