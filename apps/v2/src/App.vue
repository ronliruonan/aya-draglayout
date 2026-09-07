<script setup lang="ts">
import { computed, ref } from "vue";
import PageRenderer from "./aya/renderer/PageRenderer.vue";
import { samplePage } from "./sample";
import { widgetRegistry } from "./aya/widgets";
const showSource = ref(false);
const source = computed(() => JSON.stringify(samplePage, null, 2));
</script>
<template>
  <header class="topbar">
    <a class="brand" href="./" aria-label="AYA 首页"
      >aya<span> / 布局实验室</span></a
    ><span class="version">V2 · M0 基础预览</span
    ><span class="status"><i></i> 本地渲染</span>
  </header>
  <div class="workspace">
    <aside class="sidebar">
      <p class="eyebrow">WORKSPACE / 01</p>
      <h1>页面构建，<br />从这里开始。</h1>
      <p class="sidebar-description">
        用简单的组件，<br />组织你的下一页灵感。
      </p>
      <div class="sidebar-rule"></div>
      <h2 class="small-title">基础组件 <span>03</span></h2>
      <ul class="widget-list">
        <li v-for="(entry, key) in widgetRegistry" :key="key">
          <span class="widget-icon">{{
            key === "text" ? "T" : key === "metric" ? "#" : "▤"
          }}</span
          ><span>{{ entry.label }}</span
          ><span class="available">已就绪</span>
        </li>
      </ul>
      <p class="hint">当前为只读预览。<br />拖拽与属性编辑将在后续版本开放。</p>
      <div class="sidebar-footer">
        AYA DRAGLAYOUT<br /><span>小组件，自由组合。</span>
      </div>
    </aside>
    <main>
      <div class="page-title">
        <div>
          <p class="eyebrow">LAYOUT PREVIEW</p>
          <h2>{{ samplePage.title }}<span>示例页面</span></h2>
        </div>
        <button
          class="source-toggle"
          :aria-expanded="showSource"
          @click="showSource = !showSource"
        >
          {{ showSource ? "收起页面数据" : "查看页面数据" }}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div class="preview-toolbar">
        <span><i class="green-dot"></i> 页面预览</span>
        <span>桌面画布</span>
      </div>
      <div class="stage">
        <div class="canvas">
          <div class="canvas-caption">AYA / YOUR NEXT PAGE<span>01</span></div>
          <PageRenderer :document="samplePage" />
          <div class="canvas-footer">
            BUILT WITH AYA<span>一份数据，多种可能。</span>
          </div>
        </div>
      </div>
      <section v-if="showSource" class="source-panel">
        <h3>页面数据 <span>JSON · v1</span></h3>
        <pre tabindex="0" aria-label="页面 JSON">{{ source }}</pre>
      </section>
      <footer class="workspace-footer">
        <span>文本、指标卡与容器 · 由页面数据驱动</span
        ><span>只读预览 / M0</span>
      </footer>
    </main>
  </div>
</template>
