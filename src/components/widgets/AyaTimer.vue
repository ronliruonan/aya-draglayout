<template>
  <el-card>
    <h4>小挂件-计时器</h4>
    <el-main>
        出生于 <em style="color:red;">{{ ms }}s</em> 前
    </el-main>
  </el-card>
</template>

<script>
export default {
  name: "AyaTimer",
  created() {
    this.timer();
  },
  methods: {
    timer() {
      window.setTimeout(() => {
        this.ms++;
        this.timer();
      }, 1000);
    }
  },
  data() {
    return {
      ms: 0
    };
  }
};
</script>
