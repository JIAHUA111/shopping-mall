import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getUserInfo, updatePassword, updateUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearUser() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  async function login(credentials) {
    const res = await loginApi(credentials)
    if (res.code === 200) {
      setToken(res.data.token)
      userInfo.value = res.data.user
    }
    return res
  }

  async function register(data) {
    const res = await registerApi(data)
    return res
  }

  async function fetchUserInfo() {
    if (!token.value) return
    const res = await getUserInfo()
    if (res.code === 200) {
      userInfo.value = res.data
    }
    return res
  }

  async function changePassword(data) {
    const res = await updatePassword(data)
    return res
  }

  async function updateProfile(data) {
    const res = await updateUserInfo(data)
    if (res.code === 200) {
      if (res.data) {
        userInfo.value = res.data
      } else {
        await fetchUserInfo()
      }
    }
    return res
  }

  function logout() {
    clearUser()
  }

  return {
    token, userInfo, isLoggedIn,
    login, register, fetchUserInfo, changePassword, updateProfile, logout, clearUser, setToken
  }
})