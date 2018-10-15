<template>
  <div class="portal">
    <PortalEditor msg="PortalEditor：出场了"></PortalEditor>
  </div>
</template>

<script>
import { Loading } from "element-ui";
import PortalEditor from "@/components/portalconfig/PortalEditor.vue";

export default {
  name: "portal",
  components: { PortalEditor },
  beforeCreate() {
    this.$store.state.loadingInstance = Loading.service();
  },
  created() {
    window.setTimeout(() => {
      const loadingInstance = this.$store.state.loadingInstance;
      if (loadingInstance && loadingInstance.close) {
        loadingInstance.close();
      }
    }, 1000);
  },
  data() {
    return {
      // loadingInstance: Loading.service()
    };
  }
};
</script>
