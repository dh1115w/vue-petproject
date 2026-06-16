<template>
  <div class="staff-dashboard">
    <h1>美容師後台管理系統</h1>

    <!-- 數據概覽區 -->
    <div class="stats-container">
      <div class="stat-card">
        <span class="stat-label">今日預約</span>
        <span class="stat-value">{{ schedule.filter(s => s.appointmentId).length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">待處理訂單</span>
        <span class="stat-value">{{ orders.filter(o => o.status === '待處理').length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">平均服務評分</span>
        <span class="stat-value" style="color: #f39c12;">★ {{ averageRating }}</span>
      </div>
    </div>

    <!-- 頁籤切換 -->
    <div class="tab-menu">
      <button :class="{ active: currentTab === 'schedule' }" @click="currentTab = 'schedule'">排班與預約關聯</button>
      <button :class="{ active: currentTab === 'calendar' }" @click="currentTab = 'calendar'">月曆視圖</button>
      <button :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">訂單管理</button>
      <button :class="{ active: currentTab === 'blacklist' }" @click="currentTab = 'blacklist'">黑名單管理</button>
    </div>

    <!-- 1. 排班管理 (與線上預約關聯) -->
    <div v-if="currentTab === 'schedule'" class="content-section">
      <h2>月排班管理</h2>
      <div class="tool-bar">
        <div class="filter-group">
          <label>選擇日期：</label>
          <input v-model="selectedDate" type="date" class="date-input" />
        </div>
        <!-- 新增快速操作區塊 -->
        <div class="filter-group">
          <label>快速操作：</label>
          <select v-model="quickActionStaff" class="filter-select">
            <option v-for="staff in staffList" :key="staff.name" :value="staff.name">
              {{ staff.name }}
            </option>
          </select>
          <button @click="setGroomerDayStatus(false)" class="btn-sm btn-blacklist">一鍵關閉全天</button>
          <button @click="setGroomerDayStatus(true)" class="btn-sm">一鍵開啟全天</button>
        </div>
      </div>
      <p>提示：切換日期可管理該日排班狀態。當預約 ID 有值時，代表該時段已被線上預約佔用。</p>
      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>時段</th>
            <th>美容師</th>
            <th>狀態</th>
            <th>預約詳情</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in filteredSchedule" :key="slot.id">
            <td>{{ slot.date }}</td>
            <td>{{ slot.time }}</td>
            <td>{{ slot.staffName }}</td>
            <td>
              <span :class="getSlotStatusClass(slot)">
                {{ getSlotStatusText(slot) }}
              </span>
            </td>
            <td>
              <div v-if="slot.appointmentId" class="appointment-detail">
                <span class="id-badge">#{{ slot.appointmentId }}</span>
                <span class="pet-info">{{ getOrderById(slot.appointmentId)?.petName }} - {{ getOrderById(slot.appointmentId)?.service }}</span>
              </div>
              <span v-else>—</span>
            </td>
            <td>
              <button @click="toggleSlot(slot)" class="btn-sm">
                {{ slot.isOpen ? '關閉時段' : '開放預約' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- 1.5 月曆視圖 -->
    <div v-if="currentTab === 'calendar'" class="content-section">
      <div class="calendar-container">
        <div class="calendar-header-nav">
          <button @click="changeMonth(-1)" class="nav-btn">
            <i class="fas fa-chevron-left"></i> 上個月
          </button>
          <h2 class="calendar-title">{{ monthTitle }}</h2>
          <button @click="changeMonth(1)" class="nav-btn">
            下個月 <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="calendar-board">
          <div v-for="dayName in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']" :key="dayName" class="calendar-weekday">
            {{ dayName }}
          </div>
          <div 
            v-for="(item, index) in calendarDays" 
            :key="index" 
            class="calendar-day"
            :class="{ 'other-month': !item.date, 'is-today': item.date === todayStr }"
            @dragover.prevent
            @drop="item.date && handleDrop($event, item.date)"
            @click="item.date && jumpToDate(item.date)"
          >
            <div class="day-header">
              <span class="day-num" v-if="item.day">{{ item.day }}</span>
            </div>
            <!-- 顯示當日預約數 -->
            <div v-if="item.count > 0" class="appointment-count-badge">
              {{ item.count }} 預約
            </div>
            <!-- 顯示美容師排班縮影 -->
            <div class="staff-status-list" v-if="item.date">
              <span v-for="staff in item.staffStatus" :key="staff.name" 
                    class="staff-status-dot" 
                    draggable="true"
                    @dragstart="handleDragStart($event, staff.name, item.date)"
                    :class="staff.status"
                    :title="staff.name + ': ' + staff.statusText"></span>
            </div>
          </div>
        </div>

        <div class="calendar-footer">
          <div class="legend-item"><span class="box today-box"></span> 今日</div>
          <div class="legend-item"><span class="box appointment-box"></span> 有預約項目</div>
          <div class="legend-item"><span class="dot-sample pending"></span> 可預約</div>
          <div class="legend-item"><span class="dot-sample closed"></span> 休假/關閉</div>
          <p class="calendar-hint">💡 點擊日期可跳轉至該日排班管理</p>
        </div>
      </div>
    </div>

    <!-- 2. 訂單/預約事項 -->
    <div v-if="currentTab === 'orders'" class="content-section">
      <h2>預約訂單處理</h2>
      
      <!-- 篩選與搜尋工具欄 -->
      <div class="tool-bar">
        <input v-model="searchQuery" type="text" placeholder="搜尋寵物名稱..." class="search-input" />
        <select v-model="statusFilter" class="filter-select">
          <option value="all">所有狀態</option>
          <option value="待處理">待處理</option>
          <option value="進行中">進行中</option>
          <option value="已完成">已完成</option>
          <option value="已取消">已取消</option>
        </select>
      </div>

      <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>訂單 ID</th>
            <th>寵物名稱</th>
            <th>服務項目</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.petName }}</td>
            <td>{{ order.service }}</td>
            <td>{{ order.status }}</td>
            <td>
              <button v-if="order.status === '待處理'" @click="updateOrderStatus(order.id, '進行中')" class="btn-primary">開始</button>
              <button v-if="order.status === '待處理'" @click="updateOrderStatus(order.id, '已取消')" class="btn-cancel">取消</button>
              <button v-if="order.status === '進行中'" @click="updateOrderStatus(order.id, '已完成')" class="btn-success">完成</button>
              <button class="btn-blacklist" @click="addToBlacklist(order.userId)">加入黑名單</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- 訂單列表分頁控制 -->
      <div class="pagination-container" v-if="totalOrdersPages > 1">
        <button :disabled="ordersPage === 1" @click="ordersPage--" class="btn-page">上一頁</button>
        <span class="page-info">第 {{ ordersPage }} 頁 / 共 {{ totalOrdersPages }} 頁</span>
        <button :disabled="ordersPage === totalOrdersPages" @click="ordersPage++" class="btn-page">下一頁</button>
      </div>
    </div>

    <!-- 3. 黑名單功能 -->
    <div v-if="currentTab === 'blacklist'" class="content-section">
      <h2>黑名單客戶</h2>
      <table class="admin-table">
        <thead>
          <tr>
            <th>客戶 ID</th>
            <th>違規原因</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in blacklist" :key="index">
            <td>{{ item.userId }}</td>
            <td>{{ item.reason }}</td>
            <td><button @click="removeBlacklist(index)">解除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import '@/css/grooming/StaffDashboard.css';

// 頁籤狀態
const currentTab = ref('schedule');

// 搜尋與篩選狀態
const searchQuery = ref('');
const statusFilter = ref('all');

// 排班日期選擇 (預設顯示今日)
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const todayStr = new Date().toISOString().split('T')[0];

// 月曆視圖邏輯
const viewDate = ref(new Date()); // 當前查看的月份

const monthTitle = computed(() => {
  return viewDate.value.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
});

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 第一天星期幾
  const totalDays = new Date(year, month + 1, 0).getDate(); // 當月總天數
  
  const days = [];
  // 填充前補白
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: null, count: 0 });
  }
  // 填充當月日期
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const daySlots = schedule.value.filter(s => s.date === dateStr);
    
    // 統計預約數
    const count = daySlots.filter(s => s.appointmentId).length;
    
    // 彙整美容師狀態摘要
    const staffStatus = staffList.map(staff => {
      const slots = daySlots.filter(s => s.staffName === staff.name);
      const hasAppointment = slots.some(s => s.appointmentId);
      const allClosed = slots.length > 0 && slots.every(s => !s.isOpen);
      
      let status = 'pending';
      let statusText = '可預約';
      if (hasAppointment) { status = 'booked'; statusText = '已有預約'; }
      else if (allClosed) { status = 'closed'; statusText = '全日關閉'; }
      
      return { name: staff.name, status, statusText };
    });

    days.push({ day: d, date: dateStr, count, staffStatus });
  }
  return days;
});

// 分頁相關狀態
const itemsPerPage = 5; // 每頁顯示 5 筆
const ordersPage = ref(1);

// 快速操作選中的美容師
const quickActionStaff = ref('Andy');

// 建議：這部分名單應與 Staff.vue 共用，未來可移至 @/stores/grooming.js
// 與 Staff.vue 同步的美容師名單
const staffList = [
  { name: 'Andy', title: '專業美容師' },
  { name: 'Emily', title: '專業美容師' },
  { name: 'Jason', title: '專業美容師' },
  { name: 'Sophie', title: '專業美容師' }
];

// 模擬排班資料 (關聯預約)
const schedule = ref([]);

// 初始化模擬整個月的排班資料
onMounted(() => {
  const today = new Date();
  const tempSchedule = [];
  let idCounter = 1;

  // 自動產生未來 30 天的資料
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    staffList.forEach(staff => {
      // 為每位美容師每天分配兩個時段
      const shifts = ['09:00 - 13:00', '14:00 - 18:00'];
      shifts.forEach(time => {
        tempSchedule.push({
          id: idCounter++,
          date: dateStr,
          time: time,
          staffName: staff.name,
          appointmentId: (i === 0 && staff.name === 'Andy' && time.startsWith('09')) ? 1001 : null,
          isOpen: true
        });
      });
    });
  }
  schedule.value = tempSchedule;
});

// 根據選擇日期篩選排班列表
const filteredSchedule = computed(() => {
  return schedule.value.filter(s => s.date === selectedDate.value);
});

// 模擬訂單資料
const orders = ref([
  { id: 1001, petName: '阿福', service: '全套美容', status: '進行中', userId: 'U001' },
  { id: 1002, petName: '豆豆', service: '基礎洗澡', status: '待處理', userId: 'U002' },
]);

// 模擬評價資料（實務上應從 API 取得）
const reviews = ref([
  { groomerName: 'Andy', rating: 5 },
  { groomerName: 'Andy', rating: 4 },
]);

// 計算目前美容師的平均星等
const averageRating = computed(() => {
  const myReviews = reviews.value.filter(r => r.groomerName === quickActionStaff.value);
  if (myReviews.length === 0) return '0.0';
  const sum = myReviews.reduce((acc, cur) => acc + cur.rating, 0);
  return (sum / myReviews.length).toFixed(1);
});

// 模擬黑名單
const blacklist = ref([
  { userId: 'U999', reason: '多次預約未到' }
]);

// 篩選後的訂單列表
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesSearch = order.petName.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

// 計算分頁後的訂單列表
const paginatedOrders = computed(() => {
  const start = (ordersPage.value - 1) * itemsPerPage;
  return filteredOrders.value.slice(start, start + itemsPerPage);
});

// 透過 ID 取得訂單詳細資訊，建立排班與訂單的關聯
const getOrderById = (id) => {
  return orders.value.find(o => o.id === id);
};

const totalOrdersPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage) || 1);

// 當搜尋或篩選條件改變時，自動回到第一頁
watch([searchQuery, statusFilter], () => {
  ordersPage.value = 1;
});

// 功能邏輯
const updateOrderStatus = (id, newStatus) => {
  if (newStatus === '已取消' && !confirm('確定要取消這筆預約嗎？這將會釋放排班時段供其他客戶預約。')) {
    return;
  }

  const order = orders.value.find(o => o.id === id);
  if (order) {
    order.status = newStatus;
    
    // 連動邏輯：當訂單狀態改為「已完成」時，尋找對應的排班時段並鎖定
    if (newStatus === '已完成') {
      const slot = schedule.value.find(s => s.appointmentId === id);
      if (slot) {
        slot.isOpen = false; // 確保時段已關閉，且不可再被切換
      }
    }

    // 連動邏輯：當訂單狀態改為「已取消」時，釋放對應的排班時段
    if (newStatus === '已取消') {
      const slot = schedule.value.find(s => s.appointmentId === id);
      if (slot) {
        slot.appointmentId = null; // 移除預約 ID 關聯，釋放時段
        slot.isOpen = true;        // 重新開放預約
      }
    }
  }
};

const toggleSlot = (slot) => {
  // 當準備將時段由「開啟」改為「關閉」時，檢查是否已有預約 ID
  if (slot.isOpen && slot.appointmentId) {
    alert(`無法關閉時段！\n此時段目前已被預約 (ID: #${slot.appointmentId})。若需調整排班，請先處理或取消該筆預約。`);
    return;
  }
  slot.isOpen = !slot.isOpen;
};

// 月曆導航
const changeMonth = (offset) => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + offset, 1);
};

const jumpToDate = (date) => {
  selectedDate.value = date;
  currentTab.value = 'schedule';
};

// 拖曳排班邏輯
const handleDragStart = (event, staffName, sourceDate) => {
  event.dataTransfer.effectAllowed = 'move';
  // 儲存被拖曳的美容師名稱與來源日期
  event.dataTransfer.setData('staffName', staffName);
  event.dataTransfer.setData('sourceDate', sourceDate);
};

const handleDrop = (event, targetDate) => {
  const staffName = event.dataTransfer.getData('staffName');
  const sourceDate = event.dataTransfer.getData('sourceDate');

  if (!staffName || !sourceDate || sourceDate === targetDate) return;

  // 衝突檢測：檢查該美容師在目標日期是否已經有排班
  const isAlreadyScheduled = schedule.value.some(s => s.date === targetDate && s.staffName === staffName);
  if (isAlreadyScheduled) {
    alert(`排班衝突：${staffName} 在 ${targetDate} 已經有排班紀錄，無法重複移動。`);
    return;
  }

  // 找出該美容師在來源日期的所有時段
  const movingSlots = schedule.value.filter(s => s.date === sourceDate && s.staffName === staffName);

  // 安全檢查：如果該美容師當天已經有被預約 (appointmentId)，則不允許直接拖曳改期
  if (movingSlots.some(s => s.appointmentId)) {
    alert(`無法移動：${staffName} 在 ${sourceDate} 已有客戶預約，請先處理預約訂單。`);
    return;
  }

  // 更新日期，觸發 computed 重新計算月曆
  movingSlots.forEach(s => {
    s.date = targetDate;
  });
};

// 一鍵開啟/關閉特定美容師整天排班
const setGroomerDayStatus = (isOpen) => {
  const daySlots = schedule.value.filter(s => 
    s.date === selectedDate.value && s.staffName === quickActionStaff.value
  );

  // 當執行一鍵「關閉」且當天存在任何預約時，給予確認提示
  if (!isOpen) {
    const hasAppointments = daySlots.some(s => s.appointmentId);
    if (hasAppointments) {
      const proceed = confirm('提醒：此美容師當天已有預約。執行關閉操作將僅套用於「尚未被預約」的空閒時段，已預約時段將維持現狀。是否繼續？');
      if (!proceed) return;
    }
  }

  // 僅過濾出沒有預約的時段進行狀態變更
  const affectedSlots = daySlots.filter(s => !s.appointmentId);

  if (affectedSlots.length === 0) {
    alert('操作完成：該美容師今日已無可變動的空閒時段。');
    return;
  }

  affectedSlots.forEach(s => s.isOpen = isOpen);
  alert(`已將 ${quickActionStaff.value} 於 ${selectedDate.value} 的所有可用時段設為 ${isOpen ? '開放' : '關閉'}`);
};

const getSlotStatusText = (slot) => {
  if (slot.appointmentId) {
    const order = getOrderById(slot.appointmentId);
    return order?.status === '已完成' ? '服務完成' : '已預約';
  }
  return slot.isOpen ? '可排班' : '維修/休息';
};

const getSlotStatusClass = (slot) => {
  if (slot.appointmentId) {
    const order = getOrderById(slot.appointmentId);
    // 若已完成則顯示成功顏色（假設 CSS 有 status-success），否則顯示預約色
    if (order?.status === '已完成') return 'status-badge status-success';
    return 'status-badge status-completed';
  }
  return slot.isOpen ? 'status-badge status-pending' : 'status-badge status-closed';
};

// 樣式類別補充 (假設在 CSS 中定義)
// status-closed { background-color: #999; color: white; }

const addToBlacklist = (userId) => {
  const reason = prompt('請輸入加入黑名單的原因：');
  if (reason) {
    blacklist.value.push({ userId, reason });
    alert(`用戶 ${userId} 已加入黑名單`);
  }
};

const removeBlacklist = (index) => {
  blacklist.value.splice(index, 1);
};
</script>

<style scoped>
/* 內嵌美化樣式，可視需求移至 StaffDashboard.css */
.calendar-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 24px;
  margin-top: 10px;
}

.calendar-header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.calendar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2a2522;
  letter-spacing: 1px;
}

.nav-btn {
  background: #f8f7f5;
  border: 1px solid #e8e8e6;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #888;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: #2a2522;
  color: #fff;
}

.calendar-board {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e8e8e6;
  border: 1px solid #e8e8e6;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekday {
  background: #fdfdfd;
  padding: 12px;
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: #b0b0aa;
  text-transform: uppercase;
}

.calendar-day {
  background: #fff;
  min-height: 125px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.calendar-day:hover:not(.other-month) {
  background: #fffcf5;
}

.calendar-day.other-month {
  background: #fcfcfc;
  cursor: default;
  opacity: 0.3;
}

.calendar-day.is-today {
  background: #fff9e6;
}
.calendar-day.is-today .day-num {
  background: #2a2522;
  color: #fff;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.day-num {
  font-weight: 600;
  color: #444;
}

.appointment-count-badge {
  margin-top: 5px;
  font-size: 0.7rem;
  color: #e67e22;
  font-weight: bold;
}

.staff-status-list {
  margin-top: auto;
  display: flex;
  gap: 4px;
  padding-top: 8px;
}

.staff-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #eee;
  cursor: grab;
}

.staff-status-dot.pending { background: #2ecc71; } /* 綠色: 可預約 */
.staff-status-dot.booked { background: #3498db; }  /* 藍色: 有預約 */
.staff-status-dot.closed { background: #e74c3c; }  /* 紅色: 休假/關閉 */

.dot-sample {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot-sample.pending { background: #2ecc71; }
.dot-sample.closed { background: #e74c3c; }

.appointment-box {
  background: #2a2522;
}

.calendar-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.legend-item {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.today-box { background: #fff9e6; border: 1px solid #ffeeba; }
.appointment-box { background: #2a2522; }

.calendar-hint {
  margin-left: auto;
  font-size: 0.85rem;
  color: #b0b0aa;
}

.appointment-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.id-badge {
  font-size: 0.7rem;
  color: #999;
}
.pet-info {
  font-weight: 500;
  color: #2a2522;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  transition: background 0.3s;
}
.btn-cancel:hover {
  background-color: #7f8c8d;
}
</style>
```
