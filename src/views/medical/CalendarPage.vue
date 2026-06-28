<template>
  <div class="calendar-page">
    <!-- 最外層容器 -->
    <div class="calendar-container page-container page-enter">
      <!-- 行事曆 Banner 區塊 -->
      <div class="calendar-banner">
        <img
          src="@/images/caledr-banner.jpg"
          alt="行事曆 Banner"
          class="banner-image"
        />

        <!-- 頁面頂部標頭與按鈕 -->
        <header class="calendar-header">
          <div class="header-text-group">
            <h1>行事曆提醒</h1>
            <p class="subtitle">管理小福的疫苗、健檢與用藥提醒</p>
          </div>

          <button class="add-event-btn" @click="openAddForm">
            <span class="btn-icon">＋</span> 新增提醒
          </button>
        </header>
      </div>

      <!-- 新增提醒結果提示（modal 關閉後顯示在頁面上） -->
      <div
        v-if="reminderMessage"
        class="line-feedback-msg"
        :class="reminderMessageType === 'success' ? 'msg-success' : 'msg-error'"
        style="margin: 0.5rem 1rem"
      >
        {{ reminderMessage }}
      </div>

      <!-- 主版面排版（採用標準 Grid 網格） -->
      <div class="calendar-main-grid stagger-children">
        <!-- 左側行事曆主區 -->
        <div class="calendar-left-zone pawcare-card">
          <!-- 月份切換導覽控制列 -->
          <div class="month-navigation">
            <button @click="prevMonth" class="nav-arrow-btn">‹</button>
            <h3>{{ currentYear }} 年 {{ monthNames[currentMonth] }}</h3>
            <button @click="nextMonth" class="nav-arrow-btn">›</button>
          </div>

          <!-- 1. 星期標頭欄位 (日 到 六) -->
          <div class="days-header-grid">
            <div
              v-for="dayName in daysOfWeek"
              :key="dayName"
              class="day-name-label"
            >
              {{ dayName }}
            </div>
          </div>

          <!-- 2. 日期格子網格區 -->
          <div class="days-grid">
            <!-- 月初之前的空白格子（對齊星期） -->
            <div
              v-for="emptyIdx in firstDayOfWeek"
              :key="'empty-' + emptyIdx"
              class="empty-day-cell"
            ></div>

            <!-- 當月的日期按鈕 -->
            <button
              v-for="dayNum in totalDaysInMonth"
              :key="'day-' + dayNum"
              @click="selectDate(dayNum)"
              class="day-btn"
              :class="{
                'is-selected': checkIsSelected(dayNum),
                'is-today': checkIsToday(dayNum),
              }"
            >
              <span class="day-number-text">{{ dayNum }}</span>

              <!-- 事件小圓點顯示區 -->
              <div
                v-if="getEventsForDate(dayNum).length > 0"
                class="event-dots-row"
              >
                <div
                  v-for="(event, idx) in getEventsForDate(dayNum).slice(0, 3)"
                  :key="idx"
                  class="event-dot"
                  :style="{
                    backgroundColor: checkIsSelected(dayNum)
                      ? '#ffffff'
                      : getEventConfig(event.categoryId).color,
                  }"
                ></div>
              </div>

              <!-- 右上角緊急通知小紅點 -->
              <div
                v-if="checkHasUrgentEvent(dayNum) && !checkIsSelected(dayNum)"
                class="urgent-dot"
              ></div>
            </button>
          </div>
        </div>

        <!-- 右側欄：選定日期的提醒事件詳細清單 -->
        <div class="calendar-right-zone">
          <div class="pawcare-card">
            <!-- 標題顯示當前點選日期 -->
            <h3 class="event-list-title">
              {{ selectedDate.replace(/-/g, "/") }} 的提醒
            </h3>

            <!-- 【情況 A】：當天沒有任何提醒事件 -->
            <div v-if="selectedDateEvents.length === 0" class="no-event-box">
              <div class="calendar-icon-placeholder">📅</div>
              <p class="no-event-text">這天沒有排定的提醒</p>
              <button class="add-event-sm-btn" @click="openAddForm">
                ＋ 新增提醒
              </button>
            </div>

            <!-- 【情況 B】：當天有提醒事件 -->
            <div v-else class="event-items-stack">
              <div
                v-for="event in selectedDateEvents"
                :key="event.reminderId"
                class="event-detail-item"
                :style="{
                  backgroundColor: getEventConfig(event.categoryId).bg,
                }"
              >
                <!-- 左側小 icon 背景盒 -->
                <div class="event-icon-box">
                  <span
                    :style="{ color: getEventConfig(event.categoryId).color }"
                  >
                    {{ getEventConfig(event.categoryId).icon }}
                  </span>
                </div>

                <!-- 中間文字內容資訊區 -->
                <div class="event-text-main">
                  <div class="event-title-row">
                    <span class="event-title">{{ event.eventTitle }}</span>
                    <span v-if="event.isUrgent" class="status-icon text-danger"
                      >⚠️</span
                    >
                    <span
                      v-if="event.isCompleted"
                      class="status-icon text-success"
                      >✅</span
                    >
                  </div>
                  <div class="event-meta-info">
                    🕒 {{ event.eventTime }}
                    <span v-if="event.clinicName"
                      >· {{ event.clinicName }}</span
                    >
                  </div>
                </div>

                <!-- 右側膠囊狀態標籤 -->
                <span
                  class="event-type-badge"
                  :style="{ color: getEventConfig(event.categoryId).color }"
                >
                  {{ getEventConfig(event.categoryId).label }}
                </span>
              </div>
            </div>
          </div>

          <!-- LINE 提醒通知卡片（對應 OwnerLineProfiles.isSubscribed） -->
          <div
            class="pawcare-card line-card"
            :class="{ 'line-connected-bg': isSubscribed }"
          >
            <div class="line-card-header">
              <div class="line-status-text">
                <div class="line-title">LINE 提醒通知</div>
                <div class="line-desc" :class="{ 'text-active': isSubscribed }">
                  {{ isSubscribed ? "已綁定 · 提醒已啟用" : "尚未綁定" }}
                </div>
              </div>
              <div
                class="status-indicator-dot"
                :class="{ 'dot-active': isSubscribed }"
              ></div>
            </div>

            <!-- 【情況 A】：已綁定 -->
            <div v-if="isSubscribed" class="line-setting-panel">
              <div class="setting-rule-row">
                <span class="rule-icon">🔔</span>
                <span class="rule-text">新增提醒時自動發送 LINE 通知</span>
                <span class="rule-check">✓</span>
              </div>
              <button class="line-unbind-btn" @click="handleLineDisconnect">
                解除綁定
              </button>
            </div>

            <!-- 【情況 B】：未綁定 -->
            <div v-else class="line-bind-panel">
              <button class="line-official-btn" @click="handleLineConnect">
                綁定 LINE 通知
              </button>
            </div>

            <!-- 操作結果提示訊息 -->
            <div
              v-if="lineMessage"
              class="line-feedback-msg"
              :class="
                lineMessageType === 'success' ? 'msg-success' : 'msg-error'
              "
            >
              {{ lineMessage }}
            </div>
          </div>

          <!-- 即將到來的提醒卡片 -->
          <div class="pawcare-card" style="margin-top: 1rem">
            <h3 class="upcoming-title">即將到來的提醒</h3>

            <div class="upcoming-list-stack">
              <div
                v-for="event in upcomingEventsList"
                :key="event.reminderId"
                class="upcoming-item-row"
              >
                <!-- 左側小日曆圖示盒 -->
                <div
                  class="date-mini-box"
                  :style="{
                    backgroundColor: event.isUrgent
                      ? '#df4733'
                      : getEventConfig(event.categoryId).color,
                  }"
                >
                  <span class="mini-box-day">{{
                    event.targetDate.split("-")[2]
                  }}</span>
                  <span class="mini-box-month"
                    >{{ parseInt(event.targetDate.split("-")[1]) }}月</span
                  >
                </div>

                <!-- 中間文字內容 -->
                <div class="upcoming-text-main">
                  <div class="upcoming-title-row">
                    <span class="event-name-text">{{ event.eventTitle }}</span>
                    <span v-if="event.isUrgent" class="urgent-alert-icon"
                      >⚠️</span
                    >
                  </div>
                  <div class="upcoming-countdown-text">
                    {{ getCountdownText(event.targetDate) }}
                    <span v-if="event.clinicName"
                      >· {{ event.clinicName }}</span
                    >
                  </div>
                </div>

                <!-- 右側種類膠囊標籤 -->
                <span
                  class="upcoming-type-tag"
                  :style="{
                    backgroundColor: getEventConfig(event.categoryId).bg,
                    color: getEventConfig(event.categoryId).color,
                  }"
                >
                  {{ getEventConfig(event.categoryId).label }}
                </span>
              </div>
            </div>
          </div>

          <!-- 圖例說明卡片 -->
          <div class="pawcare-card legend-card">
            <h3 class="legend-title">圖例說明</h3>
            <div class="legend-list-stack">
              <div
                v-for="(cfg, key) in typeConfig"
                :key="cfg.label"
                class="legend-item-row"
              >
                <div
                  class="legend-color-dot"
                  :style="{ backgroundColor: cfg.color }"
                ></div>
                <span class="legend-icon" :style="{ color: cfg.color }">{{
                  cfg.icon
                }}</span>
                <span class="legend-text">{{ cfg.label }}</span>
              </div>

              <!-- 固定的「緊急提醒」圖例 -->
              <div class="legend-item-row">
                <div
                  class="legend-color-dot"
                  style="background-color: #df4733"
                ></div>
                <span class="legend-icon" style="color: #df4733">⚠️</span>
                <span class="legend-text">緊急提醒</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增提醒彈出視窗 (Modal) -->
      <div v-if="showAddForm" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>新增提醒</h3>
            <button class="modal-close-btn" @click="closeAddForm">✕</button>
          </div>

          <div class="modal-form-body">
            <!-- 欄位 1：提醒名稱（對應 ReminderEvents.eventTitle） -->
            <div class="form-group">
              <label class="form-label">提醒名稱</label>
              <input
                type="text"
                v-model="newReminder.eventTitle"
                placeholder="例：狂犬病疫苗"
                class="form-input"
              />
            </div>

            <!-- 欄位 2：類型按鈕選擇區（對應 ReminderEvents.categoryId） -->
            <div class="form-group">
              <label class="form-label">類型</label>
              <div class="type-buttons-row">
                <button
                  v-for="(v, k) in typeConfig"
                  :key="k"
                  type="button"
                  class="type-select-btn"
                  :style="{
                    backgroundColor:
                      newReminder.categoryId === k ? v.color : '#f3f0e8',
                    color: newReminder.categoryId === k ? '#ffffff' : '#72756e',
                  }"
                  @click="newReminder.categoryId = k"
                >
                  <span>{{ v.icon }}</span> {{ v.label }}
                </button>
              </div>
            </div>

            <!-- 欄位 3：日期與時間（對應 ReminderEvents.targetDate） -->
            <div class="form-grid-2cols">
              <div class="form-group">
                <label class="form-label">日期</label>
                <input
                  type="date"
                  v-model="newReminder.targetDate"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">時間</label>
                <input
                  type="time"
                  v-model="newReminder.eventTime"
                  class="form-input"
                />
              </div>
            </div>

            <!-- 欄位 4：診所名稱（顯示用，來自 Clinics.clinicName） -->
            <div class="form-group">
              <label class="form-label">診所（選填）</label>
              <input
                type="text"
                v-model="newReminder.clinicName"
                placeholder="例：台北動物醫院"
                class="form-input"
              />
            </div>

            <!-- 底部確認與取消按鈕 -->
            <div class="modal-actions-row">
              <button class="modal-submit-btn" @click="handleCreateEvent">
                新增提醒
              </button>
              <button class="modal-cancel-btn" @click="closeAddForm">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import useUserStore from "@/stores/user.js";
import "@/css/medical/medical-calendar-page.css";

// ==========================================================================
// 1. 基礎時間與選擇狀態
// ==========================================================================
const today = new Date();

const currentYear = ref(today.getFullYear()); // 當前年份
const currentMonth = ref(today.getMonth()); // 當前月份（0~11）

// 今天日期字串 "YYYY-MM-DD"，作為預設選中值
const yearStr = today.getFullYear();
const monthStr = String(today.getMonth() + 1).padStart(2, "0");
const dateStr = String(today.getDate()).padStart(2, "0");
const selectedDate = ref(`${yearStr}-${monthStr}-${dateStr}`);

const monthNames = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];
const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];

// ==========================================================================
// 2. 提醒事件種類設定檔
//    key 值對應 ReminderEvents.categoryId
// ==========================================================================
const typeConfig = {
  vaccine: {
    label: "疫苗接種",
    color: "#6bae8a",
    bg: "rgba(107, 174, 138, 0.15)",
    icon: "💉",
  },
  checkup: {
    label: "健康檢查",
    color: "#7bb3d4",
    bg: "rgba(123, 179, 212, 0.15)",
    icon: "🩺",
  },
  medicine: {
    label: "預防用藥",
    color: "#e29553",
    bg: "rgba(226, 149, 83, 0.15)",
    icon: "💊",
  },
};

// ==========================================================================
// 3. 提醒事件核心資料（對應 ReminderEvents 表）
// ==========================================================================
const reminderEventsList = ref([
  // {
  //   reminderId: 1,
  //   petId: 1,
  //   categoryId: "vaccine",
  //   eventTitle: "狂犬病疫苗",
  //   targetDate: "2026-04-25",
  //   eventTime: "10:00",
  //   clinicName: "台北動物醫院",
  //   isCompleted: false,
  //   isUrgent: true,
  // },
  // {
  //   reminderId: 2,
  //   petId: 1,
  //   categoryId: "medicine",
  //   eventTitle: "心絲蟲預防藥",
  //   targetDate: "2026-04-28",
  //   eventTime: "08:00",
  //   clinicName: "",
  //   isCompleted: false,
  //   isUrgent: false,
  // },
  // {
  //   reminderId: 3,
  //   petId: 1,
  //   categoryId: "checkup",
  //   eventTitle: "年度健康檢查",
  //   targetDate: "2026-05-03",
  //   eventTime: "14:00",
  //   clinicName: "台北動物醫院",
  //   isCompleted: false,
  //   isUrgent: false,
  // },
  // {
  //   reminderId: 4,
  //   petId: 1,
  //   categoryId: "medicine",
  //   eventTitle: "跳蚤預防藥",
  //   targetDate: "2026-05-15",
  //   eventTime: "08:00",
  //   clinicName: "",
  //   isCompleted: false,
  //   isUrgent: false,
  // },
  // {
  //   reminderId: 5,
  //   petId: 1,
  //   categoryId: "checkup",
  //   eventTitle: "皮膚炎回診",
  //   targetDate: "2026-04-10",
  //   eventTime: "11:00",
  //   clinicName: "愛寵動物診所",
  //   isCompleted: true,
  //   isUrgent: false,
  // },
]);

// LINE 綁定狀態（對應 OwnerLineProfiles.isSubscribed）
const userStore = useUserStore();
const TEMP_MEM_ID = 1;
const isSubscribed = ref(false);
const lineProfile = ref(null);
const lineMessage = ref("");
const lineMessageType = ref("");

// 新增提醒結果提示
const reminderMessage = ref("");
const reminderMessageType = ref("");

// 頁面載入時，呼叫 API 取得 LINE 綁定狀態
onMounted(async () => {
  // --- 取得 LINE 綁定狀態 ---
  try {
    const res = await axios.get(
      `http://localhost:8080/api/medical/line/status/${TEMP_MEM_ID}`,
    );
    lineProfile.value = res.data;
    isSubscribed.value = res.data.isSubscribed;
  } catch (err) {
    console.error("獲取 LINE 狀態失敗", err);
  }

  // --- 載入提醒事件列表 ---
  try {
    const res = await axios.get(
      "http://localhost:8080/api/medical/reminder/list/1",
    );

    const categoryIdReverseMap = { 1: "vaccine", 2: "checkup", 3: "medicine" };

    reminderEventsList.value = res.data.map((item) => {
      const dateTime = item.targetDate;
      const datePart = dateTime.split("T")[0];
      const timePart = dateTime.split("T")[1].substring(0, 5);

      const todayStr = `${yearStr}-${monthStr}-${dateStr}`;
      const daysUntil = Math.ceil(
        (new Date(datePart) - new Date(todayStr)) / (1000 * 60 * 60 * 24),
      );

      return {
        reminderId: item.reminderId,
        petId: item.petId,
        categoryId: categoryIdReverseMap[item.categoryId] ?? "vaccine",
        eventTitle: item.eventTitle,
        targetDate: datePart,
        eventTime: timePart,
        clinicName: "",
        isCompleted: item.isCompleted,
        isUrgent: daysUntil >= 0 && daysUntil <= 3 && !item.isCompleted,
      };
    });
  } catch (err) {
    console.error("載入提醒列表失敗", err);
  }
});
// 顯示 LINE 操作結果訊息，3 秒後自動清除
function showLineMessage(msg, type) {
  lineMessage.value = msg;
  lineMessageType.value = type;
  setTimeout(() => {
    lineMessage.value = "";
  }, 3000);
}

// 顯示新增提醒結果訊息，3 秒後自動清除
function showReminderMessage(msg, type) {
  reminderMessage.value = msg;
  reminderMessageType.value = type;
  setTimeout(() => {
    reminderMessage.value = "";
  }, 3000);
}

// ==========================================================================
// 4. 行事曆數學計算
// ==========================================================================
const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const totalDaysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const selectedDateEvents = computed(() => {
  return reminderEventsList.value.filter(
    (e) => e.targetDate === selectedDate.value,
  );
});

const upcomingEventsList = computed(() => {
  return reminderEventsList.value
    .filter(
      (e) =>
        !e.isCompleted && e.targetDate >= `${yearStr}-${monthStr}-${dateStr}`,
    )
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate));
});

// ==========================================================================
// 5. 行事曆切換與狀態判斷函式
// ==========================================================================
function formatDateStr(dayNum) {
  const y = currentYear.value;
  const m = String(currentMonth.value + 1).padStart(2, "0");
  const d = String(dayNum).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getEventsForDate(dayNum) {
  const target = formatDateStr(dayNum);
  return reminderEventsList.value.filter((e) => e.targetDate === target);
}

function getEventConfig(categoryId) {
  return (
    typeConfig[categoryId] || {
      label: "其他",
      color: "#999999",
      bg: "#f3f0e8",
      icon: "📝",
    }
  );
}

function checkHasUrgentEvent(dayNum) {
  return getEventsForDate(dayNum).some((e) => e.isUrgent);
}

function checkIsSelected(dayNum) {
  return selectedDate.value === formatDateStr(dayNum);
}

function checkIsToday(dayNum) {
  return formatDateStr(dayNum) === `${yearStr}-${monthStr}-${dateStr}`;
}

function selectDate(dayNum) {
  selectedDate.value = formatDateStr(dayNum);
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

// LINE 綁定與解綁
async function handleLineConnect() {
  try {
    await axios.post(`http://localhost:8080/api/medical/line/update`, {
      memId: TEMP_MEM_ID,
      lineUserId: lineProfile.value?.lineUserId ?? "",
      isSubscribed: true,
      isDeleted: false,
    });
    isSubscribed.value = true;
    showLineMessage("LINE 綁定成功！提醒通知已啟用", "success");
  } catch (err) {
    showLineMessage("綁定失敗，請檢查後端連線 ⚠️", "error");
  }
}

async function handleLineDisconnect() {
  try {
    await axios.post(`http://localhost:8080/api/medical/line/update`, {
      memId: TEMP_MEM_ID,
      lineUserId: lineProfile.value?.lineUserId ?? "",
      isSubscribed: false,
      isDeleted: false,
    });
    isSubscribed.value = false;
    showLineMessage("已解除 LINE 綁定", "success");
  } catch (err) {
    showLineMessage("解除綁定失敗，請檢查後端連線 ⚠️", "error");
  }
}

function getCountdownText(targetDate) {
  const eventDate = new Date(targetDate);
  const todayDate = new Date(`${yearStr}-${monthStr}-${dateStr}`);
  const daysUntil = Math.ceil(
    (eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysUntil === 0) return "今天";
  if (daysUntil === 1) return "明天";
  if (daysUntil < 0) return "已過期";
  return `${daysUntil} 天後`;
}

// ==========================================================================
// 6. 新增提醒彈窗邏輯
// ==========================================================================
const showAddForm = ref(false);

const newReminder = ref({
  eventTitle: "",
  categoryId: "vaccine",
  targetDate: `${yearStr}-${monthStr}-${dateStr}`,
  eventTime: "12:00",
  clinicName: "",
});

function openAddForm() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  newReminder.value = {
    eventTitle: "",
    categoryId: "vaccine",
    targetDate: `${y}-${m}-${d}`, // 今天日期
    eventTime: `${h}:${min}`, // 當下時間
    clinicName: "",
  };
  showAddForm.value = true;
}

function closeAddForm() {
  showAddForm.value = false;
}

async function handleCreateEvent() {
  if (!newReminder.value.eventTitle.trim()) {
    showReminderMessage("請輸入提醒名稱哦！", "error");
    return;
  }

  const categoryIdMap = { vaccine: 1, checkup: 2, medicine: 3 };
  const targetDateTime = `${newReminder.value.targetDate}T${newReminder.value.eventTime}:00`;

  try {
    const res = await axios.post(
      "http://localhost:8080/api/medical/reminder/create",
      {
        memId: TEMP_MEM_ID,
        petId: 1,
        petName: "小福",
        categoryId: categoryIdMap[newReminder.value.categoryId],
        eventTitle: newReminder.value.eventTitle,
        targetDate: targetDateTime,
      },
    );

    reminderEventsList.value.push({
      reminderId: res.data.reminderId,
      petId: 1,
      categoryId: newReminder.value.categoryId,
      eventTitle: newReminder.value.eventTitle,
      targetDate: newReminder.value.targetDate,
      eventTime: newReminder.value.eventTime,
      clinicName: newReminder.value.clinicName,
      isCompleted: false,
      isUrgent: false,
    });

    showAddForm.value = false;
    showReminderMessage("提醒已成功新增！", "success");
  } catch (err) {
    console.error("新增提醒失敗", err);
    showReminderMessage("新增失敗，請檢查後端連線 ⚠️", "error");
  }
}
</script>
