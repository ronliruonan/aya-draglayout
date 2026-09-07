<script setup lang="ts">
defineProps<{ text: string; tone: "heading" | "body" }>();
</script>
<template>
  <h2 v-if="tone === 'heading'" class="widget-heading">{{ text }}</h2>
  <p v-else class="widget-text">{{ text }}</p>
</template>
