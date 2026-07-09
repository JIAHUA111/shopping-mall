import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', guest: true }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('@/views/ProductList.vue'),
    meta: { title: '商品列表' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('@/views/OrderList.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/orders/:id/payment',
    name: 'Payment',
    component: () => import('@/views/Payment.vue'),
    meta: { title: '订单支付', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/flashsale',
    name: 'FlashSale',
    component: () => import('@/views/FlashSale.vue'),
    meta: { title: '限时秒杀' }
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/views/Coupons.vue'),
    meta: { title: '我的优惠券', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/Address.vue'),
    meta: { title: '收货地址', requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    path: '/browse-history',
    name: 'BrowseHistory',
    component: () => import('@/views/BrowseHistory.vue'),
    meta: { title: '浏览足迹', requiresAuth: true }
  },
  {
    path: '/customer-service',
    name: 'CustomerService',
    component: () => import('@/views/CustomerService.vue'),
    meta: { title: '客服中心', requiresAuth: true }
  },
  {
    path: '/help-center',
    name: 'HelpCenter',
    component: () => import('@/views/HelpCenter.vue'),
    meta: { title: '帮助中心', requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/views/Feedback.vue'),
    meta: { title: '意见反馈', requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于我们' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：鉴权
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 商城销售平台` : '商城销售平台'

  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && token) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router