<template>
  <el-main style="padding-top:0;">
    <h1 v-if="$store.state.userid ==='aya'" style="text-align: center;">右上角选择用户</h1>
    <el-row :gutter="10" v-for="(row, rowIndex) in initdata" :key="rowIndex">
      <el-col v-for="(zone, zoneIndex) in row.zones" :key="zoneIndex" :md="zone.size">
        <div v-if="!zone.widgets.length">&nbsp;</div>
        <div v-for="(widget, widgetIndex) in zone.widgets" :key="widgetIndex">
          <!-- <h3>{{ item.name }}</h3> -->
          <component :is="widget.name"></component>
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import ayay from "@/components/widgets/index.js";

export default {
  name: "PortalView",
  components: {
    ...ayay.components
  },
  mounted() {
    this.hello();
  },
  watch: {
    "$store.state.userid": function() {
      this.hello();
    }
  },
  methods: {
    hello() {
      this.$axios
        .get("http://localhost:8081/config/sites/" + this.$store.state.userid)
        .then(response => {
          this.ajax = response.data;
          // console.log(this.ajax)
          this.initdata = response.data.pro;
        })
        .catch(errors => {
          console.error(errors);
        });
    }
  },
  data() {
    return {
      ajax: "nothing",
      initdata: []
    };
  }
};
</script>
