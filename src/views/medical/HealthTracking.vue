<template>
  <!-- 最外層容器 -->
  <div class="tracking-container page-container page-enter">
    <!-- 健康追蹤 Banner -->
    <div class="health-tracking-banner">
      <img :src="healthBanner" alt="健康追蹤 Banner" class="banner-image" />

      <!-- 頁面頂部標頭 -->
      <header class="tracking-header">
        <h1>健康狀態追蹤</h1>
        <p class="subtitle">記錄{{ name }} 的每日健康數據，掌握長期趨勢變化</p>
      </header>
    </div>

    <!-- 主排版區：左側輸入表單 + 右側圖表區 -->
    <div class="tracking-main-grid stagger-children">
      <!-- 【左側面板】：今日紀錄輸入表單 -->
      <div class="pawcare-card pawcare-card-accent-green">
        <!-- 表單標頭 -->
        <div class="form-header-row">
          <div class="activity-icon-box">📊</div>
          <h3>今日紀錄輸入</h3>
        </div>

        <!-- 表單填寫區域 -->
        <div class="tracking-form-body">
          <!-- 1. 體重輸入框 -->
          <div class="form-group">
            <label class="form-label">⚖️ 體重（kg）</label>
            <input
              type="number"
              step="0.1"
              v-model="metricValueWeight"
              placeholder="例：13.6"
              class="form-input"
            />
          </div>

          <!-- 2. 飲水量輸入框 -->
          <div class="form-group">
            <label class="form-label">💧 飲水量（ml）</label>
            <input
              type="number"
              v-model="metricValueWater"
              placeholder="例 : 480"
              class="form-input"
            />
            <p class="input-tip-text">
              <span v-if="metricValueWeight > 0">
                建議每日 {{ recommendedWater }}（體重 × 60ml）
              </span>
              <span v-else> 建議每日飲水量：體重 × 60ml </span>
            </p>
          </div>

          <!-- 3. 進食量輸入框 -->
          <div class="form-group">
            <label class="form-label">🥣 進食量（g）</label>
            <input
              type="number"
              v-model="metricValueFood"
              placeholder="例：250"
              class="form-input"
            />
          </div>

          <!-- 4. 排泄次數快捷按鈕區 -->
          <div class="form-group">
            <label class="form-label">💩 排泄次數（今日）</label>
            <div class="flex-buttons-row">
              <button
                v-for="option in poopOptions"
                :key="option"
                type="button"
                class="square-tab-btn"
                :class="{ 'is-active': metricValuePoop === option }"
                @click="metricValuePoop = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- 5 便便狀態快捷按鈕區 -->
          <div class="form-group">
            <label class="form-label">💩 便便狀態</label>
            <div class="flex-buttons-row">
              <button
                v-for="status in poopStatusOptions"
                :key="status.label"
                type="button"
                class="mood-tab-btn"
                :class="{ 'is-active': statusNotePoop === status.label }"
                @click="statusNotePoop = status.label"
              >
                {{ status.emoji }} {{ status.label }}
              </button>
            </div>
          </div>

          <!-- 6. 精神狀態快捷按鈕區 -->
          <div class="form-group">
            <label class="form-label">✨ 今日精神狀態</label>
            <div class="flex-buttons-row">
              <button
                v-for="status in statusOptions"
                :key="status.label"
                type="button"
                class="mood-tab-btn"
                :class="{ 'is-active': statusNoteMood === status.label }"
                @click="statusNoteMood = status.label"
              >
                {{ status.emoji }} {{ status.label }}
              </button>
            </div>
          </div>

          <!-- 7. 活動量快捷按鈕區 -->
          <div class="form-group">
            <label class="form-label">🏃 活動量</label>
            <div class="flex-buttons-row">
              <button
                v-for="act in activityOptions"
                :key="act.label"
                type="button"
                class="square-tab-btn"
                :class="{ 'is-active': statusNoteActivity === act.label }"
                @click="statusNoteActivity = act.label"
              >
                {{ act.emoji }} {{ act.label }}
              </button>
            </div>
          </div>

          <!-- 8. 備註說明 -->
          <div class="form-group" style="margin-bottom: 20px">
            <label class="form-label">📝 備註說明 (選填)</label>
            <textarea
              v-model="statusNoteExtra"
              placeholder="例：今天便便有點軟，下午出門散步..."
              class="form-input"
              :class="{ 'is-focused': isNoteFocused }"
              style="
                width: 100%;
                height: 42px;
                min-height: 42px;
                max-height: 42px;
                resize: none;
                font-size: 14px;
                padding: 10px 12px;
                box-sizing: border-box;
                display: block;
                font-family: inherit;
                transition:
                  border-color 0.2s,
                  box-shadow 0.2s;
              "
              @focus="isNoteFocused = true"
              @blur="isNoteFocused = false"
            ></textarea>
          </div>

          <!-- 提交按鈕 -->
          <button class="submit-record-btn" @click="handleSubmitRecord">
            儲存今日紀錄
          </button>

          <p class="last-update-time">最後更新時間：{{ updatedAt }}</p>
        </div>
      </div>

      <!-- 【右側區塊】：數據摘要卡片 + 體重折線圖 + 飲食雙長條圖 -->
      <div class="right-charts-panel">
        <!-- 上方：三個數據摘要卡片並排 -->
        <!--遍歷一個名為 healthStatsSummary 的陣列（裡面包含體重、飲水等資料物件）-->
        <div class="status-summary-cards-grid">
          <div
            v-for="stat in healthStatsSummary"
            :key="stat.label"
            class="pawcare-card summary-item-card"
          >
            <div class="summary-card-top">
              <div
                class="summary-icon-box"
                :style="{ backgroundColor: stat.bgColor, color: stat.color }"
              >
                {{ stat.emoji }}
              </div>
              <span
                v-if="stat.trend === 'up'"
                class="trend-indicator text-success"
              ></span>
              <span
                v-else-if="stat.trend === 'down'"
                class="trend-indicator text-danger"
              ></span>
              <span
                v-else-if="stat.trend === 'neutral'"
                class="trend-indicator text-muted"
              ></span>
              <span v-else class="trend-indicator text-success"></span>
            </div>
            <!-- 顯示主要數值（如：13.6 kg、480 ml） -->
            <div class="summary-value" :style="{ color: stat.color }">
              {{ stat.value }}
            </div>
            <!-- 顯示項目名稱（如：目前體重、今日飲水） -->
            <div class="summary-label">{{ stat.label }}</div>
            <!-- 顯示補充說明（如：比昨天多 50ml、狀態正常） -->
            <div class="summary-subtext">{{ stat.sub }}</div>
          </div>
        </div>

        <!-- 警示與建議卡片和醫護提醒快訊區 -->
        <div class="insights-reminders-container">
          <!-- 左側：警示與建議卡片 -->
          <div class="insights-card">
            <!-- 體重提醒（動態顯示） -->
            <div class="insight-item" :class="weightInsight.type">
              <span class="insight-icon">{{ weightInsight.icon }}</span>
              <div class="insight-content">
                <h4>體重狀態</h4>
                <p>{{ weightInsight.text }}</p>
              </div>
            </div>

            <!-- 照護建議 / 飲水狀態（動態顯示） -->
            <div class="insight-item" :class="waterInsight.type">
              <span class="insight-icon">{{ waterInsight.icon }}</span>
              <div class="insight-content">
                <h4>飲水狀態</h4>
                <p>{{ waterInsight.text }}</p>
              </div>
            </div>
          </div>
          <!-- 右側：醫護提醒快訊區 -->
          <div class="reminders-card">
            <div class="reminder-item">
              <h4>疫苗進度</h4>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 60%"></div>
              </div>
              <p>距離下次狂犬病疫苗還有 15 天</p>
            </div>
            <div class="reminder-item">
              <h4>驅蟲提醒</h4>
              <p>下次日期：6/25</p>
            </div>
          </div>
        </div>

        <!-- 中間：體重變化趨勢圖表盒（內含時間範圍切換按鈕） -->
        <div class="pawcare-card chart-container-card" style="margin-top: 1rem">
          <div class="chart-header-row">
            <div>
              <h3 class="chart-box-title">體重變化趨勢</h3>
            </div>

            <!-- 週/月/年 時間篩選器切換 -->
            <div class="time-range-selector">
              <button
                v-for="range in ['week', 'month', 'year']"
                :key="range"
                class="range-btn"
                :class="{ 'is-active': currentTimeRange === range }"
                @click="currentTimeRange = range"
              >
                {{ range === "week" ? "週" : range === "month" ? "月" : "年" }}
              </button>
            </div>
          </div>

          <!-- 體重折線圖（Chart.js） -->
          <div
            class="chart-visual-wrapper"
            style="position: relative; height: 220px"
          >
            <canvas ref="weightChartCanvas"></canvas>
          </div>
        </div>

        <!-- 下方：本週飲食紀錄雙色並排長條圖 -->
        <div class="pawcare-card chart-container-card" style="margin-top: 1rem">
          <div class="chart-header-row">
            <h3 class="chart-box-title">本週飲食紀錄</h3>

            <!-- 圖例小貼紙說明 -->
            <div class="bar-chart-legend">
              <span class="legend-badge-item"
                ><i class="dot-g"></i> 飲水(ml)</span
              >
              <span class="legend-badge-item"
                ><i class="dot-o"></i> 進食(g)</span
              >
            </div>
          </div>

          <!-- 雙色長條圖-->
          <div class="bar-chart-visual-wrapper">
            <div class="bar-chart-y-axis">
              <span>600</span><span>400</span><span>200</span><span>0</span>
            </div>

            <div class="bar-chart-main-content">
              <!-- 跑迴圈依據數據比例動態長出長條柱 -->
              <div
                v-for="day in weeklyFoodWaterData"
                :key="day.date"
                class="bar-column-group"
              >
                <div class="bars-two-mix-stack">
                  <!-- 飲水柱狀體（綠色） -->
                  <div
                    class="single-bar water-bar"
                    :style="{ height: (day.water / 650) * 100 + '%' }"
                  >
                    <span class="bar-tooltip-val">{{ day.water }}ml</span>
                  </div>
                  <!-- 進食柱狀體（橘色） -->
                  <div
                    class="single-bar food-bar"
                    :style="{ height: (day.food / 650) * 100 + '%' }"
                  >
                    <span class="bar-tooltip-val">{{ day.food }}g</span>
                  </div>
                </div>
                <!-- 底部日期 -->
                <div class="bar-x-label">{{ day.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 歷史健康日誌 -->
    <div class="history-log-card">
      <h3>📜 歷史健康日誌</h3>

      <!-- 捲軸滾動區域 -->
      <div class="history-log-scroll-area">
        <div class="health-timeline">
          <!-- 透過 v-for 迴圈動態渲染出 5 筆紀錄 + 用戶新增的紀錄 -->
          <div
            v-for="log in historyLogs"
            :key="log.id"
            class="health-timeline-item"
            :class="{ 'status-alert': log.isAlert }"
          >
            <div class="timeline-left-axis">
              <div class="timeline-line"></div>
              <div class="health-timeline-dot"></div>
            </div>
            <div class="health-timeline-info">
              <div class="health-timeline-date">{{ log.date }}</div>

              <div class="health-log-badges">
                <span class="log-badge badge-weight"
                  >⚖️ {{ log.weight }} kg</span
                >

                <!-- 飲水標籤：若低於標準自動帶入 alert 樣式 -->
                <span
                  class="log-badge badge-water"
                  :class="{ alert: log.isWaterAlert }"
                >
                  💧 飲水 {{ log.water }} ml
                </span>

                <span class="log-badge badge-food"
                  >🍖 進食 {{ log.food }} g</span
                >

                <!-- 便便標籤：若狀態異常自動帶入 alert 樣式 -->
                <span
                  class="log-badge badge-stool"
                  :class="{ alert: log.isPoopAlert }"
                >
                  💩 便便 {{ log.poopCount }}次 ({{ log.poopStatus }})
                </span>
              </div>

              <div class="health-log-badges" style="margin-top: 2px">
                <span class="log-badge badge-status"
                  >✨ 精神：{{ log.mood }}</span
                >
                <span class="log-badge badge-activity"
                  >⚡ 活動量：{{ log.activity }}</span
                >
              </div>
              <p class="health-log-memo">
                {{ log.memo }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import instance from "@/plugins/axios.js";
import useUserStore from "@/stores/user.js";
import Chart from "chart.js/auto";
import "@/css/medical/medical-health-tracking.css";
import healthBannerImg from "@/images/health-tracking-banner.jpg";

// ── 圖片路徑 ────────────────────────────────────────────
const healthBanner = ref(healthBannerImg);

// ── 寵物基本資料（對應 Pet 表）──────────────────────────
const name = ref("小福"); // Pet.name

// ── 備註框 focus 狀態 ────────────────────────────────────
const isNoteFocused = ref(false);

// ── 切換寵物 ────────────────────────────────────
const userStore = useUserStore();

// 算出目前要用的 petId（優先 selectPetId，沒有就用 pets[0]）
const currentPetId = computed(() => {
  if (userStore.selectPetId) return userStore.selectPetId;
  if (userStore.pets.length > 0) return userStore.pets[0].id;
  return null;
});

// ==========================================================================
// 1. 左側表單：各欄位獨立 ref（對應 PetHealthTracking 欄位）
// ==========================================================================

const metricValueWeight = ref(""); // 體重（kg）   → PetHealthTracking.metricValue
const metricValueWater = ref(""); // 飲水量（ml）  → PetHealthTracking.metricValue
const metricValueFood = ref(""); // 進食量（g）   → PetHealthTracking.metricValue
const metricValuePoop = ref("0"); // 排泄次數      → PetHealthTracking.metricValue（預設 1 次）
const statusNotePoop = ref("正常"); // 便便狀態      → PetHealthTracking.statusNote
const statusNoteMood = ref("很好"); // 精神狀態      → PetHealthTracking.statusNote（預設很好）
const statusNoteActivity = ref("低"); // 活動量        → PetHealthTracking.statusNote（預設中）
const statusNoteExtra = ref(""); // 備註說明      → PetHealthTracking.statusNote

// ── 最後更新時間（對應 PetHealthTracking.updatedAt）──────
const updatedAt = ref("2026/06/11 18:30");

// ── 喝水建議量 ──────
const recommendedWater = computed(() => {
  const weight = parseFloat(metricValueWeight.value);
  // 若未輸入或非數字，預設顯示 0
  if (isNaN(weight) || weight <= 0) return 0;

  // 計算體重 * 60，並四捨五入取到整數
  return Math.round(weight * 60);
});

// ── 快捷按鈕的靜態選項 ──────────────────────────────────
const poopOptions = ["0", "1", "2", "3", "4+"];

const poopStatusOptions = [
  { label: "正常", emoji: "" },
  { label: "軟便", emoji: "" },
  { label: "便秘", emoji: "" },
  { label: "拉肚子", emoji: "" },
];

const statusOptions = [
  { label: "很好", emoji: "" },
  { label: "普通", emoji: "" },
  { label: "不好", emoji: "" },
];

const activityOptions = [
  { label: "低", emoji: "" },
  { label: "中", emoji: "" },
  { label: "高", emoji: "" },
];

// ==========================================================================
// 2. 表單提交：儲存今日紀錄
// ==========================================================================
async function handleSubmitRecord() {
  // 1. 取得輸入值，若未輸入則帶入預設值（維持原本的預設值）
  const w = metricValueWeight.value || "13.6";
  const wt = metricValueWater.value || "480";
  const f = metricValueFood.value || "250";
  const n = statusNoteExtra.value || "無";

  // 2. 取得當下時間並格式化
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const formattedDate = `${year} / ${month} / ${date}`;
  updatedAt.value = `${year}/${month}/${date} ${hours}:${minutes}`;

  // 5. 串接 Java 後端

  // 5-1. 送出前先確認有沒有可用的寵物 id，沒有的話直接擋下來，不送 API
  if (!currentPetId.value) {
    alert("尚未選擇寵物，請先選擇寵物後再儲存紀錄！");
    return;
  }

  try {
    // PetHealthTracking 每種指標各存一列，搭配 typeId 區分
    // typeId 實際數字需跟後端確認 HealthMetricTypes 資料表內容
    const postData = {
      petId: currentPetId.value, // 優先用 selectPetId，沒有時頂著用 pets 第一筆
      weight: parseFloat(w),
      waterIntake: parseInt(wt),
      foodIntake: parseInt(f),
      excretionCount: metricValuePoop.value, // "0","1","2","3","4+"
      stoolStatus: statusNotePoop.value, // "正常","軟便"...
      mentalStatus: statusNoteMood.value, // "很好","普通","不好"
      activityLevel: statusNoteActivity.value, // "低","中","高"
      statusNote: statusNoteExtra.value,
    };
    // 呼叫 Java 後端 API
    const response = await instance.post(
      "/api/medical/health-tracking/daily-log",
      postData,
    );
    console.log("後端儲存成功:", response.data);

    // 存成功後，重新向後端查詢最新的歷史日誌，更新畫面上的「真實資料」區塊
    await fetchHistoryLogs();
  } catch (error) {
    console.error("後端儲存失敗:", error);
    alert("資料儲存至伺服器失敗，但已暫時更新於畫面。");
  }

  // 6. 彈出成功提示並清空備註欄
  alert(
    `今日健康紀錄已儲存！\n體重 ${w} kg · 飲水 ${wt} ml · 進食 ${f} g\n備註：${n}`,
  );
  statusNoteExtra.value = "";
}

// ==========================================================================
// 歷史健康日誌：假資料（展示用，固定保留 5 筆）+ 後端真實資料（動態查詢）
// ==========================================================================

// 固定保留的展示用假資料，畫面一開始就先顯示這 5 筆，維持畫面豐富度
const demoLogs = [
  {
    id: "demo-1",
    date: "2026 / 07 / 09",
    weight: "13.6",
    water: "500",
    food: "180",
    poopCount: "1",
    poopStatus: "正常",
    mood: "非常好",
    activity: "高 (散步1hr)",
    memo: "備註：今天小福下午有去公園跑跑，晚上散步回家喝水量很充足，胃口和食慾都非常好。",
    isAlert: false,
    isWaterAlert: false,
    isPoopAlert: false,
  },
  {
    id: "demo-2",
    date: "2026 / 07 / 08",
    weight: "13.5",
    water: "420",
    food: "120",
    poopCount: "2",
    poopStatus: "輕微軟便",
    mood: "輕微疲倦",
    activity: "中等",
    memo: "備註：早上大便型態稍微偏軟，食慾稍降，可能跟昨晚新開的副食罐頭有關，先持續觀察精神狀態。",
    isAlert: true,
    isWaterAlert: false,
    isPoopAlert: true,
  },
  {
    id: "demo-3",
    date: "2026 / 07 / 07",
    weight: "13.4",
    water: "310",
    food: "170",
    poopCount: "1",
    poopStatus: "正常",
    mood: "普通",
    activity: "偏低",
    memo: "備註：今天喝水量明顯低於每日建議量（310ml），主人加班較晚回家，晚上有額外在乾乾裡加水強迫補充。",
    isAlert: true,
    isWaterAlert: true,
    isPoopAlert: false,
  },
  {
    id: "demo-4",
    date: "2026 / 07 / 06",
    weight: "13.6",
    water: "650",
    food: "200",
    poopCount: "3",
    poopStatus: "正常",
    mood: "極度興奮",
    activity: "極高 (寵物泳池)",
    memo: "備註：週末帶小福去苗栗寵物泳池玩水，活動量消耗極大，因此飲水量與排泄次數都比平時顯著增加，晚上秒入睡。",
    isAlert: false,
    isWaterAlert: false,
    isPoopAlert: false,
  },
  {
    id: "demo-5",
    date: "2026 / 07 / 05",
    weight: "13.5",
    water: "480",
    food: "160",
    poopCount: "1",
    poopStatus: "稍微偏硬",
    mood: "良好",
    activity: "正常",
    memo: "備註：早上帶去快樂動物醫院進行皮膚科複診，醫生說傷口恢復得很好。回家後情緒穩定，下午進行了正常的例行性散步。",
    isAlert: false,
    isWaterAlert: false,
    isPoopAlert: false,
  },
];

// 從後端查回來的真實歷史紀錄，會顯示在假資料的「上方」（因為比較新）
const realLogs = ref([]);

// 畫面實際顯示用的清單 = 真實資料（新） + 假資料（展示用，固定墊底）
const historyLogs = computed(() => [...realLogs.value, ...demoLogs]);

/**
 * 把後端回傳的一筆 PetDailyLogResponse，轉成前端畫面需要的格式
 */
function mapResponseToLog(item) {
  // 後端的 recordDate 是 "yyyy-MM-ddTHH:mm:ss" 格式的字串，轉成跟假資料一樣的顯示格式
  const d = new Date(item.recordDate);
  const formattedDate = `${d.getFullYear()} / ${String(d.getMonth() + 1).padStart(2, "0")} / ${String(d.getDate()).padStart(2, "0")}`;

  const water = item.water != null ? Number(item.water) : 0;
  const waterAlarm = water > 0 && water < 350;
  const poopAlarm = item.poopStatus === "軟便" || item.poopStatus === "拉肚子";

  return {
    id: item.recordId,
    date: formattedDate,
    weight: item.weight != null ? item.weight : "-",
    water: item.water != null ? item.water : "-",
    food: item.food != null ? item.food : "-",
    poopCount: item.poopCount != null ? item.poopCount : "-",
    poopStatus: item.poopStatus || "-",
    mood: item.mood || "-",
    activity: item.activity || "-",
    memo: item.memo ? `備註：${item.memo}` : "無備註說明。",
    isAlert: waterAlarm || poopAlarm,
    isWaterAlert: waterAlarm,
    isPoopAlert: poopAlarm,
  };
}

/**
 * 向後端查詢目前寵物的歷史健康日誌，並更新 realLogs
 */
async function fetchHistoryLogs() {
  if (!currentPetId.value) return; // 還沒有可用的寵物 id，先不查

  try {
    const response = await instance.get(
      `/api/medical/health-tracking/${currentPetId.value}`,
    );
    realLogs.value = response.data.map(mapResponseToLog);

    // 查詢結果依時間新到舊排序，所以第一筆就是「最新一筆紀錄」
    // 用它的時間更新「最後更新時間」欄位，這樣重新整理後也能顯示正確的時間，而不是寫死的初始值
    if (response.data.length > 0) {
      const latest = new Date(response.data[0].recordDate);
      const y = latest.getFullYear();
      const m = String(latest.getMonth() + 1).padStart(2, "0");
      const d = String(latest.getDate()).padStart(2, "0");
      const h = String(latest.getHours()).padStart(2, "0");
      const min = String(latest.getMinutes()).padStart(2, "0");
      updatedAt.value = `${y}/${m}/${d} ${h}:${min}`;
    }
  } catch (error) {
    console.error("查詢歷史健康日誌失敗:", error);
    // 查詢失敗時不影響畫面，假資料仍會正常顯示
  }
}

// 頁面一打開就自動查一次歷史紀錄
onMounted(() => {
  fetchHistoryLogs();
});

// ==========================================================================
// 左側警示與建議卡片動態綁定資料
// ==========================================================================

// ── 體重動態提示邏輯 ──
const weightInsight = computed(() => {
  const weight = parseFloat(metricValueWeight.value);

  // 1. 欄位為空或小於等於 0
  if (isNaN(weight) || weight <= 0) {
    return {
      type: "tip",
      icon: "💡",
      text: `請輸入今日體重，系統將為您追蹤 ${name.value} 的健康趨勢。`,
    };
  }

  // 2. 基準體重：直接採用handleSubmitRecord 定義的預設值 13.6
  const baseWeight = 13.6;
  const diffPercent = ((weight - baseWeight) / baseWeight) * 100;

  // 3. 波動超過 3% 顯示警告
  if (Math.abs(diffPercent) >= 3) {
    return {
      type: "warning",
      icon: "⚠️",
      text: `注意！與歷史體重 13.6kg 相比，今日波動 (${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(1)}%) 超過 3%，建議觀察食慾。`,
    };
  }

  // 4. 正常穩定狀態
  return {
    type: "tip",
    icon: "✅",
    text: "目前體重維持在正常範圍內，請繼續保持。",
  };
});

// ── 飲水量動態提示 ──
const waterInsight = computed(() => {
  const weight = parseFloat(metricValueWeight.value);
  const water = parseFloat(metricValueWater.value);

  // 1. 如果體重或飲水尚未填寫
  if (isNaN(weight) || weight <= 0 || isNaN(water) || water <= 0) {
    return {
      type: "tip",
      icon: "💡",
      text: "請填寫體重與今日飲水量，系統將自動評估水分攝取是否達標。",
    };
  }

  // 2. 使用上方已經算好的建議量 (weight * 60)
  const targetWater = recommendedWater.value;

  // 3. 判斷是否達標
  if (water >= targetWater) {
    return {
      type: "tip",
      icon: "🎉",
      text: `今日飲水量達標 (${water}ml / 建議 ${targetWater}ml)，表現很棒！`,
    };
  } else {
    const missing = targetWater - water;
    return {
      type: "warning",
      icon: "⚠️",
      text: `水分攝取不足！距離今日目標還差 ${missing}ml，建議適度引導寵物喝水。`,
    };
  }
});

// ==========================================================================
// 3. 右側圖表：體重變化趨勢（Chart.js + 後端真實資料）
// ==========================================================================
const currentTimeRange = ref("week"); // 預設顯示週視圖

// canvas 元素的 template ref，Chart.js 需要綁定在真實 DOM 上
const weightChartCanvas = ref(null);
// 保存目前的 Chart.js 實例，之後切換時間範圍要先銷毀舊圖表再畫新的，避免疊圖
let weightChartInstance = null;

// 體重趨勢方向（給「體重狀態」摘要卡片用）："up" | "down" | "flat" | "insufficient"
const weightTrend = ref("insufficient");

/**
 * 向後端查詢體重變化趨勢資料，並重新繪製 Chart.js 圖表
 */
async function fetchWeightChart() {
  if (!currentPetId.value || !weightChartCanvas.value) return;

  try {
    const response = await instance.get(
      `/api/medical/health-tracking/${currentPetId.value}/weight-chart`,
      { params: { range: currentTimeRange.value } },
    );

    const points = response.data; // [{ label, weight }, ...]
    const labels = points.map((p) => p.label);
    const weights = points.map((p) => p.weight); // null 的部分 Chart.js 會自動斷線

    renderWeightChart(labels, weights);
  } catch (error) {
    console.error("查詢體重變化趨勢失敗:", error);
  }
}

/**
 * 獨立查詢「最近兩筆有效體重紀錄」，用來判斷體重狀態卡片的趨勢方向（上升/下降/持平）
 * 固定查過去 30 天（不受使用者切換 週/月/年 影響），確保「上次紀錄」是真的最近一次，
 * 而不是被使用者目前選的時間範圍意外影響到比較基準
 */
async function fetchWeightTrend() {
  if (!currentPetId.value) {
    weightTrend.value = "insufficient";
    return;
  }

  try {
    const response = await instance.get(
      `/api/medical/health-tracking/${currentPetId.value}/weight-chart`,
      { params: { range: "month" } },
    );

    // 篩掉沒紀錄的日期（weight 為 null），只保留真正有填寫的資料點
    const validPoints = response.data.filter(
      (p) => p.weight !== null && p.weight !== undefined,
    );

    if (validPoints.length < 2) {
      weightTrend.value = "insufficient"; // 資料不到兩筆，無法比較
      return;
    }

    // validPoints 依時間由舊到新排序，所以最後兩筆就是「最新一筆」與「上一筆」
    const latest = Number(validPoints[validPoints.length - 1].weight);
    const previous = Number(validPoints[validPoints.length - 2].weight);

    if (latest > previous) {
      weightTrend.value = "up";
    } else if (latest < previous) {
      weightTrend.value = "down";
    } else {
      weightTrend.value = "flat";
    }
  } catch (error) {
    console.error("查詢體重趨勢失敗:", error);
    weightTrend.value = "insufficient";
  }
}

/**
 * 用 Chart.js 畫出（或重新畫出）體重趨勢折線圖
 */
function renderWeightChart(labels, weights) {
  // 切換時間範圍時，先銷毀舊圖表實例，避免畫面疊加殘影
  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  weightChartInstance = new Chart(weightChartCanvas.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "體重 (kg)",
          data: weights,
          borderColor: "#7bb3d4",
          backgroundColor: "#7bb3d4",
          spanGaps: false, // 關鍵設定：遇到 null 值時折線斷開，不連接前後兩點
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#7bb3d4",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: false, // 不強制從 0 開始，讓 Chart.js 依實際資料自動決定合適的範圍
        },
      },
    },
  });
}

// ── 本週飲食紀錄長條圖專用假資料（這次體重圖改接後端，但飲食長條圖暫不在本次調整範圍內，先維持原樣）─────
const weeklyFoodWaterData = ref([
  { date: "週一", water: 520, food: 250 },
  { date: "週二", water: 480, food: 240 },
  { date: "週三", water: 600, food: 260 },
  { date: "週四", water: 550, food: 250 },
  { date: "週五", water: 480, food: 250 },
  { date: "週六", water: 620, food: 270 },
  { date: "週日", water: 480, food: 250 },
]);

// 頁面載入完成後，畫出預設（週）的體重趨勢圖，並計算體重狀態卡片用的趨勢方向
onMounted(() => {
  fetchWeightChart();
  fetchWeightTrend();
});

// 使用者點擊 週/月/年 按鈕、currentTimeRange 改變時，重新查詢並重繪圖表
// 注意：weightTrend（體重狀態卡片）固定看「近30天」，不受這個切換影響，所以這裡不需要呼叫 fetchWeightTrend
watch(currentTimeRange, () => {
  fetchWeightChart();
});

// 切換寵物時，currentPetId 改變，連帶重新查詢這隻寵物的體重趨勢圖、體重狀態、歷史日誌
watch(currentPetId, () => {
  fetchWeightChart();
  fetchWeightTrend();
  fetchHistoryLogs();
});

// ==========================================================================
// 4. 體重狀態卡片：顯示「跟上次紀錄相比」的趨勢方向（不做理想範圍判斷）
// ==========================================================================
const currentWeight = 13.6; // 「當前體重」卡片使用，實際串接時改為從 Pet API 取得的 weight

// 依 weightTrend（up / down / flat / insufficient）決定卡片顯示的文字
const statusLabel = computed(() => {
  if (weightTrend.value === "up") return "上升";
  if (weightTrend.value === "down") return "下降";
  if (weightTrend.value === "flat") return "持平";
  return "資料不足";
});

// 顏色維持中性色調，因為「上升/下降」本身不代表好壞，不適合用紅色/橘色暗示警示
const statusColor = "#7bb3d4";
const statusBg = "rgba(123, 179, 212, 0.15)";

// 卡片下方補充說明文字
const statusSub = computed(() => {
  if (weightTrend.value === "insufficient") return "尚無足夠紀錄";
  return "與上次記錄相比";
});

// 右側三大健康摘要小卡資料
const healthStatsSummary = computed(() => [
  {
    label: "當前體重",
    value: currentWeight + " kg",
    sub: "上週 +0.1kg",
    emoji: "⚖️",
    color: "#7bb3d4",
    bgColor: "rgba(123, 179, 212, 0.15)",
    trend: "up",
  },
  {
    label: "飲水達成率",
    value: "80%",
    sub: "480/600 ml",
    emoji: "💧",
    color: "#6bae8a",
    bgColor: "rgba(107, 174, 138, 0.15)",
    trend: "neutral",
  },
  {
    label: "體重狀態",
    value: statusLabel.value,
    sub: statusSub.value,
    emoji: "🐕",
    color: statusColor,
    bgColor: statusBg,
    trend: "ok",
  },
]);
</script>
