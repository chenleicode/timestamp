import { createApp } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import {
  ElConfigProvider,
  ElDatePicker,
  ElInput,
  ElOption,
  ElSelect,
} from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import './style.css'

dayjs.locale('zh-cn')

createApp(App)
  .use(ElConfigProvider)
  .use(ElDatePicker)
  .use(ElInput)
  .use(ElOption)
  .use(ElSelect)
  .mount('#app')
