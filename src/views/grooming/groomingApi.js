// ⚠️【合併前要還原】組員原寫法路徑 @/api/axios 在本專案不存在，先註解掉
// import axios from '@/api/axios'; // 確保此路徑指向您的 axios 實例
import axios from '@/plugins/axios.js'; // 暫時改成本專案實際的 axios 路徑，讓程式跑得動
import useUserStore from '@/stores/user.js';

/**
 * 設定 Axios 請求攔截器
 * 在發送請求前，自動從 Pinia Store 取得 Token 並放入 Authorization Header
 */
axios.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 設定 Axios 響應攔截器
 * 統一處理 Token 過期或權限不足 (401) 的情況
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 如果收到 401，通常代表 Token 已失效，可以導向登入頁
      window.location.href = '/member/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 【首頁與通用資訊】
 */
/**
 * 取得首頁展示的熱門服務
 */
export const getFeaturedServices = () => {
  return axios.get('/api/featured-services');
};

/**
 * 取得當前進行中的優惠活動
 */
export const getActivePromotion = () => {
  return axios.get('/api/active-promotion');
};

/**
 * 取得所有美容服務項目與詳細價格表
 */
export const getAllServices = (params) => {
  return axios.get('/api/services', { params });
};

/**
 * 取得所有美容師團隊成員資訊
 */
export const getGroomers = () => {
  return axios.get('/api/groomers');
};

/**
 * 【毛孩與會員管理】
 */
export const getPets = (params) => {
  return axios.get('/api/pets', { params });
};

export const addPet = (data) => {
  return axios.post('/api/pets', data);
};

export const updatePet = (id, data) => {
  return axios.patch(`/api/pets/${id}`, data);
};

export const deletePet = (id) => {
  return axios.delete(`/api/pets/${id}`);
};

export const updateMemberInfo = (data) => {
  return axios.patch('/api/member/profile', data);
};

/**
 * 驗證優惠碼
 */
export const validateCoupon = (code) => {
  return axios.post('/api/coupons/validate', { code });
};

/**
 * 發送通知 (Line Notify)
 */
export const sendNotification = (data) => {
  return axios.post('/api/notifications/line', data);
};

/**
 * 【預約流程】
 */
/**
 * 取得特定日期與美容師的可用預約時段
 */
export const getAvailableTimeSlots = (params) => {
  return axios.get('/api/available-slots', { params });
};

/**
 * 提交新的美容預約
 */
export const createAppointment = (appointmentData) => {
  return axios.post('/api/appointments', appointmentData);
};

/**
 * 【預約紀錄管理】
 */
/**
 * 取得會員的美容預約紀錄 (支援篩選狀態)
 */
export const getAppointments = (params) => {
  return axios.get('/api/appointments', { params });
};

/**
 * 取消特定的美容預約
 */
export const cancelAppointment = (appointmentId) => {
  return axios.post(`/api/appointments/${appointmentId}/cancel`);
};

/**
 * 更新預約狀態 (用於模擬美容進度切換)
 */
export const updateAppointmentStatus = (id, status) => {
  return axios.patch(`/api/appointments/${id}/status`, { status });
};

/**
 * 【評價系統】
 */
/**
 * 取得評論列表 (支援篩選美容師與排序)
 */
export const getReviews = (params) => {
  return axios.get('/api/reviews', { params });
};

/**
 * 取得會員目前可進行評價的已完成預約
 */
export const getUnreviewedAppointments = () => {
  return axios.get('/api/unreviewed-appointments');
};

/**
 * 提交新的評論 (包含圖片)
 */
export const submitGroomingReview = (formData) => {
  return axios.post('/api/reviews', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * 【管理後台專用】
 */
/**
 * 取得後台數據概覽 (今日預約數、待處理訂單、評分)
 */
export const getAdminStats = () => {
  return axios.get('/api/admin/stats');
};

/**
 * 取得管理端排班資料
 */
export const getAdminSchedule = (params) => {
  return axios.get('/api/admin/schedule', { params });
};

/**
 * 更新特定排班時段狀態 (開放/關閉)
 */
export const updateAdminSlot = (id, data) => {
  return axios.patch(`/api/admin/schedule/${id}`, data);
};

/**
 * 取得所有預約訂單 (管理端)
 */
export const getAdminOrders = (params) => {
  return axios.get('/api/admin/orders', { params });
};

/**
 * 更新訂單狀態 (開始、完成、取消)
 */
export const updateAdminOrder = (id, status) => {
  return axios.patch(`/api/admin/orders/${id}`, { status });
};

/**
 * 取得黑名單列表
 */
export const getBlacklist = () => {
  return axios.get('/api/admin/blacklist');
};

/**
 * 加入黑名單
 */
export const addToBlacklist = (data) => {
  return axios.post('/api/admin/blacklist', data);
};

/**
 * 匯出今日預約清單
 */
export const exportTodayAppointments = () => {
  return axios.get('/api/admin/export-today', { responseType: 'blob' });
};