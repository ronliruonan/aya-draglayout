<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to hello world"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    HelloWorld
  },
  mounted() {
    get();
  }
};

function get() {
  const xhr = new XMLHttpRequest();
  xhr.open("get", "http://localhost:8081/hello");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr.response);
    }
  };
  xhr.setRequestHeader("content-type", "application/json");
  xhr.send();
}
</script>
