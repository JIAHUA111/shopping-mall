import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createOrder, getOrderList, getOrderDetail, updateOrder, deleteOrder } from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)

  async function fetchOrders(status = '') {
    loading.value = true
    try {
      const params = status ? { status } : {}
      const res = await getOrderList(params)
      if (res.code === 200) {
        orders.value = res.data
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetail(id) {
    const res = await getOrderDetail(id)
    if (res.code === 200) {
      currentOrder.value = res.data
    }
    return res
  }

  async function placeOrder(cartIds, couponId = null, pointsUsed = 0) {
    const res = await createOrder({ cartIds, couponId, pointsUsed })
    return res
  }

  async function modifyOrder(id, data) {
    const res = await updateOrder(id, data)
    if (res.code === 200) {
      await fetchOrders()
    }
    return res
  }

  async function cancelOrder(id) {
    const res = await deleteOrder(id)
    if (res.code === 200) {
      await fetchOrders()
    }
    return res
  }

  return { orders, currentOrder, loading, fetchOrders, fetchOrderDetail, placeOrder, modifyOrder, cancelOrder }
})