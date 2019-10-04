import Vue from 'vue'
import iView from 'iview'
import Router from 'vue-router'
import VueRx from 'vue-rx'
import App from '@/App.vue'
import i18n from '@/language/index.ts'
import store from '@/store/index.ts'
import router from '@/router/index.ts'
import 'iview/dist/styles/iview.css'
import htmlRem from '@/core/utils/rem.ts'
import {isWindows} from "@/config/index.ts"
import {resetFontSize} from '@/core/utils/electron.ts'
import VeeValidate from 'vee-validate'
import locale from 'iview/dist/locale/en-US'

Vue.use(iView, {locale})
Vue.use(require('vue-moment'))
Vue.use(Router)
Vue.use(VueRx)
Vue.use(VeeValidate, {})
htmlRem()

if (isWindows) {
    resetFontSize()
}

Vue.config.productionTip = false

export default new Vue({
    el: '#app',
    router,
    store,
    i18n,
    render: h => h(App)
})
