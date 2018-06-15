import Vue from 'vue'
import Router from 'vue-router'
import Util from '../utils/util'
import Application from '@/views/Application'
import Environment from '@/views/Environment'
import NotFound from '@/views/NotFound'
import Test from '@/views/Test'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    // {
    //   path: '',
    //   name: 'authentication',
    //   component: Authentication
    // },
    {
      path: '/',
      name: 'application',
      component: Application,
      meta: {
        title: '应用列表'
      }
    },
    {
      path: '/test',
      name: 'test',
      component: Test,
      meta: {
        title: '测试'
      }
    },
    {
      path: '/:applicationId/environments',
      name: 'env',
      component: Environment,
      meta: {
        title: '环境列表'
      }
    },
    {
      path: '*',
      component: NotFound
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  Util.title(to.meta.title)

  next();
})

router.afterEach((to, from) => {

})

export default router
