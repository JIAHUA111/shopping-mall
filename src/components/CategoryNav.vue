<template>
  <div class="category-nav">
    <div
      v-for="cat in topCategories"
      :key="cat.id"
      class="category-item"
      @mouseenter="activeCat = cat"
      @mouseleave="activeCat = null"
    >
      <router-link :to="`/products?categoryId=${cat.id}`" class="category-link">{{ cat.name }}</router-link>
      <div v-if="activeCat?.id === cat.id && childrenMap[cat.id]?.length" class="sub-menu">
        <router-link
          v-for="sub in childrenMap[cat.id]"
          :key="sub.id"
          :to="`/products?categoryId=${sub.id}`"
          class="sub-link"
        >{{ sub.name }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories } from '@/api/product'

const categories = ref([])
const activeCat = ref(null)

const topCategories = computed(() => categories.value.filter(c => c.parentId === 0))
const childrenMap = computed(() => {
  const map = {}
  for (const cat of categories.value) {
    if (cat.parentId === 0) continue
    if (!map[cat.parentId]) map[cat.parentId] = []
    map[cat.parentId].push(cat)
  }
  return map
})

onMounted(async () => {
  const res = await getCategories()
  if (res.code === 200) {
    categories.value = res.data
  }
})
</script>

<style scoped>
.category-nav {
  display: flex;
  gap: 0;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}
.category-item {
  position: relative;
}
.category-link {
  display: block;
  padding: 12px 20px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}
.category-link:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}
.sub-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 0 0 8px 8px;
  min-width: 140px;
  z-index: 100;
}
.sub-link {
  display: block;
  padding: 10px 20px;
  color: #374151;
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
}
.sub-link:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}
</style>