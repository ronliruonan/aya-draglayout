<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>

<template>
  <div class="example-widget" role="status">
    <span class="example-icon" aria-hidden="true">✓</span>
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.example-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-radius: 4px;
  background: #f0f9eb;
  color: #529b2e;
  text-align: center;
}
.example-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #67c23a;
  color: white;
  font-weight: 700;
}
strong {
  font-size: 14px;
}
p {
  margin: 6px 0 0;
  font-size: 13px;
}
</style>
