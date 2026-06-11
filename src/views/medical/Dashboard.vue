<template>
  <div class="dashboard-container page-enter">
    <!-- 頁面頂部標頭 -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>早安，王小明 👋</h1>
        <p class="subtitle">今天是 2026 年 4 月 23 日，小福的健康狀況良好</p>
      </div>
      <div class="header-right">
        <div class="status-badge normal">
          <span class="heart-icon">❤️</span> 健康狀態：良好
        </div>
      </div>
    </header>

    <!-- Bento Grid 大網格外殼 -->
    <div class="bento-grid">
      <!-- 🟢 左側直向資訊通道 (由上往下堆疊) -->
      <div class="bento-left-column">
        <!-- 1. 小福直立卡片 -->
        <div class="bento-card-pet">
          <div class="avatar-container-vertical">
            <img :src="petAvatar" alt="小福" class="pet-avatar-vertical" />
            <!--<div class="heart-badge-vertical">❤️</div>-->
          </div>
          <div class="pet-info-vertical">
            <div class="pet-name-row-vertical">
              <h2>小福</h2>
              <span class="status-tag">健康良好</span>
            </div>
            <div class="pet-details-vertical">
              <p>🦮 黃金獵犬 · 公</p>
              <p>🎂 2023/01/15 生日 (3歲)</p>
              <p>⚖️ 目前體重：13.6 kg</p>
            </div>
          </div>
        </div>

        <!-- 2. 今日寵物摘要 (移至左側) -->
        <div class="bento-card-summary">
          <h3>🐾 今日寵物摘要</h3>
          <p>
            小福今天精神很好，早上有按時吃藥。建議下午可以去公園散步 30 分鐘。
          </p>
        </div>
      </div>

      <!-- 🟢 右側功能快捷通道 (寬敞條列式) -->
      <div class="bento-right-column">
        <div
          v-for="action in quickActions"
          :key="action.label"
          class="bento-card-action"
          :style="{ borderLeft: '4px solid ' + action.borderLeftColor }"
          @click="$router.push(action.path)"
        >
          <span class="action-icon">{{ action.icon }}</span>
          <div class="action-text-group">
            <h4 class="action-title">{{ action.label }}</h4>
            <p class="action-desc">{{ action.desc }}</p>
          </div>
          <span class="action-arrow">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
console.log("首頁主控台已成功載入！");

import { ref, computed } from "vue";
import "@/css/medical/medical-dashboard.css";

// 修正 Vite 報錯：引入預設圖片，並確保畫面使用 :src 綁定
import defaultDogImage from "@/images/dog.jpg";

// 寵物底部的狀態列表數據（對應 Vue 的 v-for）
const petStatusList = ref([
  { label: "疫苗", value: "最新", ok: true },
  { label: "晶片", value: "已登記", ok: true },
  { label: "絕育", value: "已結紮", ok: true },
]);

// 體重圖表數據（之後可以用來畫折線圖）
const weightData = ref([
  { date: "3/1", weight: 12.8 },
  { date: "3/8", weight: 13.1 },
  { date: "3/15", weight: 13.0 },
  { date: "3/22", weight: 13.3 },
  { date: "3/29", weight: 13.2 },
  { date: "4/5", weight: 13.5 },
  { date: "4/12", weight: 13.4 },
  { date: "4/19", weight: 13.6 },
]);

// 快捷鍵功能清單
// 原本的 React 元件圖示（icon: Activity）我們直接改成更直覺、不依賴套件的網頁 Emoji 圖標
// const quickActions = ref([
//   {
//     label: "健康狀態追蹤",
//     icon: "📈",
//     path: "/medical/healthtracking",
//     borderLeftColor: "#7BB3D4",
//     desc: "記錄今日體重飲食",
//   },
//   {
//     label: "病歷紀錄",
//     icon: "📁",
//     path: "/medical/medicalrecords",
//     borderLeftColor: "#B59BD4",
//     desc: "查看與上傳病歷",
//   },
//   {
//     label: "行事曆提醒",
//     icon: "📅",
//     path: "/medical/calendarpage",
//     borderLeftColor: "#E87A9A",
//     desc: "疫苗與回診提醒",
//   },
//   {
//     label: "附近診所搜尋",
//     icon: "📍",
//     path: "/medical/clinicsearch",
//     borderLeftColor: "#E8A87A",
//     desc: "找尋附近動物醫院",
//   },
//   {
//     label: "寵物接送服務",
//     icon: "🚗",
//     path: "/medical/taxiservice",
//     borderLeftColor: "#6BAE8A",
//     desc: "寵物友善叫車服務",
//   },
//   //{ label: "醫療費用", icon: "💰", path: "/expenses", borderLeftColor: "#D4B86A", desc: "費用統計與紀錄" },
// ]);

// 1. 模擬未來從資料庫或全域狀態撈出來的「當前寵物即時數據」

const currentPetLive = ref({
  avatarUrl: "", // 留空會自動套用上面的 defaultDogImage
  waterProgress: "480/600 ml (80%)",
  currentWeight: "13.6 kg",
  lastMedicalReport: "04/10 年度健康檢查報告 (正常)",
  urgentReminder: "04/25 狂犬病疫苗 (2天後)",
  nearestClinic: "台北動物醫院",
});

// 地理定位狀態 (用於附近診所功能防呆)
const hasGeolocation = ref(false);
const userRegion = ref("信義區"); // 會員居住區域保底（若有）

// 判斷要顯示的頭貼網址
const petAvatar = computed(() => {
  return currentPetLive.value.avatarUrl || defaultDogImage;
});

// 快捷鍵功能清單 (利用 computed 融合你原本的樣式與最新的動態數據)

const quickActions = computed(() => [
  {
    label: "健康狀態追蹤",
    icon: "📈",
    path: "/medical/healthtracking",
    borderLeftColor: "#7BB3D4",
    // 核心改變：原本固定的說明文字，現在變成即時數據
    desc: `今日飲水 ${currentPetLive.value.waterProgress} · 體重 ${currentPetLive.value.currentWeight}`,
  },
  {
    label: "病歷紀錄",
    icon: "📁",
    path: "/medical/medicalrecords",
    borderLeftColor: "#B59BD4",
    desc: `最新紀錄：${currentPetLive.value.lastMedicalReport}`,
  },
  {
    label: "行事曆提醒",
    icon: "📅",
    path: "/medical/calendarpage",
    borderLeftColor: "#E87A9A",
    desc: `最近提醒：${currentPetLive.value.urgentReminder}`,
  },
  {
    label: "附近診所搜尋",
    icon: "📍",
    path: "/medical/clinicsearch",
    borderLeftColor: "#E8A87A",
    desc: "找尋附近動物醫院",
  },
  {
    label: "寵物接送服務",
    icon: "🚗",
    path: "/medical/taxiservice",
    borderLeftColor: "#6BAE8A",
    // 根據是否有疫苗行程，動態調整叫車提示
    desc: currentPetLive.value.urgentReminder.includes("疫苗")
      ? "有疫苗接種行程，建議提早預約寵物友善專車"
      : "寵物友善叫車服務與專車媒合",
  },
]);

// 即將到來的提醒事件
const upcomingEvents = ref([
  { date: "4/25", title: "狂犬病疫苗", type: "vaccine", urgent: true },
  { date: "5/3", title: "年度健康檢查", type: "checkup", urgent: false },
  { date: "5/15", title: "心絲蟲預防藥", type: "medicine", urgent: false },
]);

// 最近病歷紀錄
const recentRecords = ref([
  {
    date: "2026/04/10",
    title: "年度健康檢查",
    clinic: "台北動物醫院",
    status: "正常",
  },
  {
    date: "2026/03/22",
    title: "皮膚炎回診",
    clinic: "愛寵動物診所",
    status: "追蹤中",
  },
  {
    date: "2026/03/05",
    title: "疫苗施打",
    clinic: "台北動物醫院",
    status: "完成",
  },
]);
</script>
