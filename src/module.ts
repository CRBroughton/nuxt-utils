import { fileURLToPath } from 'node:url'
import { defineNuxtModule, createResolver, addComponentsDir, addPlugin, installModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-utils',
  },
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    await installModule('@vueuse/nuxt')

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'plugins'))
    })
    addPlugin({
      src: resolve(runtimeDir, 'plugins/focus'),
      mode: 'all',
    })
    addPlugin({
      src: resolve(runtimeDir, 'plugins/copy'),
      mode: 'all',
    })

    addComponentsDir({
      path: resolve('runtime/components'),
    })
  },
})
