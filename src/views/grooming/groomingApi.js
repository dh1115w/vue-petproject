import axios from '@/plugins/axios.js';

// 還剩 StaffDashboard.vue 用的幾個 function 是 mock，其他都已經改成真正打後端 API
// （getAllServices、getGroomers、getReviews、getAvailableTimeSlots、createAppointment、getAppointments、
//   cancelAppointment、createGroomingPayment、captureGroomingPayment、validateCoupon）

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

export const updateAppointmentStatus = (id, status) => {
  console.log('[mock] updateAppointmentStatus 被呼叫，id：', id, '新狀態：', status);
  return Promise.resolve({ data: { success: true } });
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

export const getAdminOrders = () => {
  console.log('[mock] getAdminOrders 被呼叫');
  return Promise.resolve({
    data: mockAppointments.map(a => ({
      id: a.id,
      petName: a.petName,
      serviceName: a.serviceName,
      status: a.status,
      userId: 'user_' + a.id
    }))
  });
};

export const updateAdminOrder = (id, status) => {
  console.log('[mock] updateAdminOrder 被呼叫，id：', id, '新狀態：', status);
  return Promise.resolve({ data: { success: true } });
};

export const getBlacklist = () => {
  console.log('[mock] getBlacklist 被呼叫');
  return Promise.resolve({ data: [] });
};

export const addToBlacklist = (data) => {
  console.log('[mock] addToBlacklist 被呼叫，內容：', data);
  return Promise.resolve({ data: { success: true } });
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

export const getUnreviewedAppointments = () => {
  console.log('[mock] getUnreviewedAppointments 被呼叫');

  return Promise.resolve({
    data: [
      {
        id: 101,
        date: '2026-06-20',
        serviceName: '基礎洗護',
        groomer: 'Andy'
      },
      {
        id: 102,
        date: '2026-06-19',
        serviceName: '全套美容造型',
        groomer: 'Emily'
      }
    ]
  });
};

export const submitGroomingReview = (data) => {
  console.log('[mock] submitGroomingReview 被呼叫，內容：');
  // 相容兩種呼叫方式：Reviews.vue 傳 FormData，Appointments.vue 傳一般物件
  if (data instanceof FormData) {
    for (const pair of data.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
  } else {
    console.log(data);
  }
  return Promise.resolve({ data: { success: true } });
};
// import axios from '@/api/axios'; // 確保此路徑指向您的 axios 實例
// import useUserStore from '@/stores/user.js';

// /**
//  * 設定 Axios 請求攔截器
//  * 在發送請求前，自動從 Pinia Store 取得 Token 並放入 Authorization Header
//  */
// axios.interceptors.request.use(
//   (config) => {
//     const userStore = useUserStore();
//     if (userStore.token) {
//       config.headers.Authorization = `Bearer ${userStore.token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /**
//  * 設定 Axios 響應攔截器
//  * 統一處理 Token 過期或權限不足 (401) 的情況
//  */
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // 如果收到 401，通常代表 Token 已失效，可以導向登入頁
//       window.location.href = '/member/login';
//     }
//     return Promise.reject(error);
//   }
// );

// /**
//  * 【首頁與通用資訊】
//  */
// /**
//  * 取得首頁展示的熱門服務
//  */
// export const getFeaturedServices = () => {
//   return axios.get('/api/featured-services');
// };

// /**
//  * 取得當前進行中的優惠活動
//  */
// export const getActivePromotion = () => {
//   return axios.get('/api/active-promotion');
// };

// getAllServices、getGroomers 已經在上面改成真正打後端 API 了，這裡不用留參考版本

// /**
//  * 【毛孩與會員管理】
//  */
// export const getPets = (params) => {
//   return axios.get('/api/pets', { params });
// };

// export const addPet = (data) => {
//   return axios.post('/api/pets', data);
// };

// export const updatePet = (id, data) => {
//   return axios.patch(`/api/pets/${id}`, data);
// };

// export const deletePet = (id) => {
//   return axios.delete(`/api/pets/${id}`);
// };

// export const updateMemberInfo = (data) => {
//   return axios.patch('/api/member/profile', data);
// };

// /**
//  * 驗證優惠碼
//  */
// export const validateCoupon = (code) => {
//   return axios.post('/api/coupons/validate', { code });
// };

// /**
//  * 發送通知 (Line Notify)
//  */
// export const sendNotification = (data) => {
//   return axios.post('/api/notifications/line', data);
// };

// getAvailableTimeSlots、createAppointment、getAppointments、cancelAppointment
// 都已經在上面改成真正打後端 API 了，這裡不用留參考版本

// /**
//  * 更新預約狀態 (用於模擬美容進度切換)
//  */
// export const updateAppointmentStatus = (id, status) => {
//   return axios.patch(`/api/appointments/${id}/status`, { status });
// };

// /**
//  * 【評價系統】
//  */
// getReviews 已經在上面改成真正打後端 API 了，這裡不用留參考版本

// /**
//  * 取得會員目前可進行評價的已完成預約
//  */
// export const getUnreviewedAppointments = () => {
//   return axios.get('/api/unreviewed-appointments');
// };

// /**
//  * 提交新的評論 (包含圖片)
//  */
// export const submitGroomingReview = (formData) => {
//   return axios.post('/api/reviews', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   });
// };

// /**
//  * 【管理後台專用】
//  */
// /**
//  * 取得後台數據概覽 (今日預約數、待處理訂單、評分)
//  */
// export const getAdminStats = () => {
//   return axios.get('/api/admin/stats');
// };

// /**
//  * 取得管理端排班資料
//  */
// export const getAdminSchedule = (params) => {
//   return axios.get('/api/admin/schedule', { params });
// };

// /**
//  * 更新特定排班時段狀態 (開放/關閉)
//  */
// export const updateAdminSlot = (id, data) => {
//   return axios.patch(`/api/admin/schedule/${id}`, data);
// };

// /**
//  * 取得所有預約訂單 (管理端)
//  */
// export const getAdminOrders = (params) => {
//   return axios.get('/api/admin/orders', { params });
// };

// /**
//  * 更新訂單狀態 (開始、完成、取消)
//  */
// export const updateAdminOrder = (id, status) => {
//   return axios.patch(`/api/admin/orders/${id}`, { status });
// };

// /**
//  * 取得黑名單列表
//  */
// export const getBlacklist = () => {
//   return axios.get('/api/admin/blacklist');
// };

// /**
//  * 加入黑名單
//  */
// export const addToBlacklist = (data) => {
//   return axios.post('/api/admin/blacklist', data);
// };

// /**
//  * 匯出今日預約清單
//  */
// export const exportTodayAppointments = () => {
//   return axios.get('/api/admin/export-today', { responseType: 'blob' });
// };