import Vue from 'vue'
import Router from 'vue-router'
import Temp from '@/components/Temp'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Temp',
      component: Temp
    }
  ]
})
