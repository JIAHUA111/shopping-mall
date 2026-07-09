<template>
  <div class="product-card" @click="$router.push(`/products/${product.id}`)">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" loading="lazy" />
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="product-bottom">
        <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
        <span class="product-stock" :class="{ low: product.stock < 10 }">
          库存: {{ product.stock }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: { type: Object, required: true }
})
</script>

<style scoped>
.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f9fafb;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-info {
  padding: 12px 14px;
}
.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-desc {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ef4444;
}
.product-stock {
  font-size: 12px;
  color: #6b7280;
}
.product-stock.low {
  color: #ef4444;
}
</style>