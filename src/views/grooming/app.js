const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); // 允許跨域請求
app.use(express.json()); // 解析 JSON body

// ==========================================
// 全域設定：店休日與國定假日
// ==========================================
const fixedWeeklyOffDay = 1; // 0:週日, 1:週一, 2:週二... 以此類推
const shopHolidays = ['2024-06-20', '2024-12-25', '2024-01-01']; // YYYY-MM-DD 格式


// ==========================================
// 模擬資料庫 (原本在 grooming.js)
// ==========================================
const todayDateStr = new Date().toLocaleDateString('sv-SE'); // 取得今日 YYYY-MM-DD

let appointments = [
  { id: 1001, member_id: 1, petName: '巧克力', serviceName: '基礎洗澡', price: 500, date: `${todayDateStr} 10:00`, groomer: 'Andy', groomer_id: 1, status: 3, isReviewed: false },
  { id: 1002, member_id: 1, petName: 'Mimi', serviceName: '貓咪舒壓洗護', price: 800, date: `${todayDateStr} 13:00`, groomer: 'Emily', groomer_id: 2, status: 0, isReviewed: false }
];

let pets = [
  { id: 1, name: '巧克力', breed: '貴賓', age: 3, type: 'dog', size: 'S', species: '狗', gender: 'male', weight: 4.5, neutered: 'isNeutered', health: '良好', personality: '活潑' },
  { id: 2, name: 'Mimi', breed: '波斯貓', age: 2, type: 'cat', size: 'S', species: '貓', gender: 'female', weight: 3.2, neutered: 'isNeutered', health: '良好', personality: '害羞' }
];

let reviews = [
  {
    id: 1,
    appointmentId: 1001,
    userName: '豆豆媽',
    groomerName: 'Emily',
    rating: 5,
    comment: 'Emily 真的很專業，我們家貓咪平常很怕生，但這次竟然乖乖洗完！',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    date: '2024-05-15'
  }
];

let blacklist = [
  { userId: 'U999', reason: '多次預約未到' }
];

// ==========================================
// 美容預約相關 API 路由
// ==========================================

// 0. 取得完整服務清單 (用於 Services.vue)
app.get('/api/services', (req, res) => {
  const { type } = req.query; // 取得查詢參數 type (dog 或 cat)
  const allServices = [
    {
      id: 1,
      title: '基礎洗澡 (Basic Bath)',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=300&fit=crop',
      minPrice: 500,
      duration: 60,
      features: ['溫和低敏洗毛精兩道清洗', '基礎修剪 (腳底毛、腹毛、肛門毛)', '清耳道、剪指甲、修腳圓', '擠肛門腺、專業吹整毛髮'],
      allowedGroomers: [1, 2, 3, 4],
      allowedSpecies: ['dog', 'cat'],
      priceMap: { S: 500, M: 700, L: 900 },
      durationMap: { S: 60, M: 90, L: 120 }
    },
    {
      id: 2,
      title: '精緻造型剪毛 (Full Grooming)',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&fit=crop',
      minPrice: 1200,
      duration: 120,
      features: ['包含所有「基礎洗澡」內容', '職人手剪全身造型、打薄修飾', '客製化造型溝通 (如圓頭、貴賓裝)', '蓬鬆毛髮結構處理'],
      allowedGroomers: [1, 2],
      allowedSpecies: ['dog'],
      priceMap: { S: 1200, M: 1800, L: 2500 },
      durationMap: { S: 120, M: 180, L: 240 }
    },
    {
      id: 3,
      title: '草本舒緩藥浴 (Medicated Bath)',
      image: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=500&h=300&fit=crop',
      minPrice: 800,
      duration: 90,
      features: ['針對皮膚過敏、止癢、異味處理', '天然植物萃取藥劑，不傷毛質', '恆溫微氣泡抗菌處理', '舒緩紅腫、改善皮膚防禦力'],
      allowedGroomers: [3, 4],
      allowedSpecies: ['dog'],
      priceMap: { S: 800, M: 1100, L: 1500 },
      durationMap: { S: 90, M: 120, L: 150 }
    },
    {
      id: 4,
      title: '深層芳療泥浴 (Mud Spa)',
      image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&h=300&fit=crop',
      minPrice: 1000,
      duration: 90,
      features: ['死海礦物泥深層吸附皮脂髒污', '改善乾澀、除臭效果持久', '舒壓按摩與熱敷', '讓毛髮重現光澤與彈性'],
      allowedGroomers: [4],
      allowedSpecies: ['dog'],
      priceMap: { S: 1000, M: 1400, L: 1800 },
      durationMap: { S: 90, M: 120, L: 150 }
    },
    {
      id: 5,
      title: '貓咪舒壓洗護 (Cat Relaxation Wash)',
      image: 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=500&h=300&fit=crop',
      minPrice: 800,
      duration: 90,
      features: ['專屬貓房獨立洗護，減少環境壓力', '低噪音低風速吹乾設備', '專業深層去油洗劑', '包含修剪指甲、清耳、剪腳底毛'],
      allowedGroomers: [2, 4],
      allowedSpecies: ['cat'],
      priceMap: { S: 800, M: 1200 },
      durationMap: { S: 90, M: 120 }
    },
    {
      id: 6,
      title: '貓咪廢毛梳理 (Cat De-shedding)',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=300&fit=crop',
      minPrice: 600,
      duration: 60,
      features: ['深層去除底層廢毛，減少毛球症', '專業不鏽鋼排梳技巧，不傷皮膚', '增進皮膚血液循環與油脂平衡', '毛髮滑順、防止居家毛髮紛飛'],
      allowedGroomers: [2, 4],
      allowedSpecies: ['cat'],
      priceMap: { S: 600, M: 1000 },
      durationMap: { S: 60, M: 90 }
    }
  ];

  // 執行過濾邏輯
  let result = allServices;
  if (type) {
    result = allServices.filter(s => s.allowedSpecies.includes(type));
  }

  res.json(result);
});

// 1. 取得熱門服務
app.get('/api/featured-services', (req, res) => {
  const featured = [
    { id: 1, title: '基礎洗澡', price: 500, duration: 60, desc: '包含剪指甲、清耳朵、擠肛門腺、溫和洗毛精清潔。' },
    { id: 2, title: '精緻造型剪毛', price: 1200, duration: 120, desc: '職人手剪、客製化造型溝通、全身毛髮蓬鬆打理。' },
    { id: 3, title: '草本舒緩藥浴', price: 800, duration: 90, desc: '針對敏感肌毛孩，使用天然草本配方，改善皮膚問題。' }
  ];
  res.json(featured);
});

// 2. 取得優惠活動
app.get('/api/active-promotion', (req, res) => {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  res.json({
    isActive: true,
    tag: 'LIMITED OFFER',
    title: '夏日清爽大作戰！新客首享 8 折',
    description: '即日起至本月底，首次預約「全套美容服務」，結帳輸入專屬代碼即享 8 折優惠。',
    promoCode: 'PET80',
    endDate: endDate.toISOString()
  });
});

// 3. 取得預約紀錄
app.get('/api/appointments', (req, res) => {
  const { status } = req.query;
  let result = appointments.filter(apt => apt.member_id === 1); // 模擬目前登入者
  if (status !== undefined && status !== 'all') {
    result = result.filter(apt => apt.status === parseInt(status));
  }
  res.json(result);
});

// 4. 取消預約
app.post('/api/appointments/:id/cancel', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(apt => apt.id === id);
  if (appointment) {
    appointment.status = 2;
    res.json({ success: true, message: '預約已成功取消' });
  } else {
    res.status(404).json({ success: false, message: '找不到該筆預約' });
  }
});

// 5. 評價相關
app.get('/api/reviews', (req, res) => {
  const { groomer, sort } = req.query;
  let result = [...reviews];
  if (groomer && groomer !== 'all') result = result.filter(r => r.groomerName === groomer);
  if (sort === 'highest') result.sort((a, b) => b.rating - a.rating);
  else result.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(result);
});

app.get('/api/unreviewed-appointments', (req, res) => {
  const unreviewed = appointments.filter(apt => apt.status === 1 && !apt.isReviewed);
  res.json(unreviewed);
});

app.post('/api/reviews', (req, res) => {
  const { appointmentId, rating, comment, groomerName } = req.body;
  const newReview = {
    id: Date.now(),
    appointmentId: parseInt(appointmentId),
    userName: '模擬會員',
    groomerName,
    rating: parseInt(rating),
    comment,
    date: new Date().toISOString().split('T')[0],
    image: null
  };
  reviews.unshift(newReview);
  const apt = appointments.find(a => a.id === newReview.appointmentId);
  if (apt) apt.isReviewed = true;
  res.json({ success: true, data: newReview });
});

// 6. 預約流程相關
app.get('/api/available-slots', (req, res) => {
  const { date, groomer_id } = req.query;
  const targetDay = new Date(date).getDay();

  // 0. 檢查是否為「固定公休日」或「特定店休日/國定假日」
  if (targetDay === fixedWeeklyOffDay || shopHolidays.includes(date)) {
    return res.json([]); // 全天不開放預約
  }

  // 定義班別對應的時段
  const shiftTimeSlots = {
    'M': ['10:00', '13:00'],           // 早班
    'E': ['15:30', '18:00'],           // 晚班
    'F': ['10:00', '13:00', '15:30', '18:00'] // 全天
  };

  const now = new Date();
  const todayStr = now.toLocaleDateString('sv-SE'); // 取得 YYYY-MM-DD 格式

  // 1. 檢查是否為過去日期
  if (date < todayStr) {
    return res.json([]);
  }

  // 取得該美容師的班表設定 (此處應與下方 /api/groomers 資料同步)
  const groomer = getGroomersRawData().find(g => g.id === parseInt(groomer_id));
  if (!groomer || !groomer.weeklySchedule[targetDay]) {
    return res.json([]); // 沒排班
  }

  const currentShift = groomer.weeklySchedule[targetDay];
  const allowedTimes = shiftTimeSlots[currentShift] || [];

  const allPossibleSlots = [
    { value: '10:00', label: '10:00 - 12:00' },
    { value: '13:00', label: '13:00 - 15:00' },
    { value: '15:30', label: '15:30 - 17:30' },
    { value: '18:00', label: '18:00 - 20:00' }
  ].filter(slot => allowedTimes.includes(slot.value)); // 先根據班別過濾

  // 2. 如果日期是今天，過濾掉目前時間之前的時段
  let slots = allPossibleSlots;
  if (date === todayStr) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    slots = allPossibleSlots.filter(slot => {
      const [h, m] = slot.value.split(':').map(Number);
      return (h * 60 + m) > currentMinutes;
    });
  }

  // 3. 過濾已被預約的時段
  const bookedSlots = appointments
    .filter(apt => apt.date.startsWith(date) && apt.groomer_id === parseInt(groomer_id) && apt.status !== 2)
    .map(apt => apt.date.split(' ')[1]);
  const availableSlots = slots.filter(slot => !bookedSlots.includes(slot.value));
  res.json(availableSlots);
});

// 輔助函式：統一管理美容師原始資料與班表
function getGroomersRawData() {
  return [
    { id: 1, name: 'Andy', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop', specialty: '大型犬剪毛、造型設計', desc: '擁有10年資深美容經驗，擅長依據毛孩骨架設計最適合的職人造型。', experience: '曾榮獲全國寵物美容大賽優等獎，精通各類犬種標準賽級修剪。', rating: 4.8, 
      weeklySchedule: { 1: 'M', 2: 'M', 3: 'M', 4: 'M', 5: 'M' } }, // 週一至五早班
    { id: 2, name: 'Emily', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', specialty: '貓咪美容、草本藥浴', desc: '細心耐心的個性，專門處理高敏感貓咪，讓洗澡變成一種享受。', experience: '持有ISCC國際貓犬美容師認證，深耕貓咪行為學與草本皮毛調理。', rating: 5.0, 
      weeklySchedule: { 2: 'E', 3: 'E', 4: 'E', 5: 'E', 6: 'E' } }, // 週二至六晚班
    { id: 3, name: 'Jason', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', specialty: '專業手剪、皮毛護理', desc: '專注於細節的手剪技巧，細心觀察每隻毛孩的皮膚狀況給予建議。', experience: '擁有豐富的皮毛生理學知識，致力於推廣「低壓力」的健康美容流程。', rating: 4.7, 
      weeklySchedule: { 4: 'F', 5: 'F', 6: 'F', 0: 'F' } },        // 週四至日全天
    { id: 4, name: 'Sophie', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', specialty: '幼犬減壓美容', desc: '專門負責第一次美容的幼犬，用溫柔引導方式讓毛孩從此愛上美容。', experience: '擅長幼犬社交化美容，讓毛孩在幼年期建立對美容環境的信任與安全感。', rating: 4.9, 
      weeklySchedule: { 1: 'M', 3: 'E', 5: 'M', 0: 'E' } }         // 交錯班
  ];
}

// 7. 取得美容師清單 (用於 Staff.vue)
app.get('/api/groomers', (req, res) => {
  const currentDay = new Date().getDay(); // 0 (週日) 到 6 (週六)
  const groomersData = getGroomersRawData();
  const todayStr = new Date().toLocaleDateString('sv-SE'); // 取得 YYYY-MM-DD 格式
  const isShopHoliday = currentDay === fixedWeeklyOffDay || shopHolidays.includes(todayStr);

  const shiftLabels = { 'M': '早班', 'E': '晚班', 'F': '全天班' };

  // 根據今天星期幾動態計算 isOnDuty
  const staff = groomersData.map(groomer => {
    const { weeklySchedule, ...rest } = groomer;
    const currentShift = isShopHoliday ? null : weeklySchedule[currentDay];
    return {
      ...rest,
      isOnDuty: !isShopHoliday && !!currentShift,
      shiftName: isShopHoliday ? '店休' : (currentShift ? shiftLabels[currentShift] : '休假')
    };
  });

  res.json(staff);
});

/**
 * PATCH /api/appointments/:id/status
 * 模擬管理端：更新預約狀態 (例如：0->3, 3->1)
 */
app.patch('/api/appointments/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const appointment = appointments.find(apt => apt.id === id);
  if (appointment) {
    appointment.status = parseInt(status);
    res.json({ success: true, message: `預約狀態已更新為 ${status}`, data: appointment });
  } else {
    res.status(404).json({ success: false, message: '找不到該筆預約' });
  }
});

app.post('/api/appointments', (req, res) => {
  const newBooking = req.body;
  const appointment = {
    id: appointments.length + 1001,
    ...newBooking,
    petName: '新預約毛孩', 
    serviceName: '選定服務', 
    groomer: '選定美容師',
    isReviewed: false
  };
  appointments.push(appointment);
  res.json({ success: true, data: appointment });
});

/**
 * 優惠碼驗證 API
 */
app.post('/api/coupons/validate', (req, res) => {
  const { code } = req.body;
  const coupons = [
    { code: 'PET80', discount: 0.8, type: 'percent', label: '新客首享 8 折' },
    { code: 'SAVE100', discount: 100, type: 'fixed', label: '滿額折 100 元' }
  ];
  const coupon = coupons.find(c => c.code === code.toUpperCase());
  if (coupon) {
    res.json({ success: true, data: coupon });
  } else {
    res.status(400).json({ success: false, message: '無效的優惠碼' });
  }
});

/**
 * 通知 API
 */
app.post('/api/notifications/line', (req, res) => {
  console.log('模擬發送 Line 通知:', req.body);
  res.json({ success: true });
});

// ==========================================
// 管理後台 (Admin) API 路由
// ==========================================

// 取得概覽統計
app.get('/api/admin/stats', (req, res) => {
  const today = new Date().toLocaleDateString('sv-SE');
  
  // 1. 今日預約：統計日期為今天且狀態不為「已取消(2)」的數量
  const todayAppts = appointments.filter(a => 
    a.date.startsWith(today) && a.status !== 2
  ).length;

  // 2. 待處理訂單：統計所有狀態為「已收到(0)」的數量
  const pendingOrders = appointments.filter(a => a.status === 0).length;

  // 3. 平均服務評分：從 reviews 陣列動態計算
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  res.json({ 
    todayAppts, 
    pendingOrders, 
    avgRating 
  });
});

// 取得管理端所有排班/預約清單
app.get('/api/admin/schedule', (req, res) => {
  // 這裡回傳所有 appointments 做為排班參考
  res.json(appointments);
});

// 取得管理端訂單
app.get('/api/admin/orders', (req, res) => {
  res.json(appointments); // 在模擬環境中，預約紀錄即為訂單
});

// 更新訂單狀態 (管理端)
app.patch('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const apt = appointments.find(a => a.id === id);
  if (apt) {
    // 轉換中文狀態碼回數字 (假設：待處理=0, 完成=1, 取消=2, 進行中=3)
    const statusMap = { '待處理': 0, '已完成': 1, '已取消': 2, '進行中': 3 };
    apt.status = statusMap[status] !== undefined ? statusMap[status] : status;
    res.json({ success: true, data: apt });
  } else {
    res.status(404).send('Order not found');
  }
});

// 黑名單 API
app.get('/api/admin/blacklist', (req, res) => {
  res.json(blacklist);
});

app.post('/api/admin/blacklist', (req, res) => {
  const { userId, reason } = req.body;
  blacklist.push({ userId, reason });
  res.json({ success: true });
});

// 匯出今日預約清單 (CSV 格式)
app.get('/api/admin/export-today', (req, res) => {
  const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
  const todayAppts = appointments.filter(a => a.date.startsWith(today));
  
  const statusLabels = { 0: '待處理', 1: '已完成', 2: '已取消', 3: '進行中' };
  
  // 加上 \uFEFF (BOM) 確保 Excel 開啟時不會亂碼
  let csv = '\uFEFF預約編號,毛孩姓名,服務項目,價格,預約時間,美容師,狀態\n';
  todayAppts.forEach(a => {
    csv += `${a.id},${a.petName},${a.serviceName},${a.price},${a.date},${a.groomer},${statusLabels[a.status]}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=grooming-today-${today}.csv`);
  res.send(csv);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));

module.exports = app;