import axios from '@/plugins/axios.js';
import adminAxios from '@/plugins/grooming/adminAxios.js';

// 還剩 StaffDashboard.vue 排班表格的時段邏輯由前端自行處理，其他（含統計數字/訂單/黑名單）都已改成真正打後端 API
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
// params 可帶 { type: 'dog' | 'cat' } 做服務頁的貓狗分頁過濾；不帶就回全部。
export const getAllServices = (params) => {
  return axios.get('/api/services', { params });
};

// 已串接真正後端 API：GET /api/available-slots
// params 要帶 { groomer_id, date, pricing_id }，後端會依排班、已有預約、服務時長算出空檔
export const getAvailableTimeSlots = (params) => {
  return axios.get('/api/available-slots', { params });
};

// 已串接真正後端 API：GET /api/groomer-availability
// params 要帶 { date, pricing_id }，一次回傳「某天、某服務定價下」全部在職美容師的可預約狀態
// 每筆回 { groomerId, available, slotCount }，預約頁用來在美容師下拉選單標示「尚有時段/已額滿」
export const getGroomerAvailability = (params) => {
  return axios.get('/api/groomer-availability', { params });
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

// 已串接真正後端 API：GET /api/secure/grooming/line/authorize-url（要登入會員才能用）
// 回傳 { url: 'https://access.line.me/...' }，前端拿到後自己 window.location 跳過去授權
export const getLineBindUrl = () => {
  return axios.get('/api/secure/grooming/line/authorize-url');
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
  // 已串接真正後端 API：GET /api/admin/stats（後台首頁數據概覽）回傳 { todayAppts, pendingOrders, avgRating }
  return adminAxios.get('/api/admin/stats');
};

// 已串接真正後端 API：GET /api/admin/shift-templates（班別模板：早班/晚班…，含起訖時間）
export const getShiftTemplates = () => {
  return adminAxios.get('/api/admin/shift-templates');
};

// 已串接真正後端 API：GET /api/admin/schedules（查某段日期、全部美容師的排班）
// params 帶 { startDate, endDate }（可選 groomer_id）；每筆回 { id, groomerId, groomerName, scheduleDate, shiftId, shiftName, startTime, endTime, status }
export const getAdminSchedules = (params) => {
  return adminAxios.get('/api/admin/schedules', { params });
};

// 已串接真正後端 API：POST /api/admin/schedules（新增或更新某美容師某天的排班，upsert）
// data 帶 { groomerId, shiftId, scheduleDate, status }
export const upsertSchedule = (data) => {
  return adminAxios.post('/api/admin/schedules', data);
};

// 已串接真正後端 API：DELETE /api/admin/schedules（刪除某美容師某天的排班，月表格改成「休假」時用）
// params 帶 { groomer_id, date }；那天若已有預約後端會擋（回 400）
export const deleteSchedule = (params) => {
  return adminAxios.delete('/api/admin/schedules', { params });
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

// 已串接真正後端 API：GET /api/services/featured（首頁「熱門服務項目」用）
// 後端只回「後台勾選為熱門、且上架中」的服務（含 priceMap/durationMap），
// 這裡取前 3 筆，整理成首頁要的 { id, title, price, duration, desc } 格式。
//  - price：用 minPrice（卡片顯示「NT$ 600 起」）
//  - duration：取小型(small)的時長，沒有的話退而取第一個有的體型時長
//  - desc：對應後端新加的 description 欄位
export const getFeaturedServices = () => {
  return axios.get('/api/services/featured').then(res => {
    const featured = res.data.slice(0, 3).map(s => {
      // durationMap 例如 { small: 60, mid: 75, big: 90 }；優先拿 small，沒有就拿第一個值
      const durationMap = s.durationMap || {};
      const duration = durationMap.small != null
        ? durationMap.small
        : Object.values(durationMap)[0];
      return {
        id: s.id,
        title: s.title,
        price: s.minPrice,
        duration: duration,
        desc: s.description
      };
    });
    // 包成跟原本一樣的 { data } 結構，groomingIndex.vue 才不用改
    return { data: featured };
  });
};

// 已串接真正後端 API：GET /api/coupons/active（首頁促銷橫幅用）
// 回傳目前生效中、最快到期的那張優惠券，後端已換算成橫幅要的格式：
//   { isActive, tag, title, description, promoCode, discountText, endDate }
// 沒有進行中的優惠時 isActive 會是 false，首頁就把橫幅藏起來。
export const getActivePromotion = () => {
  return axios.get('/api/coupons/active');
};

// 已串接真正後端 API：GET /api/reviews
// 註：Reviews.vue 自己有用 sortedReviews 在前端依 groomerName 篩選跟排序，
// 所以這裡單純把資料整批抓回來即可，不用真的把 params 傳給後端。
export const getReviews = () => {
  return axios.get('/api/reviews');
};

// 已串接真正後端 API：POST /api/secure/reviews（要登入會員才能用）
// 改用 multipart：data 傳 FormData，內含 appointmentId / overallRating / serviceRating /
// envRating / priceRating / comment / isAnonymous，外加可選的 image 照片檔。
// 傳 FormData 時 axios 會自動帶上 multipart/form-data 標頭，這裡不用手動設。
// 後端會檢查：這筆預約是不是你自己的、狀態是不是「已完成」、是不是已經評價過、照片是否合格
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

// ===== StaffDashboard.vue 服務管理分頁用（管理員）=====
// 查全部服務（含已下架，新的在前）：GET /api/admin/services
export const getAdminServices = () => {
  return adminAxios.get('/api/admin/services');
};

// 服務分類下拉用（只回啟用中的分類）：GET /api/admin/services/categories
export const getServiceCategories = () => {
  return adminAxios.get('/api/admin/services/categories');
};

// 新增服務：POST /api/admin/services
// data 要帶 { categoryId, name, description, applicableSpecies, imageUrl, note, isActive,
//            pricings: [{ size, price, duration }] }
export const createService = (data) => {
  return adminAxios.post('/api/admin/services', data);
};

// 編輯服務：PUT /api/admin/services/{id}
export const updateService = (id, data) => {
  return adminAxios.put(`/api/admin/services/${id}`, data);
};

// 上傳服務圖片：POST /api/admin/services/image
// file 是使用者選的圖片檔，用 FormData 裝成欄位名 file 送上去（後端用 @RequestParam("file") 接）
// 後端會回 { url: "/api/services/images/xxx.jpg" }，前端把這個 url 填進表單的 imageUrl
export const uploadServiceImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return adminAxios.post('/api/admin/services/image', formData);
};

// ===== StaffDashboard.vue 美容師管理分頁用（管理員）=====
// 查全部美容師（含已離職，新的在前）：GET /api/admin/groomers
export const getAdminGroomers = () => {
  return adminAxios.get('/api/admin/groomers');
};

// 專長類別勾選用（只回啟用中的）：GET /api/admin/groomers/specialties
export const getSpecialtyCategories = () => {
  return adminAxios.get('/api/admin/groomers/specialties');
};

// 新增美容師：POST /api/admin/groomers
// data 要帶 { name, phone, email, gender, birth, hireDate, photoUrl, bio,
//            experience, isActive, specialtyIds: [..] }
export const createGroomer = (data) => {
  return adminAxios.post('/api/admin/groomers', data);
};

// 編輯美容師：PUT /api/admin/groomers/{id}
export const updateGroomer = (id, data) => {
  return adminAxios.put(`/api/admin/groomers/${id}`, data);
};

// 上傳美容師頭貼：POST /api/admin/groomers/photo
// file 是使用者選的圖片檔，用 FormData 裝成欄位名 file 送上去（後端用 @RequestParam("file") 接）
// 後端會回 { url: "/api/groomers/photos/xxx.jpg" }，前端把這個 url 填進表單的 photoUrl
export const uploadGroomerPhoto = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return adminAxios.post('/api/admin/groomers/photo', formData);
};

// ===== StaffDashboard.vue 評價管理分頁用（管理員）=====
// 查全部評價（含待審核/顯示/隱藏，新的在前）：GET /api/admin/reviews
// status 有給（0待審核 1顯示 2隱藏）就只看該狀態，沒給就看全部
export const getAdminReviews = (status) => {
  // status 是 null/undefined 時不帶 params，後端就回全部
  const params = (status === null || status === undefined) ? {} : { status };
  return adminAxios.get('/api/admin/reviews', { params });
};

// 審核評價：POST /api/admin/reviews/{id}/status
// status 只能是 1（顯示）或 2（隱藏）
export const moderateReview = (id, status) => {
  return adminAxios.post(`/api/admin/reviews/${id}/status`, { status });
};

// 店家回覆：POST /api/admin/reviews/{id}/reply
// 一筆評價最多一筆回覆，後端會自動判斷新增或覆蓋
export const replyToReview = (id, content) => {
  return adminAxios.post(`/api/admin/reviews/${id}/reply`, { content });
};

// 永久刪除評價：DELETE /api/admin/reviews/{id}
// 跟「隱藏」不同，這會把評價連同照片、店家回覆從資料庫整個刪掉，刪了拉不回來
export const deleteReview = (id) => {
  return adminAxios.delete(`/api/admin/reviews/${id}`);
};
