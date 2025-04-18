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
            meta: { title: 'Alert Rules', icon: 'el-icon-bell' }
          },
          {
            path: 'grafana',
            name: 'node-grafana',
            component: () => import('@/views/node-exporter/grafana'),
            meta: { title: 'Grafana Setup', icon: 'el-icon-data-line' }
          }
        ]
      },
      {
        path: 'rds',
        name: 'RDS',
        component: () => import('@/views/rds/index'),
        meta: { title: 'MySQL', icon: 'el-icon-coin' },
        children: [
          {
            path: 'self',
            name: 'MySQL List',
            component: () => import('@/views/rds/self'),
            meta: { title: 'MySQL List', icon: 'el-icon-s-platform' }
          },
          {
            path: 'pconfig',
            name: 'rds-pconfig',
            component: () => import('@/views/rds/pconfig'),
            meta: { title: 'Prometheus Conf', icon: 'el-icon-set-up' }
          },
          {
            path: 'rules',
            name: 'rds-rules',
            component: () => import('@/views/rds/rules'),
            meta: { title: 'Alert Rules', icon: 'el-icon-bell' }
          },
          {
            path: 'grafana',
            name: 'rds-grafana',
            component: () => import('@/views/rds/grafana'),
            meta: { title: 'Grafana Setup', icon: 'el-icon-data-line' }
          }
        ]
      },      
    ]
  },
  {
    path: '/blackbox',
    component: Layout,
    redirect: '/blackbox/index',
    name: 'Site and API Monitoring',
    meta: { title: 'Site and API Monitoring', icon: 'tree' },
    children: [
      {
        path: 'index',
        name: 'Site Management',
        component: () => import('@/views/blackbox/index'),
        meta: { title: 'Site Management', icon: 'el-icon-s-order' }
      },
      {
        path: 'bconfig',
        name: 'Blackbox Config',
        component: () => import('@/views/blackbox/bconfig'),
        meta: { title: 'Blackbox Config', icon: 'el-icon-c-scale-to-original' }
      },
      {
        path: 'pconfig',
        name: 'Prometheus Config',
        component: () => import('@/views/blackbox/pconfig'),
        meta: { title: 'Prometheus Config', icon: 'el-icon-set-up' }
      },
      {
        path: 'rules',
        name: 'Alert Rules',
        component: () => import('@/views/blackbox/rules'),
        meta: { title: 'Alert Rules', icon: 'el-icon-bell' }
      },
      {
        path: 'grafana',
        name: 'Grafana Dashboard',
        component: () => import('@/views/blackbox/grafana'),
        meta: { title: 'Grafana Setup', icon: 'el-icon-data-line' }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: '/report/index',
    name: 'Customer Reporting',
    meta: { title: 'Customer Reporting', icon: 'el-icon-data-line'},
    children: [
      {
        path: 'index',
        name: 'Report Management',
        component: () => import('@/views/report/index'),
        meta: {title : 'Report Management', icon: 'el-icon-data-line'}
      },
      {
        path: 'self',
        name: 'Report Actions',
        component: () => import('@/views/report/self'),
        meta: {title : 'Report Actions', icon: 'el-icon-set-up'}
      },
    ]
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
