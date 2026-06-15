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
            <th>關聯預約 ID</th>
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
            <td>{{ slot.appointmentId || '—' }}</td>
            <td>
              <button v-if="!slot.appointmentId" @click="toggleSlot(slot)" class="btn-sm">
                {{ slot.isOpen ? '關閉時段' : '開放預約' }}
              </button>
              <span v-else>不可修改</span>
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
            @click="item.date && jumpToDate(item.date)"
          >
            <div class="day-header">
              <span class="day-num" v-if="item.day">{{ item.day }}</span>
            </div>
            <div v-if="item.count > 0" class="appointment-tag">
              <span class="dot"></span> {{ item.count }} 筆預約
            </div>
          </div>
        </div>

        <div class="calendar-footer">
          <div class="legend-item"><span class="box today-box"></span> 今日</div>
          <div class="legend-item"><span class="box appointment-box"></span> 有預約項目</div>
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
    // 統計該日期在 schedule 中有 appointmentId 的數量
    const count = schedule.value.filter(s => s.date === dateStr && s.appointmentId).length;
    days.push({ day: d, date: dateStr, count });
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

const totalOrdersPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage) || 1);

// 當搜尋或篩選條件改變時，自動回到第一頁
watch([searchQuery, statusFilter], () => {
  ordersPage.value = 1;
});

// 功能邏輯
const updateOrderStatus = (id, newStatus) => {
  const order = orders.value.find(o => o.id === id);
  if (order) order.status = newStatus;
};

const toggleSlot = (slot) => {
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

// 一鍵開啟/關閉特定美容師整天排班
const setGroomerDayStatus = (isOpen) => {
  const affectedSlots = schedule.value.filter(s => 
    s.date === selectedDate.value && 
    s.staffName === quickActionStaff.value && 
    !s.appointmentId
  );

  if (affectedSlots.length === 0) {
    alert('此美容師當日所有時段已被預約或無可修改時段。');
    return;
  }

  affectedSlots.forEach(s => s.isOpen = isOpen);
  alert(`已將 ${quickActionStaff.value} 於 ${selectedDate.value} 的所有可用時段設為 ${isOpen ? '開放' : '關閉'}`);
};

const getSlotStatusText = (slot) => {
  if (slot.appointmentId) return '已預約';
  return slot.isOpen ? '可排班' : '維修/休息';
};

const getSlotStatusClass = (slot) => {
  if (slot.appointmentId) return 'status-badge status-completed';
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
  min-height: 110px;
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

.appointment-tag {
  margin-top: 10px;
  background: #2a2522;
  color: #fff;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.appointment-tag .dot {
  width: 6px;
  height: 6px;
  background: #ffcc00;
  border-radius: 50%;
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
</style>
```
