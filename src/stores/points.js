import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { sign, getUserPoints, getPointsHistory, deductPoints } from '@/api/user';
export const usePointsStore = defineStore('points', () => {
 const points = ref(0);
 const level = ref('normal');
 const levelInfo = ref(null);
 const signStreak = ref(0);
 const lastSignAt = ref(null);
 const history = ref([]);
 const signMsg = ref('');
 const signMsgType = ref('');
 const levelConfig = {
 normal: { minPoints: 0, maxPoints: 1000, discount: 1, name: '普通会员', icon: '⭐' },
 silver: { minPoints: 1000, maxPoints: 5000, discount: 0.98, name: '白银会员', icon: '🥈' },
 gold: { minPoints: 5000, maxPoints: 10000, discount: 0.95, name: '黄金会员', icon: '🥇' },
 diamond: { minPoints: 10000, maxPoints: Infinity, discount: 0.9, name: '钻石会员', icon: '💎' }
 };
 const discount = computed(() => levelInfo.value?.discount || 1);
 const nextLevelInfo = computed(() => {
 const levels = ['normal', 'silver', 'gold', 'diamond'];
 const currentIndex = levels.indexOf(level.value);
 if (currentIndex >= levels.length - 1)
 return null;
 const nextLevel = levels[currentIndex + 1];
 const config = levelConfig[nextLevel];
 const pointsNeeded = config.minPoints - points.value;
 return {
 ...config,
 pointsNeeded,
 progress: Math.min(100, Math.round((points.value - levelConfig[level.value].minPoints) / pointsNeeded * 100))
 };
 });
 async function fetchPointsInfo() {
 try {
 const res = await getUserPoints();
 if (res.code === 200) {
 points.value = res.data.points;
 level.value = res.data.level;
 levelInfo.value = res.data.levelInfo;
 signStreak.value = res.data.signStreak;
 lastSignAt.value = res.data.lastSignAt;
 }
 }
 catch (e) {
 console.error('获取积分信息失败:', e);
 }
 }
 async function fetchHistory() {
 try {
 const res = await getPointsHistory();
 if (res.code === 200) {
 history.value = res.data;
 }
 }
 catch (e) {
 console.error('获取积分历史失败:', e);
 }
 }
 async function handleSign() {
 signMsg.value = '';
 try {
 const res = await sign();
 if (res.code === 200) {
 signMsg.value = res.message;
 signMsgType.value = 'success';
 points.value = res.data.points;
 signStreak.value = res.data.streak;
 level.value = res.data.level;
 levelInfo.value = res.data.levelInfo;
 lastSignAt.value = new Date().toISOString();
 setTimeout(() => { signMsg.value = ''; }, 3000);
 }
 else {
 signMsg.value = res.message;
 signMsgType.value = 'error';
 setTimeout(() => { signMsg.value = ''; }, 3000);
 }
 }
 catch (e) {
 signMsg.value = e.message || '签到失败';
 signMsgType.value = 'error';
 setTimeout(() => { signMsg.value = ''; }, 3000);
 }
 }
 async function handleDeduct(amount, orderId) {
 try {
 const res = await deductPoints(amount, orderId);
 if (res.code === 200) {
 points.value = res.data.remainingPoints;
 return true;
 }
 return false;
 }
 catch (e) {
 return false;
 }
 }
 return {
 points,
 level,
 levelInfo,
 signStreak,
 lastSignAt,
 history,
 signMsg,
 signMsgType,
 discount,
 nextLevelInfo,
 levelConfig,
 fetchPointsInfo,
 fetchHistory,
 handleSign,
 handleDeduct
 };
});