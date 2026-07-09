import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：自动添加 JWT Token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 401) {
      localStorage.removeItem('token')
      const userStore = useUserStore()
      userStore.clearUser()
      window.location.hash = '/login'
      return Promise.reject(new Error(res.message || '未登录'))
    }
    return res
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }
    if (!error.response) {
      return Promise.reject(new Error('网络错误，请检查网络连接'))
    }
    return Promise.reject(error)
  }
)

export default request