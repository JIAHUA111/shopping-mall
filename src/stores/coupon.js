import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserCoupons, claimCoupon, useCoupon } from '@/api/user';

export const useCouponStore = defineStore('coupon', () => {
  const coupons = ref([]);
  const availableCoupons = ref([]);
  const selectedCoupon = ref(null);
  const claimMsg = ref('');
  const claimMsgType = ref('');

  // 获取可用优惠券（未使用且未过期）
  const validCoupons = computed(() => {
    return coupons.value.filter(c => {
      if (!c.coupon) return false;
      if (c.status !== 'unused') return false;
      return new Date(c.coupon.expireAt) > new Date();
    });
  });

  // 根据金额筛选可用优惠券
  const getAvailableCoupons = computed(() => (amount) => {
    return validCoupons.value.filter(c => {
      return c.coupon.minAmount <= amount;
    });
  });

  async function fetchCoupons() {
    try {
      const res = await getUserCoupons();
      if (res.code === 200) {
        coupons.value = res.data;
      }
    } catch (e) {
      console.error('获取优惠券失败:', e);
    }
  }

  async function handleClaim(couponId) {
    claimMsg.value = '';
    try {
      const res = await claimCoupon(couponId);
      if (res.code === 200) {
        claimMsg.value = res.message;
        claimMsgType.value = 'success';
        await fetchCoupons();
        setTimeout(() => { claimMsg.value = ''; }, 3000);
      } else {
        claimMsg.value = res.message;
        claimMsgType.value = 'error';
        setTimeout(() => { claimMsg.value = ''; }, 3000);
      }
    } catch (e) {
      claimMsg.value = e.message || '领取失败';
      claimMsgType.value = 'error';
      setTimeout(() => { claimMsg.value = ''; }, 3000);
    }
  }

  async function handleUse(couponId, orderId) {
    try {
      const res = await useCoupon(couponId, orderId);
      if (res.code === 200) {
        const idx = coupons.value.findIndex(c => c.id === couponId);
        if (idx !== -1) {
          coupons.value[idx].status = 'used';
        }
        selectedCoupon.value = null;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function selectCoupon(coupon) {
    selectedCoupon.value = coupon;
  }

  function clearSelected() {
    selectedCoupon.value = null;
  }

  return {
    coupons,
    selectedCoupon,
    claimMsg,
    claimMsgType,
    validCoupons,
    getAvailableCoupons,
    fetchCoupons,
    handleClaim,
    handleUse,
    selectCoupon,
    clearSelected
  };
});