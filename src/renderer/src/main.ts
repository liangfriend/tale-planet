import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './base.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import vMask from './directives/vMask'
import i18n from '@renderer/i18n'

const app = createApp(App)

app.use(createPinia()).use(ElementPlus).use(router).use(i18n)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 自定义指令注册
app.directive('mask', vMask)
app.mount('#app')
