import request from './index'

// 收藏相关
export function getFavoriteList() {
  return request.get('/favorites')
}

export function checkFavorite(productId) {
  return request.get(`/favorites/check/${productId}`)
}

export function addFavorite(productId) {
  return request.post(`/favorites/${productId}`)
}

export function removeFavorite(productId) {
  return request.delete(`/favorites/${productId}`)
}

// 浏览记录相关
export function getBrowseHistory() {
  return request.get('/browse-history')
}

export function addBrowseHistory(productId) {
  return request.post(`/browse-history/${productId}`)
}

export function clearBrowseHistory() {
  return request.delete('/browse-history')
}

export function removeBrowseHistory(id) {
  return request.delete(`/browse-history/${id}`)
}

// 意见反馈相关
export function getFeedbackList() {
  return request.get('/feedbacks')
}

export function submitFeedback(data) {
  return request.post('/feedbacks', data)
}
