import { createRouter, createWebHashHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    name: 'home',
    component: () => import('@pages/Home'),
  }, {
    path: '/room/:key',
    component: () => import('@pages/Room'),
    children: [{
      path: '',
      name: 'room',
      component: () => import('@pages/Room/Config'),
    }, {
      path: 'table',
      name: 'table',
      component: () => import('@pages/Room/Table'),
    }],
  }],
});
