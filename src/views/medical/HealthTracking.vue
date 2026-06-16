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
              <p class="chart-box-subtitle">理想範圍：11 ~ 16 kg</p>
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

          <!-- 體重折線圖 -->
          <div class="chart-visual-wrapper">
            <svg class="line-chart-svg" viewBox="0 0 500 180">
              <!-- 背景參考虛線網格、偏瘦與過重臨界警示線 -->
              <line
                x1="40"
                y1="30"
                x2="480"
                y2="30"
                stroke="#df4733"
                stroke-dasharray="4 4"
                opacity="0.4"
              />
              <text x="485" y="34" font-size="10" fill="#df4733">
                過重(16kg)
              </text>

              <line
                x1="40"
                y1="130"
                x2="480"
                y2="130"
                stroke="#e29553"
                stroke-dasharray="4 4"
                opacity="0.4"
              />
              <text x="485" y="134" font-size="10" fill="#e29553">
                偏瘦(11kg)
              </text>

              <line
                x1="40"
                y1="80"
                x2="480"
                y2="80"
                stroke="#e6e3da"
                stroke-dasharray="3 3"
              />

              <!-- 體重趨勢主折線  -->
              <polyline
                fill="none"
                stroke="var(--primary)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="50,110 110,95 170,100 230,85 290,90 350,75 410,80 470,70"
              />

              <!-- 折線上的動態數據核心圓點群 -->
              <circle
                cx="50"
                cy="110"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <circle
                cx="110"
                cy="95"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <circle
                cx="170"
                cy="100"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <circle
                cx="230"
                cy="85"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <circle
                cx="290"
                cy="90"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <circle
                cx="350"
                cy="75"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <circle
                cx="410"
                cy="80"
                r="4"
                fill="var(--primary)"
                stroke="#fff"
                stroke-width="2"
              />
              <!-- 最新體重節點（藍色強調） -->
              <circle
                cx="470"
                cy="70"
                r="5"
                fill="#7bb3d4"
                stroke="#fff"
                stroke-width="2"
              />

              <!-- X 軸底部日期文字刻度 -->
              <text
                v-for="(d, idx) in currentChartData"
                :key="idx"
                :x="50 + idx * 60"
                y="165"
                text-anchor="middle"
                font-size="11"
                fill="#9c9e98"
              >
                {{ d.date }}
              </text>
            </svg>
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
import { ref, computed } from "vue";
import "@/css/medical/medical-health-tracking.css";
import healthBannerImg from "@/images/health-tracking-banner.jpg";

// ── 圖片路徑 ────────────────────────────────────────────
const healthBanner = ref(healthBannerImg);

// ── 寵物基本資料（對應 Pet 表）──────────────────────────
const name = ref("小福"); // Pet.name

// ── 備註框 focus 狀態 ────────────────────────────────────
const isNoteFocused = ref(false);

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

  // 3. 判斷這筆資料是否需要觸發警告樣式（例如飲水過低、便便異常）
  const waterAlarm = Number(wt) < 350;
  const poopAlarm =
    statusNotePoop.value === "偏軟" || statusNotePoop.value === "拉肚子";

  // 4. 建立新日誌物件，並動態推入右側歷史紀錄的最前面
  const newRecord = {
    id: Date.now(), // 暫時用時間戳當作前端 key
    date: formattedDate,
    weight: w,
    water: wt,
    food: f,
    poopCount: metricValuePoop.value || 0,
    poopStatus: statusNotePoop.value || "正常",
    mood: statusNoteMood.value || "非常好",
    activity: statusNoteActivity.value || "一般",
    memo: statusNoteExtra.value
      ? `備註：${statusNoteExtra.value}`
      : "無備註說明。",
    isAlert: waterAlarm || poopAlarm,
    isWaterAlert: waterAlarm,
    isPoopAlert: poopAlarm,
  };

  // 立即在前端畫面更新日誌
  historyLogs.value.unshift(newRecord);

  // 5. 串接 Java 後端

  try {
    // PetHealthTracking 每種指標各存一列，搭配 typeId 區分
    // typeId 實際數字需跟後端確認 HealthMetricTypes 資料表內容
    const postData = [
      { petId: 1, typeId: 1, metricValue: parseFloat(w),                    statusNote: "" },
      { petId: 1, typeId: 2, metricValue: parseInt(wt),                     statusNote: "" },
      { petId: 1, typeId: 3, metricValue: parseInt(f),                      statusNote: "" },
      { petId: 1, typeId: 4, metricValue: parseInt(metricValuePoop.value),  statusNote: `${statusNotePoop.value}|${statusNoteMood.value}|${statusNoteActivity.value}` },
      { petId: 1, typeId: 5, metricValue: 0,                                statusNote: statusNoteExtra.value },
    ];
    // 呼叫 Java 後端 API（typeId 數字接後端前需確認）
    // const response = await axios.post('/api/medical/health-tracking', postData);
    // console.log('後端儲存成功:', response.data);
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

//顯示歷史資料
const historyLogs = ref([
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
]);

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
// 3. 右側圖表：時間範圍切換
// ==========================================================================
const currentTimeRange = ref("week"); // 預設顯示週視圖

// ── 歷史模擬資料 ────────────────────────────────────────
const weeklyData = [
  { date: "週一", weight: 13.4, water: 520, food: 250 },
  { date: "週二", weight: 13.5, water: 480, food: 240 },
  { date: "週三", weight: 13.5, water: 600, food: 260 },
  { date: "週四", weight: 13.6, water: 550, food: 250 },
  { date: "週五", weight: 13.6, water: 480, food: 250 },
  { date: "週六", weight: 13.7, water: 620, food: 270 },
  { date: "週日", weight: 13.6, water: 480, food: 250 },
];

const monthlyData = [
  { date: "3/1", weight: 12.8 },
  { date: "3/8", weight: 13.1 },
  { date: "3/15", weight: 13.0 },
  { date: "3/22", weight: 13.3 },
  { date: "3/29", weight: 13.2 },
  { date: "4/5", weight: 13.5 },
  { date: "4/12", weight: 13.4 },
  { date: "4/19", weight: 13.6 },
];

const yearlyData = [
  { date: "1月", weight: 11.2 },
  { date: "2月", weight: 11.8 },
  { date: "3月", weight: 12.3 },
  { date: "4月", weight: 12.8 },
  { date: "5月", weight: 13.1 },
  { date: "6月", weight: 13.0 },
  { date: "7月", weight: 13.2 },
  { date: "8月", weight: 13.4 },
  { date: "9月", weight: 13.3 },
  { date: "10月", weight: 13.5 },
  { date: "11月", weight: 13.6 },
  { date: "12月", weight: 13.6 },
];

// 雙色長條圖專用（固定取當週飲食數據）
const weeklyFoodWaterData = ref(weeklyData);

// 折線圖 X 軸日期：依時間範圍自動切換
const currentChartData = computed(() => {
  if (currentTimeRange.value === "week") return weeklyData;
  if (currentTimeRange.value === "month") return monthlyData;
  return yearlyData;
});

// ==========================================================================
// 4. 體重狀態計算（對應 Pet.weight 理想區間判斷）
// ==========================================================================
const currentWeight = 13.6; // 實際串接時改為從 Pet API 取得的 weight
const idealMin = 11;
const idealMax = 16;

const statusLabel = computed(() => {
  if (currentWeight < idealMin) return "偏瘦";
  if (currentWeight > idealMax) return "過重";
  return "正常";
});

const statusColor = computed(() => {
  if (currentWeight < idealMin) return "#e29553";
  if (currentWeight > idealMax) return "#df4733";
  return "#6bae8a";
});

const statusBg = computed(() => {
  if (currentWeight < idealMin) return "rgba(226, 149, 83, 0.15)";
  if (currentWeight > idealMax) return "rgba(223, 71, 51, 0.15)";
  return "rgba(107, 174, 138, 0.15)";
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
    sub: "理想範圍內",
    emoji: "🐕",
    color: statusColor.value,
    bgColor: statusBg.value,
    trend: "ok",
  },
]);
</script>
