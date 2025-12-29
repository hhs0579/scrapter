import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<'light' | 'dark' | 'auto'>('light')

  const isDarkMode = computed(() => {
    if (themeMode.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return themeMode.value === 'dark'
  })

  function toggleTheme() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
    updateDocumentClass()
  }

  function setThemeMode(mode: 'light' | 'dark' | 'auto') {
    themeMode.value = mode
    updateDocumentClass()
  }

  function updateDocumentClass() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 초기화
  updateDocumentClass()

  return {
    themeMode,
    isDarkMode,
    toggleTheme,
    setThemeMode
  }
})

