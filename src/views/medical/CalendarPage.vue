<template>
  <div class="calendar-page">
  <!-- 最外層容器，自帶頁面淡入動畫 -->
  <div class="calendar-container page-container page-enter">
  
    <!-- 新增的行事曆 Banner 區塊 -->
    <div class="calendar-banner">
      <!-- 這裡放您新增的行事曆 Banner 圖片 -->
      <img src="@/images/caledr-banner.jpg" alt="行事曆 Banner" class="banner-image" />
      
      <!-- 頁面頂部標頭與按鈕 (移入 Banner 內部) -->
      <header class="calendar-header">
        <div class="header-text-group">
          <h1>行事曆提醒</h1>
          <p class="subtitle">管理小福的疫苗、健檢與用藥提醒</p>
        </div>
        
        <!-- 新增提醒按鈕：點擊觸發一般 JS 函式 -->
        <button class="add-event-btn" @click="openAddForm">
          <span class="btn-icon">＋</span> 新增提醒
        </button>
      </header>
    </div>

    <!-- 主版面排版（採用標準 Grid 網格） -->
    <div class="calendar-main-grid stagger-children">

      <!-- 左側行事曆主區（佔用較大區塊） -->
        <!-- 👈 修正：將左側容器加入 pawcare-card 樣式類別 -->
        <div class="calendar-left-zone pawcare-card">

        

          
          <!-- 月份切換導覽控制列 -->
          <div class="month-navigation">
            <!-- 上一個月按鈕 -->
            <button @click="prevMonth" class="nav-arrow-btn"> ‹</button>
            
            <!-- 目前年月份顯示 -->
            <h3>{{ currentYear }} 年 {{ monthNames[currentMonth] }}</h3>
            
            <!-- 下一個月按鈕 -->
            <button @click="nextMonth" class="nav-arrow-btn"> ›</button>
          </div>

          <!-- 💡 提示：下一段行事曆的「日期格子（Days Grid）」HTML 之後可以接在這裡下方 -->
          <!-- 1. 星期標頭欄位 (日 到 六) -->
          <div class="days-header-grid">
            <div v-for="dayName in daysOfWeek" :key="dayName" class="day-name-label">
              {{ dayName }}
            </div>
          </div>

          <!-- 2. 日期格子網格區 -->
          <div class="days-grid">
            <!-- 渲染月初之前的「空白格子」（用來對齊星期） -->
            <div v-for="emptyIdx in firstDayOfWeek" :key="'empty-' + emptyIdx" class="empty-day-cell"></div>

            <!-- 渲染當月的「日期按鈕」 -->
            <button
              v-for="dayNum in totalDaysInMonth"
              :key="'day-' + dayNum"
              @click="selectDate(dayNum)"
              class="day-btn"
              :class="{
                'is-selected': checkIsSelected(dayNum),
                'is-today': checkIsToday(dayNum)
              }"
            >
              <!-- 日期數字 -->
              <span class="day-number-text">{{ dayNum }}</span>
              
              <!-- 下方事件小圓點顯示區 -->
              <div v-if="getEventsForDate(dayNum).length > 0" class="event-dots-row">
                <div
                  v-for="(event, idx) in getEventsForDate(dayNum).slice(0, 3)"
                  :key="idx"
                  class="event-dot"
                  :style="{ backgroundColor: checkIsSelected(dayNum) ? '#ffffff' : getEventColor(event.type) }"
                ></div>
              </div>

              <!-- 右上角緊急通知小紅點 -->
              <div v-if="checkHasUrgentEvent(dayNum) && !checkIsSelected(dayNum)" class="urgent-dot"></div>
            </button>
          </div>

        </div>

      <!-- 右側預留區（未來可放置事件清單等） -->
      <div class="calendar-right-zone">
        <!-- 之後可以把右側欄的 HTML 放這裡 -->
         <!-- 右側欄：選定日期的提醒事件詳細清單 -->
        <div class="pawcare-card">
          <!-- 動態更換標題為當前點選的日期 (格式轉為 YYYY/MM/DD) -->
          <h3 class="event-list-title">
            {{ selectedDate.replace(/-/g, "/") }} 的提醒
          </h3>
          
          <!-- 【情況 A】：當天沒有任何排定的提醒事件 (使用 v-if) -->
          <div v-if="selectedDateEvents.length === 0" class="no-event-box">
            <div class="calendar-icon-placeholder">📅</div>
            <p class="no-event-text">這天沒有排定的提醒</p>
            <button class="add-event-sm-btn" @click="openAddForm">
              ＋ 新增提醒
            </button>
          </div>

          <!-- 【情況 B】：當天有提醒事件 (使用 v-else + v-for 迴圈) -->
          <div v-else class="event-items-stack">
            <div 
              v-for="event in selectedDateEvents" 
              :key="event.id" 
              class="event-detail-item"
              :style="{ backgroundColor: getEventConfig(event.type).bg }"
            >
              <!-- 左側白色小 icon 背景盒 -->
              <div class="event-icon-box">
                <span :style="{ color: getEventConfig(event.type).color }">
                  {{ getEventConfig(event.type).icon }}
                </span>
              </div>
              
              <!-- 中間文字內容資訊區 -->
              <div class="event-text-main">
                <div class="event-title-row">
                  <span class="event-title">{{ event.title }}</span>
                  <!-- 緊急與完成狀態小圖示 -->
                  <span v-if="event.urgent" class="status-icon text-danger">⚠️</span>
                  <span v-if="event.done" class="status-icon text-success">✅</span>
                </div>
                <div class="event-meta-info">
                  🕒 {{ event.time }} <span v-if="event.clinic">· {{ event.clinic }}</span>
                </div>
              </div>
              
              <!-- 右側膠囊狀態標籤 -->
              <span 
                class="event-type-badge"
                :style="{ color: getEventConfig(event.type).color }"
              >
                {{ getEventConfig(event.type).label }}
              </span>
            </div>
          </div>
        </div>

        <!-- LINE 提醒通知卡片 -->
        <div
          class="pawcare-card line-card"
          :class="{ 'line-connected-bg': lineConnected }"
        >
          <!-- 卡片頭部：圖示與目前狀態 -->
          <div class="line-card-header">
            <div class="line-icon-box" :class="{ 'line-active-icon': lineConnected }">
              <span class="line-logo-emoji">💬</span>
            </div>
            <div class="line-status-text">
              <div class="line-title">LINE 提醒通知</div>
              <div class="line-desc" :class="{ 'text-active': lineConnected }">
                {{ lineConnected ? "已綁定 · 提醒已啟用" : "尚未綁定" }}
              </div>
            </div>
            <!-- 右側狀態小圓點指示燈 -->
            <div class="status-indicator-dot" :class="{ 'dot-active': lineConnected }"></div>
          </div>

          <!-- 【情況 A】：已綁定狀態下，顯示提醒設定與解綁按鈕 -->
          <div v-if="lineConnected" class="line-setting-panel">
            <div class="setting-rule-row">
              <span class="rule-icon">🔔</span>
              <span class="rule-text">提醒前 1 天通知</span>
              <span class="rule-check">✓</span>
            </div>
            <div class="setting-rule-row">
              <span class="rule-icon">🔔</span>
              <span class="rule-text">當天早上 8:00 通知</span>
              <span class="rule-check">✓</span>
            </div>
            
            <!-- 解除綁定按鈕 -->
            <button class="line-unbind-btn" @click="handleLineDisconnect">
              解除綁定
            </button>
          </div>

          <!-- 【情況 B】：未綁定狀態下，顯示 LINE 標準綠色綁定按鈕 -->
          <div v-else class="line-bind-panel">
            <button class="line-official-btn" @click="handleLineConnect">
              💬 綁定 LINE 通知
            </button>
          </div>
        </div>

        <!-- 即將到來的提醒卡片 -->
        <div class="pawcare-card" style="margin-top: 1rem;">
          <h3 class="upcoming-title">即將到來的提醒</h3>
          
          <div class="upcoming-list-stack">
            <!-- 跑 v-for 迴圈渲染所有即將到來的事件 -->
            <div 
              v-for="event in upcomingEventsList" 
              :key="event.id" 
              class="upcoming-item-row"
            >
              <!-- 左側小日曆圖示盒（緊急時顯示紅色，平時顯示事件種類顏色） -->
              <div 
                class="date-mini-box"
                :style="{ backgroundColor: event.urgent ? '#df4733' : getEventConfig(event.type).color }"
              >
                <span class="mini-box-day">{{ event.date.split('-')[2] }}</span>
                <span class="mini-box-month">{{ parseInt(event.date.split('-')[1]) }}月</span>
              </div>
              
              <!-- 中間文字內容資訊 -->
              <div class="upcoming-text-main">
                <div class="upcoming-title-row">
                  <span class="event-name-text">{{ event.title }}</span>
                  <span v-if="event.urgent" class="urgent-alert-icon">⚠️</span>
                </div>
                <!-- 呼叫 JS 函式，動態顯示：今天/明天/X天後 -->
                <div class="upcoming-countdown-text">
                  {{ getCountdownText(event.date) }} <span v-if="event.clinic">· {{ event.clinic }}</span>
                </div>
              </div>
              
              <!-- 右側種類膠囊標籤 -->
              <span 
                class="upcoming-type-tag"
                :style="{ backgroundColor: getEventConfig(event.type).bg, color: getEventConfig(event.type).color }"
              >
                {{ getEventConfig(event.type).label }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 圖例說明卡片 -->
        <div class="pawcare-card legend-card">
          <h3 class="legend-title">圖例說明</h3>
          
          <div class="legend-list-stack">
            <!-- 使用 Vue 特色：直接對物件 (typeConfig) 跑 v-for 迴圈 -->
            <div 
              v-for="(cfg, key) in typeConfig" 
              :key="cfg.label" 
              class="legend-item-row"
            >
              <!-- 左側小圓點 -->
              <div class="legend-color-dot" :style="{ backgroundColor: cfg.color }"></div>
              <!-- 中間小圖標 -->
              <span class="legend-icon" :style="{ color: cfg.color }">{{ cfg.icon }}</span>
              <!-- 右側文字 -->
              <span class="legend-text">{{ cfg.label }}</span>
            </div>

            <!-- 固定的「緊急提醒」圖例 -->
            <div class="legend-item-row">
              <div class="legend-color-dot" style="background-color: #df4733;"></div>
              <span class="legend-icon" style="color: #df4733;">⚠️</span>
              <span class="legend-text">緊急提醒</span>
            </div>
          </div>
        </div>

      </div>
    </div>

        <!-- 新增提醒彈出視窗 (Modal) - 當 showAddForm 為 true 時才會顯示 -->
  <div v-if="showAddForm" class="modal-overlay">
    <div class="modal-card">
      
      <!-- 彈窗頭部 -->
      <div class="modal-header">
        <h3>新增提醒</h3>
        <button class="modal-close-btn" @click="closeAddForm">✕</button>
      </div>
      
      <!-- 表單內容區域 -->
      <div class="modal-form-body">
        
        <!-- 欄位 1：提醒名稱 -->
        <div class="form-group">
          <label class="form-label">提醒名稱</label>
          <input type="text" v-model="newEvent.title" placeholder="例：狂犬病疫苗" class="form-input" />
        </div>
        
        <!-- 欄位 2：類型按鈕選擇區 -->
        <div class="form-group">
          <label class="form-label">類型</label>
          <div class="type-buttons-row">
            <button
              v-for="(v, k) in typeConfig"
              :key="k"
              type="button"
              class="type-select-btn"
              :style="{
                backgroundColor: newEvent.type === k ? v.color : '#f3f0e8',
                color: newEvent.type === k ? '#ffffff' : '#72756e'
              }"
              @click="newEvent.type = k"
            >
              <span>{{ v.icon }}</span> {{ v.label }}
            </button>
          </div>
        </div>
        
        <!-- 欄位 3：日期與時間 (並排兩欄) -->
        <div class="form-grid-2cols">
          <div class="form-group">
            <label class="form-label">日期</label>
            <input type="date" v-model="newEvent.date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">時間</label>
            <input type="time" v-model="newEvent.time" class="form-input" />
          </div>
        </div>
        
        <!-- 欄位 4：診所名稱 -->
        <div class="form-group">
          <label class="form-label">診所（選填）</label>
          <input type="text" v-model="newEvent.clinic" placeholder="例：台北動物醫院" class="form-input" />
        </div>
        
        <!-- 底部確認與取消按鈕 -->
        <div class="modal-actions-row">
          <button class="modal-submit-btn" @click="handleCreateEvent">新增提醒</button>
          <button class="modal-cancel-btn" @click="closeAddForm">取消</button>
        </div>

      </div>
    </div>
  </div>

  </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import '@/css/medical/medical-calendar-page.css'

// ==========================================================================
// 1. 基礎時間與選擇狀態
// ==========================================================================
const today = new Date()
const currentYear = ref(2026) // 依據原檔，預設為 2026 年
const currentMonth = ref(3)   // 依據原檔，預設為 3 (代表 4 月)

// 使用者選中的日期（預設為今天 2026-04-23）
const selectedDate = ref("2026-04-23")

// 基礎對照陣列
const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"]


// ==========================================================================
// 2. 醫療提醒核心資料庫 (已同步改為你剛才提供的新數據庫內容！)
// ==========================================================================
const eventsList = ref([
  { id: 1, date: "2026-04-25", title: "狂犬病疫苗", type: "vaccine", time: "10:00", clinic: "台北動物醫院", urgent: true, done: false },
  { id: 2, date: "2026-04-28", title: "心絲蟲預防藥", type: "medicine", time: "08:00", clinic: "", urgent: false, done: false },
  { id: 3, date: "2026-05-03", title: "年度健康檢查", type: "checkup", time: "14:00", clinic: "台北動物醫院", urgent: false, done: false },
  { id: 4, date: "2026-05-15", title: "跳蚤預防藥", type: "medicine", time: "08:00", clinic: "", urgent: false, done: false },
  { id: 5, date: "2026-04-10", title: "皮膚炎回診", type: "checkup", time: "11:00", clinic: "愛寵動物診所", urgent: false, done: true },
])

// 療癒系三大事件種類的配色與圖示設定檔 (Emoji 純文字版圖示)
const typeConfig = {
  vaccine: { label: "疫苗接種", color: "#6bae8a", bg: "rgba(107, 174, 138, 0.15)", icon: "💉" },
  checkup: { label: "健康檢查", color: "#7bb3d4", bg: "rgba(123, 179, 212, 0.15)", icon: "🩺" },
  medicine: { label: "預防用藥", color: "#e29553", bg: "rgba(226, 149, 83, 0.15)", icon: "💊" }
}

// 控制 LINE 綁定狀態的開關變數
const lineConnected = ref(false) // 依據原檔，預設為 false (尚未綁定)


// ==========================================================================
// 3. 核心行事曆數學計算 (Vite + Vue 3 自動動態刷新)
// ==========================================================================
// 計算當月第一天是星期幾
const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

// 計算當月總共有幾天
const totalDaysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

// 自動過濾：當使用者點選左邊日期時，右邊會自動撈出那一天的事件清單
const selectedDateEvents = computed(() => {
  return eventsList.value.filter(e => e.date === selectedDate.value)
})

// 用於右側欄「即將到來的提醒」清單：過濾出未完成且日期大於等於今天的事件，並由近到遠排序
const upcomingEventsList = computed(() => {
  return eventsList.value
    .filter(e => !e.done && e.date >= "2026-04-23")
    .sort((a, b) => a.date.localeCompare(b.date))
})


// ==========================================================================
// 4. 行事曆切換與狀態判斷函式
// ==========================================================================
// 格式化特定日期數字為 YYYY-MM-DD 字串
function formatDateStr(dayNum) {
  const y = currentYear.value
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const d = String(dayNum).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 獲取某一天的所有事件（用於日曆格子畫小圓點）
function getEventsForDate(dayNum) {
  const targetDateStr = formatDateStr(dayNum)
  return eventsList.value.filter(e => e.date === targetDateStr)
}

// 根據事件類型返回對應顏色
function getEventColor(type) {
  return typeConfig[type]?.color || '#999999'
}

// 安全取得設定檔物件
function getEventConfig(type) {
  return typeConfig[type] || { label: "其他", color: "#999999", bg: "#f3f0e8", icon: "📝" }
}

// 檢查某一天是否有緊急事件
function checkHasUrgentEvent(dayNum) {
  return getEventsForDate(dayNum).some(e => e.urgent)
}

// 判斷日曆格子是否被選中
function checkIsSelected(dayNum) {
  return selectedDate.value === formatDateStr(dayNum)
}

// 判斷日曆格子是否為今天 (2026-04-23)
function checkIsToday(dayNum) {
  return formatDateStr(dayNum) === "2026-04-23"
}

// 點擊日曆日期格子時觸發
function selectDate(dayNum) {
  selectedDate.value = formatDateStr(dayNum)
}

// 月份與 LINE 控制
function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } 
  else { currentMonth.value-- }
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } 
  else { currentMonth.value++ }
}
function handleLineConnect() { lineConnected.value = true; alert("LINE 綁定成功！提醒通知已啟用 🟢") }
function handleLineDisconnect() { lineConnected.value = false; alert("已解除 LINE 綁定 ⚪") }

// 計算剩餘天數倒數
function getCountdownText(eventDateStr) {
  const eventDate = new Date(eventDateStr)
  const todayDate = new Date("2026-04-23")
  const daysUntil = Math.ceil((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil === 0) return "今天"
  if (daysUntil === 1) return "明天"
  if (daysUntil < 0) return "已過期"
  return `${daysUntil} 天後`
}


// ==========================================================================
// 5. 新增表單彈窗邏輯
// ==========================================================================
const showAddForm = ref(false)

const newEvent = ref({
  title: '',
  type: 'vaccine',
  date: '2026-04-23',
  time: '12:00',
  clinic: ''
})

function openAddForm() {
  newEvent.value = { title: '', type: 'vaccine', date: '2026-04-23', time: '12:00', clinic: '' }
  showAddForm.value = true
}

function closeAddForm() {
  showAddForm.value = false
}

function handleCreateEvent() {
  if (!newEvent.value.title.trim()) {
    alert("請輸入提醒名稱哦！")
    return
  }

  // 將新輸入的物件塞入核心陣列
  eventsList.value.push({
    id: Date.now(),
    date: newEvent.value.date,
    time: newEvent.value.time,
    title: newEvent.value.title,
    type: newEvent.value.type,
    urgent: false,
    done: false,
    clinic: newEvent.value.clinic
  })

  alert("🎉 提醒已成功新增！")
  showAddForm.value = false
}
</script>
