import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import TooltipBtn from './components/Tools/TooltipBtn'

Vue.config.productionTip = false
Vue.component('TooltipBtn', TooltipBtn)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
