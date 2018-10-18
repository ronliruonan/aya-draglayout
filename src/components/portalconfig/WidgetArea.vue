<template>
<div>
  <draggable v-model="widgets" :element="'ul'" :options="{ group: {name:'ronli', pull: 'clone', put:false}}" @end="drag=false">
    <li class="cursor--move" v-for="(widget, widgetIndex) in widgets" :key="widgetIndex">{{widget.alias}}</li>
    <li class="cursor--forbid" v-if="!widgets.length" @start="drag=false" @end="drag=false" style="background-color:#67c23a;">--》回收槽《--</li>
  </draggable>
  <!-- <pre style="text-align:left;">{{widgets}}</pre> -->
</div>
</template>

<script>
// import Widget from "@/components/widgets/Widget.js";
import draggable from "vuedraggable";
import ayay from "@/components/widgets/index.js";

export default {
  name: "WidgetArea",
  components: {
    draggable
  },
  beforeCreate() {
    this.widgets = [];
  },
  data() {
    return {
      widgets: ayay.widgets
    };
  }
};
</script>
