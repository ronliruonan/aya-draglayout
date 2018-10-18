<template>
  <el-card>
    {{content}}
  </el-card>
</template>

<script>
export default {
  name: "AyaHello",
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$axios
        .get("http://localhost:8081/hello")
        .then(response => {
          this.content = response.data;
          console.log("axios get");
        })
        .catch(errors => {
          console.warn(errors);
        });
    }
  },
  data() {
    return {
      content: ""
    };
  }
};
</script>
