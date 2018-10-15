<template>
<div>
  <draggable v-model="widgets" :element="'ul'" :options="{ group: {name:'ronli', pull: 'clone', put:false}}" @end="drag=false">
    <li class="cursor--move" v-for="widget in widgets" :key="widget.id">{{widget.alias}}</li>
    <li class="cursor--forbid" v-if="!widgets.length" @start="drag=false" @end="drag=false" style="background-color:#67c23a;">--》回收槽《--</li>
  </draggable>
  <pre style="text-align:left;">{{widgets}}</pre>
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
  methods: {
    // onUpdate() {
    //   console.log(110);
    //   // console.log(evt.item)
    //   // console.log(evt.to)
    //   // console.log(evt.from)
    //   // console.log(evt.oldIndex)
    //   // console.log(evt.newIndex)
    // },
    // onRemoved(evt) {
    //   console.log(evt.item);
    //   console.log(evt.to);
    //   console.log(evt.from);
    //   console.log(evt.oldIndex);
    //   console.log(evt.newIndex);
    //   console.log(evt);
    //   this.widgets = JSON.parse(JSON.stringify(ayay.widgets));
    // }
  },
  data() {
    return {
      // widgets: JSON.parse(JSON.stringify(ayay.widgets))
      widgets: ayay.widgets
    };
  }
};
</script>
