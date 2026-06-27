import axios from '@/plugins/axios.js';
import adminAxios from '@/plugins/grooming/adminAxios.js';

// 還剩 StaffDashboard.vue 的「排班表格、統計數字」幾個 function 是 mock，其他都已經改成真正打後端 API
// （getAllServices、getGroomers、getReviews、getAvailableTimeSlots、createAppointment、getAppointments、
//   cancelAppointment、createGroomingPayment、captureGroomingPayment、validateCoupon、
//   getAdminOrders、updateAdminOrder、submitGroomingReview、getBlacklist、addToBlacklist、removeFromBlacklist）

// ===== 共用假資料 =====
const mockAppointments = [
  { id: 1001, petName: '巧克力', serviceName: '基礎洗護', price: 600, date: '2026-06-22 10:00', groomer: 'Andy', status: 0, isReviewed: false },
  { id: 1002, petName: 'Mimi', serviceName: '全套美容造型', price: 1200, date: '2026-06-15 14:00', groomer: 'Emily', status: 1, isReviewed: false },
  { id: 1003, petName: '豆豆', serviceName: '藥浴護理', price: 900, date: '2026-06-10 11:00', groomer: 'Jason', status: 1, isReviewed: true }
];

// ===== Booking.vue、Services.vue 用 =====
// 已串接真正後端 API：GET /api/services
// 註：後端目前還沒有 features（服務特色文字）、allowedGroomers（指定美容師）這兩個欄位，
// 回傳資料裡不會有這兩個值，畫面上對應的地方會先顯示空白/全部美容師，之後後端補上再串。
export const getAllServices = () => {
  return axios.get('/api/services');
};

// 已串接真正後端 API：GET /api/available-slots
// params 要帶 { groomer_id, date, pricing_id }，後端會依排班、已有預約、服務時長算出空檔
export const getAvailableTimeSlots = (params) => {
  return axios.get('/api/available-slots', { params });
};

// 已串接真正後端 API：POST /api/secure/appointments（要登入會員才能用）
// data 要帶 { petId, groomerId, pricingId, appointmentDate, startTime, note }
export const createAppointment = (data) => {
  return axios.post('/api/secure/appointments', data);
};

// 已串接真正後端 API：POST /api/secure/payments/create（要登入會員才能用）
// data 要帶 { appointmentId, amount, couponCode }，amount 是這次要付的金額（例如訂金 30%），
// couponCode 有套用優惠碼才要帶，沒套用就是 null（後端會用這個扣掉優惠券的使用次數）
// 回傳 { id, paypalOrderId, status }，paypalOrderId 是 PayPal 按鈕要用的訂單 id
export const createGroomingPayment = (data) => {
  return axios.post('/api/secure/payments/create', data);
};

// 已串接真正後端 API：POST /api/secure/payments/{paypalOrderId}/capture
// 使用者在 PayPal 視窗按確認後呼叫，真正請款
export const captureGroomingPayment = (paypalOrderId) => {
  return axios.post(`/api/secure/payments/${paypalOrderId}/capture`);
};

// 已串接真正後端 API：GET /api/coupons/validate
// amount 是目前訂單金額（折扣前），後端要用這個檢查最低消費門檻
export const validateCoupon = (code, amount) => {
  return axios.get('/api/coupons/validate', { params: { code, amount } });
};

// ===== Appointments.vue 用 =====
// 已串接真正後端 API：GET /api/secure/appointments（要登入會員才能用，只會看到自己的）
export const getAppointments = (params) => {
  return axios.get('/api/secure/appointments', { params });
};

// 已串接真正後端 API：POST /api/secure/appointments/{id}/cancel
export const cancelAppointment = (id) => {
  return axios.post(`/api/secure/appointments/${id}/cancel`);
};

// ===== Staff.vue 用 =====
// 已串接真正後端 API：GET /api/groomers
// 註：後端目前還沒有 rating（評分，要等 Review 表）、isOnDuty（今日有沒有上班，要等 GroomerSchedule 表），
// 這兩個欄位後端會先回傳 null，畫面上對應的地方會先顯示空白/休假狀態，之後後端補上再串。
export const getGroomers = () => {
  return axios.get('/api/groomers');
};

// ===== StaffDashboard.vue 用 =====
export const getAdminStats = () => {
  console.log('[mock] getAdminStats 被呼叫');
  return Promise.resolve({ data: { todayAppts: 8, pendingOrders: 3, avgRating: '4.8' } });
};

export const getAdminSchedule = () => {
  console.log('[mock] getAdminSchedule 被呼叫');
  return Promise.resolve({ data: mockAppointments });
};

// 已串接真正後端 API：GET /api/admin/appointments（要登入管理員才能用，看全部會員的預約）
// 註：後端回傳的資料沒有 userId 這個欄位，「加入黑名單」按鈕還是要等後續處理
export const getAdminOrders = () => {
  return adminAxios.get('/api/admin/appointments');
};

// 已串接真正後端 API：POST /api/admin/appointments/{id}/status
// newStatus 是數字 0~5（待確認/已確認/進行中/已完成/已取消/未到店），改成取消(4)時可以多帶 cancelReason
export const updateAdminOrder = (id, newStatus, cancelReason = null) => {
  return adminAxios.post(`/api/admin/appointments/${id}/status`, { status: newStatus, cancelReason });
};

// 已串接真正後端 API：GET /api/admin/blacklist（要登入管理員才能用，只回封鎖中的）
// 回傳每筆 { id, userId, userName, userPhone, categoryName, reason, startDate, endDate }
export const getBlacklist = () => {
  return adminAxios.get('/api/admin/blacklist');
};

// 已串接真正後端 API：POST /api/admin/blacklist
// data 要帶 { memberId, reason }（categoryId 不傳，後端會自己挑預設分類）
export const addToBlacklist = (data) => {
  return adminAxios.post('/api/admin/blacklist', data);
};

// 已串接真正後端 API：POST /api/admin/blacklist/{id}/remove（解除封鎖，把狀態改成已解除）
export const removeFromBlacklist = (id) => {
  return adminAxios.post(`/api/admin/blacklist/${id}/remove`);
};

export const exportTodayAppointments = () => {
  console.log('[mock] exportTodayAppointments 被呼叫');
  const csvContent = '預約編號,毛孩,服務,美容師,時間\n' +
    mockAppointments.map(a => `${a.id},${a.petName},${a.serviceName},${a.groomer},${a.date}`).join('\n');
  return Promise.resolve({ data: csvContent });
};

export const getFeaturedServices = () => {
  console.log('[mock] getFeaturedServices 被呼叫');

  return Promise.resolve({
    data: [
      {
        id: 1,
        title: '基礎洗護',
        price: 600,
        duration: 60,
        desc: '洗澡、吹整、清耳、剪指甲，日常清潔保養首選。'
      },
      {
        id: 2,
        title: '全套美容造型',
        price: 1200,
        duration: 120,
        desc: '包含剪毛造型、SPA護膚、香氛護理，給毛孩煥然一新的外型。'
      },
      {
        id: 3,
        title: '藥浴護理',
        price: 900,
        duration: 90,
        desc: '針對皮膚敏感或有皮膚問題的毛孩，提供專業藥浴療程。'
      }
    ]
  });
};

export const getActivePromotion = () => {
  console.log('[mock] getActivePromotion 被呼叫');

  // 將結束時間設定為「現在起 3 天後」，方便測試倒數計時功能
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);

  return Promise.resolve({
    data: {
      isActive: true,
      endDate: endDate.toISOString(),
      title: '夏日洗護優惠活動',
      description: '即日起至優惠期間，全店美容服務輸入代碼',
      tag: '限時優惠',
      promoCode: 'PET80'
    }
  });
};

// 已串接真正後端 API：GET /api/reviews
// 註：Reviews.vue 自己有用 sortedReviews 在前端依 groomerName 篩選跟排序，
// 所以這裡單純把資料整批抓回來即可，不用真的把 params 傳給後端。
export const getReviews = () => {
  return axios.get('/api/reviews');
};

// 已串接真正後端 API：POST /api/secure/reviews（要登入會員才能用）
// data 要帶 { appointmentId, overallRating, serviceRating, envRating, priceRating, comment, isAnonymous }
// 後端會檢查：這筆預約是不是你自己的、狀態是不是「已完成」、是不是已經評價過
export const submitGroomingReview = (data) => {
  return axios.post('/api/secure/reviews', data);
};

// ===== StaffDashboard.vue 優惠券管理分頁用（管理員）=====
// 已串接真正後端 API：GET /api/admin/coupons（查全部優惠券，新的在前）
export const getCoupons = () => {
  return adminAxios.get('/api/admin/coupons');
};

// 已串接真正後端 API：POST /api/admin/coupons（新增一張優惠券）
// data 要帶 { code, name, description, discountType, discountValue, minOrderAmount,
//            maxDiscount, totalQty, startDate, endDate, isActive }
export const createCoupon = (data) => {
  return adminAxios.post('/api/admin/coupons', data);
};

// 已串接真正後端 API：PUT /api/admin/coupons/{id}（編輯既有優惠券）
export const updateCoupon = (id, data) => {
  return adminAxios.put(`/api/admin/coupons/${id}`, data);
};
