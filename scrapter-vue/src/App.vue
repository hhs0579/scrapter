<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #213547;
  --header-bg: #f9f9f9;
  --primary-color: #646cff;
  --secondary-bg: #f1f1f1;
  --border-color: #e0e0e0;
  --hover-bg: #e8e8e8;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --header-bg: #2d2d2d;
  --primary-color: #747bff;
  --secondary-bg: #2d2d2d;
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
</style>
