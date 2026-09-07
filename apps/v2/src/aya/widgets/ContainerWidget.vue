<script setup lang="ts">
defineProps<{ title: string; columns: 1 | 2 | 3 }>();
</script>
<template>
  <section class="container-widget">
    <h3>{{ title }}</h3>
    <div class="container-grid" :style="{ '--columns': columns }"><slot /></div>
  </section>
</template>
