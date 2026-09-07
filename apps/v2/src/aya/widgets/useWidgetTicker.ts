import { onMounted, onUnmounted, ref } from "vue";

/** Runtime state belongs to the mounted widget, never to exported page JSON. */
export function useWidgetTicker(delay: number) {
  const ticks = ref(0);
  let interval: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    interval = setInterval(() => {
      ticks.value++;
    }, delay);
  });
  onUnmounted(() => {
    clearInterval(interval);
  });
  return ticks;
}
