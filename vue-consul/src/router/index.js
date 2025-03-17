import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },
  {
    path: '/nodes',
    component: Layout,
    redirect: '/nodes/jobs',
    name: 'Resources',
    meta: { title: 'Resources', icon: 'el-icon-shopping-bag-2' },
    children: [
      {
        path: 'ecs',
        name: 'ECS',
        component: () => import('@/views/node-exporter/index'),
        meta: { title: 'ECS', icon: 'el-icon-cpu' },
        children: [
          {
            path: 'self',
            name: 'ECS List',
            component: () => import('@/views/node-exporter/self'),
            meta: { title: 'ECS List', icon: 'el-icon-s-platform' }
          },
          {
            path: 'pconfig',
            name: 'node-pconfig',
            component: () => import('@/views/node-exporter/pconfig'),
            meta: { title: 'Prometheus Conf', icon: 'el-icon-set-up' }
          },
          {
            path: 'rules',
            name: 'node-rules',
            component: () => import('@/views/node-exporter/rules'),
            meta: { title: 'Node Rules', icon: 'el-icon-bell' }
          },
          {
            path: 'grafana',
            name: 'node-grafana',
            component: () => import('@/views/node-exporter/grafana'),
            meta: { title: 'Grafana Setup', icon: 'el-icon-data-line' }
          }
        ]
      },
    ]
  },
  {
    path: '/avd',
    component: Layout,
    children: [{
      path: 'index',
      name: 'Alert',
      component: () => import('@/views/avd/index'),
      meta: { title: 'Alert', icon: 'el-icon-chat-line-square' }
    }]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
