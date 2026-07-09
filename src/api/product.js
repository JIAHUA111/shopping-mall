import request from './index'

export function getCategories() {
  return request.get('/categories')
}

export function getChildCategories(parentId) {
  return request.get(`/categories/${parentId}/children`)
}

export function getProducts(params) {
  return request.get('/products', { params })
}

export function getProductDetail(id) {
  return request.get(`/products/${id}`)
}

export function getProductReviews(id, params) {
  return request.get(`/products/${id}/reviews`, { params })
}

// 秒杀相关接口
export function getFlashSales() {
  return request.get('/flashsales')
}

export function getFlashSaleDetail(id) {
  return request.get(`/flashsales/${id}`)
}

export function flashSaleBuy(id) {
  return request.post(`/flashsales/${id}/buy`)
}