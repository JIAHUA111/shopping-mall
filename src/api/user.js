import request from './index'

export function login(data) {
  return request.post('/user/login', data)
}

export function register(data) {
  return request.post('/user/register', data)
}

export function getUserInfo() {
  return request.get('/user/info')
}

export function updatePassword(data) {
  return request.put('/user/password', data)
}

export function updateUserInfo(data) {
  return request.put('/user/info', data)
}

// 积分相关接口
export function sign() {
  return request.post('/user/sign')
}

export function getUserPoints() {
  return request.get('/user/points')
}

export function getPointsHistory() {
  return request.get('/user/points/history')
}

export function deductPoints(amount, orderId) {
  return request.post('/user/points/deduct', { amount, orderId })
}

// 优惠券相关接口
export function getUserCoupons() {
  return request.get('/coupons')
}

export function claimCoupon(couponId) {
  return request.post(`/coupons/${couponId}/claim`)
}

export function useCoupon(couponId, orderId) {
  return request.post(`/usercoupons/${couponId}/use`, { orderId })
}

export function getAvailableCoupons() {
  return request.get('/coupons/available')
}