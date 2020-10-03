import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: Home,
    // },
    // {
    //   path: '/model/:id',
    //   name: 'model',
    //   props: true,
    //   component: Model,
    //   children: [
    //     {
    //       path: 'category/:cat',
    //       props: true,
    //       component: Model,
    //     },
    //   ],
    // },
    // {
    //   path: '/model/:id/category/:cat/product/:productId',
    //   name: 'product',
    //   props: true,
    //   component: Product,
    // },
    // {
    //   path: '/contacts',
    //   name: 'contacts',
    //   component: Contacts,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('changePage', false);
    //     next();
    //   },
    // },
    // {
    //   path: '/login',
    //   name: 'login',
    //   props: { page: 'login' },
    //   component: LoginPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('toFromLoginPage', true);
    //     next();
    //   },
    // },
    // {
    //   path: '/registration',
    //   name: 'registration',
    //   props: { page: 'reg' },
    //   component: LoginPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('toFromLoginPage', true);
    //     next();
    //   },
    // },
    // {
    //   path: '/cabinet',
    //   name: 'cabinet',
    //   component: CabinetPage,
    //   beforeEnter: (to, from, next) => {
    //     if (store.getters.user === null || !localStorage.token) {
    //       next('/');
    //     } else {
    //       store.commit('changePage', false);
    //       next();
    //     }
    //   },
    // },
    // {
    //   path: '/cart',
    //   name: 'cart',
    //   component: CartPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('changePage', false);
    //     next();
    //   },
    // },
    // {
    //   path: '/order-registration',
    //   name: 'order-registration',
    //   component: OrderRegistrationPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('changePage', false);
    //     next();
    //   },
    // },
    // {
    //   path: '/admin-panel',
    //   name: 'admin',
    //   component: AdminPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('toFromLoginPage', true);
    //     next();
    //   },
    // },
    // {
    //   path: '/admin-panel/comments',
    //   name: 'admin-comments',
    //   component: AdminCommentsPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('toFromLoginPage', true);
    //     next();
    //   },
    // },
    // {
    //   path: '/admin-panel/orders',
    //   name: 'admin-orders',
    //   component: AdminOrdersPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('toFromLoginPage', true);
    //     next();
    //   },
    // },
    // {
    //   path: '/search-result',
    //   name: 'search',
    //   component: SearchPage,
    //   beforeEnter: (to, from, next) => {
    //     store.commit('changePage', false);
    //     next();
    //   },
    // },
    //  404
    // {
    //   path: '/404',
    //   name: '404',
    //   component: NotFound
    // },
    // {
    //   path: '*',
    //   redirect: '/404',
    // },
  ],
});
