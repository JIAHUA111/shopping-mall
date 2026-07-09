import request from './index'

export function getAddressList() {
  return request.get('/addresses')
}

export function getAddressDetail(id) {
  return request.get(`/addresses/${id}`)
}

export function addAddress(data) {
  return request.post('/addresses', data)
}

export function updateAddress(id, data) {
  return request.put(`/addresses/${id}`, data)
}

export function deleteAddress(id) {
  return request.delete(`/addresses/${id}`)
}

export function setDefaultAddress(id) {
  return request.put(`/addresses/${id}/default`)
}
