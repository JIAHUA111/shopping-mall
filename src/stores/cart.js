import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCartList, addToCart, updateCartItem, deleteCartItem } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const cartCount = ref(0)

  async function fetchCart() {
    loading.value = true
    try {
      const res = await getCartList()
      if (res.code === 200) {
        items.value = res.data
        cartCount.value = res.data.reduce((sum, item) => sum + item.quantity, 0)
      }
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId, quantity = 1) {
    const res = await addToCart({ productId, quantity })
    if (res.code === 200) {
      await fetchCart()
    }
    return res
  }

  async function updateItem(id, quantity) {
    const res = await updateCartItem(id, { quantity })
    if (res.code === 200) {
      await fetchCart()
    }
    return res
  }

  async function removeItem(id) {
    const res = await deleteCartItem(id)
    if (res.code === 200) {
      await fetchCart()
    }
    return res
  }

  return { items, loading, cartCount, fetchCart, addItem, updateItem, removeItem }
})