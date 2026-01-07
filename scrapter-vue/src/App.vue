<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #213547;
  --text-strong: #111827;
  --muted-text: #666666;
  --subtle-text: #999999;
  --header-bg: #f9f9f9;
  --primary-color: #ff7700;
  --secondary-bg: #f1f1f1;
  --surface-bg: #ffffff;
  --surface-muted-bg: #fbfbfb;
  --primary-soft-bg: #fff5f0;
  --border-color: #e0e0e0;
  --hover-bg: #e8e8e8;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --text-strong: #ffffff;
  --muted-text: #bdbdbd;
  --subtle-text: #8a8a8a;
  --header-bg: #2d2d2d;
  --primary-color: #ff7700;
  --secondary-bg: #2d2d2d;
  --surface-bg: #2d2d2d;
  --surface-muted-bg: #242424;
  --primary-soft-bg: rgba(255, 119, 0, 0.14);
  --border-color: #404040;
  --hover-bg: #3d3d3d;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.6s ease, color 0.6s ease;
  position: relative;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* Ripple 애니메이션 - 배경 레이어 */
.theme-ripple {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  will-change: transform, opacity;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* Page enter animation (Landing 같은 부드러운 전환) */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: fade-up 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter {
    animation: none !important;
  }
}
</style>
