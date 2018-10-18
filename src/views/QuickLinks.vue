<template>
  <el-container class="quick__links">
    <el-tag size="default" class="el-tag--mr"><a href="//week.citicwater.com" target="_blank">工作周报系统</a></el-tag>
    <el-tag size="default" class="el-tag--mr"><a href="//pm.citicwater.com" target="_blank">建管进度管理系统</a></el-tag>
    <el-tag size="default" class="el-tag--mr"><a href="//im.citicwater.com" target="_blank">投资系统</a></el-tag>
    <el-tag size="default" class="el-tag--mr"><a href="//dm.citicwater.com" target="_blank">知识共享平台</a></el-tag>
  </el-container>
</template>

<style lang="scss" scoped>
.quick__links {
  justify-content: center;
  padding: 20px 20px;
  .el-tag--mr {
    margin-right: 20px;
  }
  .el-tag--default {
    height: auto;
    line-height: 1;
    a {
      padding: 10px;
      font-size: 20px;
    }
  }
}
</style>
