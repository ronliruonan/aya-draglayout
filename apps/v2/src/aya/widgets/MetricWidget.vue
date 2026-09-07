<script setup lang="ts">
defineProps<{ label: string; value: string; detail: string }>();
</script>
<template>
  <article class="metric">
    <p>{{ label }}</p>
    <strong>{{ value }}</strong
    ><small>{{ detail }}</small>
  </article>
</template>
