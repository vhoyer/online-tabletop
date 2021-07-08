import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    name: 'home',
    component: () => import('@pages/Home'),
  }, {
    path: '/room',
    name: 'room',
    component: () => import('@pages/Room'),
  }],
});
