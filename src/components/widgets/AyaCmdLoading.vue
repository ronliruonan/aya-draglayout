<template>
  <el-card style="text-align:center;">
    <h3>小挂件-CMD加载</h3>
    <el-main>{{ txt }} - {{ txt }} - {{ txt }}</el-main>
  </el-card>
</template>

<script>
export default {
  name: "AyaCmdLoading",
  mounted() {
    this.justGo();
  },
  methods: {
    justGo() {
      setTimeout(() => {
        this.txt = this.symbols[this.times++ % 4];
        this.justGo();
      }, 250);
    }
  },
  data() {
    return {
      txt: "",
      symbols: ["\\", "||", "///", "-"],
      times: 0
    };
  }
};
</script>
