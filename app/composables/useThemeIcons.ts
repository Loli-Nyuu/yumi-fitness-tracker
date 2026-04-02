import { getIcons, type ThemeIcons } from '../utils/theme-icons'

const currentTheme = ref('yumi')
const icons = computed(() => getIcons(currentTheme.value))

export function useThemeIcons() {
  // Sync with layout's theme
  if (import.meta.client) {
    window.addEventListener('theme-change', ((e: CustomEvent) => {
      currentTheme.value = e.detail.theme
    }) as EventListener)
  }

  return {
    icons,
    theme: currentTheme,
    setTheme: (t: string) => { currentTheme.value = t },
  }
}
