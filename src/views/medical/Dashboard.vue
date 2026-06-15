<template>
  <div class="dashboard-container page-enter">
    <!-- 頁面頂部標頭 -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>早安，{{ member.name }} 👋</h1>
        <p class="subtitle">
          今天是 {{ formattedTodayDate }}，{{ pet.name }}的健康狀況良好
        </p>
      </div>
      <div class="header-right">
        <div class="status-badge normal">
          <span class="heart-icon">❤️</span> 健康狀態：良好
        </div>
      </div>
    </header>

    <!-- 大網格外殼 -->
    <div class="bento-grid">
      <!-- 左側由上往下堆疊 -->
      <div class="bento-left-column">
        <!-- 1. 寵物直立卡片 -->
        <div class="bento-card-pet">
          <div class="avatar-container-vertical">
            <img :src="petAvatar" :alt="pet.name" class="pet-avatar-vertical" />
          </div>
          <div class="pet-info-vertical">
            <div class="pet-name-row-vertical">
              <h2>{{ pet.name }}</h2>
              <span class="status-tag">健康良好</span>
            </div>
            <div class="pet-details-vertical">
              <p>🦮 {{ pet.breed }} · {{ pet.gender }}</p>
              <p>🎂 {{ pet.birth }} 生日 ({{ pet.age }}歲)</p>
              <p>⚖️ 目前體重：{{ pet.weight }} kg</p>
            </div>
          </div>
        </div>

        <!-- 2. 今日寵物摘要 -->
        <div class="bento-card-summary">
          <h3>🐾 今日寵物摘要</h3>
          <p>
            {{ pet.name }}今天精神很好，早上有按時吃藥。建議下午可以去公園散步
            30 分鐘。
          </p>
        </div>
      </div>

      <!-- 右側功能 -->
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
import { ref, computed } from "vue";
import "@/css/medical/medical-dashboard.css";
import defaultDogImage from "@/images/dog.jpg";

// ── 會員資料 (對應 Member 資料表) ──────────────────────────────
const member = ref({
  id: 1,
  name: "王小明",
});

// ── 寵物資料 (對應 Pet 資料表) ────────────────────────────────
const pet = ref({
  id: 1,
  name: "小福",
  breed: "黃金獵犬",
  gender: "公",
  birth: "2023/01/15",
  age: 3,
  weight: 13.6,
  isNeutered: true,
  // 頭貼網址：空字串時自動顯示預設圖
  avatarUrl: "",
});

// 頭貼：有設定就用，沒有就用預設圖
const petAvatar = computed(() => pet.value.avatarUrl || defaultDogImage);

// ── 今天日期 ────────────────────────────────────────────────────
const formattedTodayDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  return `${year} 年 ${month} 月 ${date} 日`;
});

// ── 健康追蹤即時數據 (對應 PetHealthTracking 資料表) ───────────
// 這裡先用 ref 存放「顯示用的彙總數字」，未來可從 API 撈回真實 metricValue
const healthTracking = ref({
  waterIntake: "480/600 ml (80%)", // metricValue (飲水量)
  currentWeight: "13.6 kg", // metricValue (體重)
});

// ── 最近一筆醫療紀錄 (對應 MedicalRecords 資料表) ──────────────
const latestMedicalRecord = ref({
  recordId: 1,
  recordDate: "04/10",
  diagnosis: "年度健康檢查報告",
  status: "正常",
});

// ── 最近提醒事件 (對應 ReminderEvents 資料表) ──────────────────
const upcomingReminder = ref({
  reminderId: 1,
  eventTitle: "狂犬病疫苗",
  targetDate: "04/25",
  description: "2天後",
});

// ── 快捷功能清單 ────────────────────────────────────────────────
// desc 整合上方即時數據，讓卡片內容隨資料自動更新
const quickActions = computed(() => [
  {
    label: "健康狀態追蹤",
    icon: "📈",
    path: "/medical/healthtracking",
    borderLeftColor: "#7BB3D4",
    desc: `今日飲水 ${healthTracking.value.waterIntake} · 體重 ${healthTracking.value.currentWeight}`,
  },
  {
    label: "病歷紀錄",
    icon: "📁",
    path: "/medical/medicalrecords",
    borderLeftColor: "#B59BD4",
    desc: `最新紀錄：${latestMedicalRecord.value.recordDate} ${latestMedicalRecord.value.diagnosis} (${latestMedicalRecord.value.status})`,
  },
  {
    label: "行事曆提醒",
    icon: "📅",
    path: "/medical/calendarpage",
    borderLeftColor: "#E87A9A",
    desc: `最近提醒：${upcomingReminder.value.targetDate} ${upcomingReminder.value.eventTitle} (${upcomingReminder.value.description})`,
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
    // 若有疫苗提醒，提示提早預約
    desc: upcomingReminder.value.eventTitle.includes("疫苗")
      ? "有疫苗接種行程，建議提早預約寵物友善專車"
      : "寵物友善叫車服務與專車媒合",
  },
]);
</script>
