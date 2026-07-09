import request from './index'

export function createOrder(data) {
  return request.post('/orders', data)
}

export function getOrderList(params) {
  return request.get('/orders', { params })
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`)
}

export function updateOrder(id, data) {
  return request.put(`/orders/${id}`, data)
}

export function deleteOrder(id) {
  return request.delete(`/orders/${id}`)
}

export function cancelOrder(id) {
  return request.delete(`/orders/${id}`)
}