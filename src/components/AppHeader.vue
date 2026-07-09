<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">🛒 商城销售平台</router-link>
      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/products">商品</router-link>
        <router-link to="/flashsale" class="flash-sale-link">🔥 秒杀</router-link>
        <router-link v-if="userStore.isLoggedIn" to="/cart">购物车</router-link>
        <router-link v-if="userStore.isLoggedIn" to="/orders">订单</router-link>
        <router-link v-if="userStore.isLoggedIn" to="/coupons">优惠券</router-link>
        <template v-if="userStore.isLoggedIn">
          <router-link to="/profile">{{ userStore.userInfo?.username || '个人中心' }}</router-link>
          <a href="#" @click.prevent="handleLogout">退出</a>
        </template>
        <template v-else>
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background: #1a1a2e;
  color: #fff;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}
.nav-links a {
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: #fff;
}
.flash-sale-link {
  color: #fbbf24 !important;
  font-weight: 600;
  animation: flash 1s ease-in-out infinite;
}
@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>