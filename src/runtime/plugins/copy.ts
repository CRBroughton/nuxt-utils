export default defineNuxtPlugin((nuxtApp) => {
  /**
   * v-copy directive
   *
   * Copies text to clipboard when the element is clicked
   *
   * @example
   * <div v-copy="'Text to copy'">Click to copy this text</div>
   * <div v-copy>Click to copy the content of this element</div>
   *
   * @param {string} [value] - Optional text to copy. If not provided, element's textContent will be used
   */
  nuxtApp.vueApp.directive('copy', {
    mounted(el, binding) {
      el.copy = async () => {
        try {
          const text = binding.value || el.textContent
          await navigator.clipboard.writeText(text)
        }
        catch (error) {
          console.error('Failed to copy: ', error)
        }
      }
      el.addEventListener('click', el.copy)
      el.style.cursor = 'pointer'
    },
    unmounted(el) {
      el.removeEventListener('click', el.copy)
    },
  })
})
