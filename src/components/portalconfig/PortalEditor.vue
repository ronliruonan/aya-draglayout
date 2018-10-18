<template>
  <el-container class="portal__editor">
    <el-aside class="el-card is-always-shadow" width="150px" style="height:600px; box-sizing:border-box; ">
      <h4>组件区</h4>
      <WidgetArea></WidgetArea>
    </el-aside>
    <el-container>
      <el-header style="background-color:#B3C0D1;">
        <p>布局</p>
      </el-header>
      <el-main>
        <el-button @click="addRow([8, 8, 8])">新增 8:8:8</el-button>
        <el-button @click="addRow()">新增 6:6:6:6</el-button>
        <el-button @click="preview()">预览</el-button>
        <el-row :gutter="10" v-for="(row,rowIndex) in rows" :key="rowIndex">
          <el-col v-for="(zone,zoneIndex) in row.zones" :key="zoneIndex" :md="zone.size" style="border:1px dotted #ddd;min-height:88px;">
            <!-- 拖拽盒子 -->
            <draggable v-model="zone.widgets" :options="{ group : 'ronli' }" @start="drag=true" @end="drag=false">
              <!-- 拖拽主键 -->
              <div v-for="(item,itemIndex) in zone.widgets" :key="itemIndex">
                <p class="cursor--move">鼠标 hold住这儿，再拖拽 -- <i style="color:red;">这里写一个删除</i></p>
                <component :is="item.name"></component>
              </div>
              <div class="cursor--forbid" v-if="!zone.widgets.length" @start="drag=false" @end="drag=false" style="padding:1em 0;">空白区</div>
              <p style="font-size:12px;">- - 》》插口槽 Is Here《《 - -</p>
            </draggable>
          </el-col>
          <!-- 行删除btn -->
          <el-button type="danger" icon="el-icon-delete" circle title="删除该行" @click="deleteRow(rowIndex)" style="position:absolute; left:-10px; top:10px;"></el-button>
        </el-row>
      </el-main>
      <!-- <pre style="text-align:left;">{{rows}}</pre> -->
    </el-container>
    <transition name="fade">
      <ProtalPreview v-if="isPreview" :contents="rows" @previewclose="preview"></ProtalPreview>
    </transition>
  </el-container>
</template>

<script>
import draggable from "vuedraggable";
import WidgetArea from "@/components/portalconfig/WidgetArea.vue";
import ProtalPreview from "@/components/portalconfig/PortalPreview.vue";

import ayay from "@/components/widgets/index.js";

export default {
  name: "sb",
  props: {
    msg: String
  },
  components: {
    draggable,
    WidgetArea,
    ProtalPreview,
    ...ayay.components
  },
  methods: {
    addRow(cols = [6, 6, 6, 6]) {
      const newRow = {
        zones: []
      };
      cols.forEach(colsize => {
        newRow.zones.push({
          size: colsize,
          widgets: []
        });
      });
      this.rows.push(newRow);
    },
    preview(vbool) {
      this.isPreview =
        vbool === null || vbool === undefined ? !this.isPreview : !!vbool;
    },
    deleteRow(rowindex) {
      this.rows.splice(rowindex, 1);
    }
  },
  data() {
    return {
      isPreview: false,
      rows: [
        {
          zones: [
            {
              size: 12,
              widgets: [
                {
                  name: "AyaExample",
                  alias: "第一纵Origin左边左"
                }
              ]
            },
            {
              size: 12,
              widgets: [
                {
                  name: "AyaExample",
                  alias: "第一纵Origin右边右"
                }
              ]
            }
          ]
        },
        {
          zones: [
            {
              size: 8,
              widgets: [
                {
                  name: "AyaTimer",
                  alias: "预设Timer"
                }
              ]
            },
            {
              size: 8,
              widgets: []
            },
            {
              size: 8,
              widgets: []
            }
          ]
        }
      ]
    };
  }
};
</script>
<style lang="scss">
.cursor--forbid {
  cursor: not-allowed !important;
}
.cursor--move {
  cursor: move !important;
}
p.cursor--move {
  margin: 0;
  padding: 10px;
  font-size: 12px !important;
  background-color: lightsteelblue;
}
.fade-enter-active {
  transition: all 0.5s ease;
}
.fade-leave-active {
  transition: all 0.5s ease; //cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter {
  transform: translateX(15px);
  opacity: 0;
}
.fade-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
