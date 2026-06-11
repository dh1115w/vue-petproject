<template>
  <!-- 最外層容器，自帶頁面淡入動畫 -->
  <div class="tracking-container page-container page-enter">
    <!-- 健康追蹤 Banner (標題已移入下方) -->
    <div class="health-tracking-banner">
      <img
        src="@/images/health-tracking-banner.jpg"
        alt="健康追蹤 Banner"
        class="banner-image"
      />

      <!-- 頁面頂部標頭 (絕對定位在圖片左上角) -->
      <header class="tracking-header">
        <h1>健康狀態追蹤</h1>
        <p class="subtitle">記錄小福的每日健康數據，掌握長期趨勢變化</p>
      </header>
    </div>

    <!-- 主排版區：採用標準 Grid 網格佈局（左側輸入表單 + 右側圖表區） -->
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
              v-model="formData.weight"
              placeholder="例：13.6"
              class="form-input"
            />
          </div>

          <!-- 2. 飲水量輸入框 -->
          <div class="form-group">
            <label class="form-label">💧 飲水量（ml）</label>
            <input
              type="number"
              v-model="formData.water"
              placeholder="例 : 480"
              class="form-input"
            />
            <p class="input-tip-text">建議每日 600ml（體重 × 44ml）</p>
          </div>

          <!-- 3. 進食量輸入框 -->
          <div class="form-group">
            <label class="form-label">🥣 進食量（g）</label>
            <input
              type="number"
              v-model="formData.food"
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
                :class="{ 'is-active': formData.poop === option }"
                @click="formData.poop = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- 4.5 便便狀態快捷按鈕區 -->
          <div class="form-group">
            <label class="form-label">💩 便便狀態</label>
            <div class="flex-buttons-row">
              <button
                v-for="status in poopStatusOptions"
                :key="status.label"
                type="button"
                class="mood-tab-btn"
                :class="{ 'is-active': formData.poopStatus === status.label }"
                @click="formData.poopStatus = status.label"
              >
                {{ status.emoji }} {{ status.label }}
              </button>
            </div>
          </div>

          <!-- 5. 精神狀態快捷按鈕區 -->
          <div class="form-group">
            <label class="form-label">✨ 今日精神狀態</label>
            <div class="flex-buttons-row">
              <button
                v-for="status in statusOptions"
                :key="status.label"
                type="button"
                class="mood-tab-btn"
                :class="{ 'is-active': formData.mood === status.label }"
                @click="formData.mood = status.label"
              >
                {{ status.emoji }} {{ status.label }}
              </button>
            </div>
          </div>

          <!-- 5.5 活動量快捷按鈕區 (新增豐富版面) -->
          <div class="form-group">
            <label class="form-label">🏃 活動量</label>
            <div class="flex-buttons-row">
              <button
                v-for="act in activityOptions"
                :key="act.label"
                type="button"
                class="square-tab-btn"
                :class="{ 'is-active': formData.activity === act.label }"
                @click="formData.activity = act.label"
              >
                {{ act.emoji }} {{ act.label }}
              </button>
            </div>
          </div>

          <!-- 6. 備註說明  -->
          <div class="form-group" style="margin-bottom: 20px">
            <label class="form-label">📝 備註說明 (選填)</label>
            <textarea
              v-model="formData.note"
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
        </div>
      </div>

      <!-- 【右側區塊】：數據摘要卡片 + 體重折線圖 + 飲食雙長條圖 -->
      <div class="right-charts-panel">
        <!-- 上方：三個數據摘要卡片並排 -->
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
                >📉</span
              >
              <span
                v-else-if="stat.trend === 'neutral'"
                class="trend-indicator text-muted"
              ></span>
              <span v-else class="trend-indicator text-success"></span>
            </div>
            <div class="summary-value" :style="{ color: stat.color }">
              {{ stat.value }}
            </div>
            <div class="summary-label">{{ stat.label }}</div>
            <div class="summary-subtext">{{ stat.sub }}</div>
          </div>
        </div>

        <!-- 新增：警示與建議卡片和醫護提醒快訊區 -->
        <div class="insights-reminders-container">
          <!-- 左側：警示與建議卡片 -->
          <div class="insights-card">
            <div class="insight-item warning">
              <span class="insight-icon">⚠️</span>
              <div class="insight-content">
                <h4>體重提醒</h4>
                <p>發現本週體重波動超過 3%，建議觀察食慾。</p>
              </div>
            </div>
            <div class="insight-item tip">
              <span class="insight-icon">💡</span>
              <div class="insight-content">
                <h4>照護建議</h4>
                <p>今日飲水量剛好達標，表現很棒！</p>
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

          <!-- 使用純 SVG 向量圖形畫出來的高質感體重折線圖 (100% 免套件) -->
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

              <!-- 體重趨勢主折線 (SVG Polyline) -->
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
              <circle
                cx="470"
                cy="70"
                r="5"
                fill="#7bb3d4"
                stroke="#fff"
                stroke-width="2"
              />
              <!-- 點中的最新體重節點 -->

              <!-- X 軸底部日期文字刻度 -->
              <text
                v-for="(d, idx) in [
                  '3/1',
                  '3/8',
                  '3/15',
                  '3/22',
                  '3/29',
                  '4/5',
                  '4/12',
                  '4/19',
                ]"
                :key="idx"
                :x="50 + idx * 60"
                y="165"
                text-anchor="middle"
                font-size="11"
                fill="#9c9e98"
              >
                {{ d }}
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

          <!-- 使用純 HTML CSS Flexbox 直覺呈現的雙色極簡長條圖 (100% 免套件) -->
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

      <!-- 輕量化蘋果風捲軸滾動區域 -->
      <div class="history-log-scroll-area">
        <div class="health-timeline">
          <!-- 📌 紀錄 1：最新狀態（2026/04/22）- 數據指標全滿且正常 -->
          <div class="health-timeline-item">
            <div class="timeline-left-axis">
              <div class="timeline-line"></div>
              <div class="health-timeline-dot"></div>
            </div>
            <div class="health-timeline-info">
              <div class="health-timeline-date">2026 / 04 / 22</div>

              <div class="health-log-badges">
                <span class="log-badge badge-weight">⚖️ 13.6 kg</span>
                <span class="log-badge badge-water">💧 飲水 500 ml</span>
                <span class="log-badge badge-food">🍖 進食 180 g</span>
                <span class="log-badge badge-stool">💩 便便 1次 (正常)</span>
              </div>
              <div class="health-log-badges" style="margin-top: 2px">
                <span class="log-badge badge-status">✨ 精神：非常好</span>
                <span class="log-badge badge-activity"
                  >⚡ 活動量：高 (散步1hr)</span
                >
              </div>

              <p class="health-log-memo">
                備註：今天小福下午有去公園跑跑，晚上散步回家喝水量很充足，胃口和食慾都非常好。
              </p>
            </div>
          </div>

          <!-- 📌 紀錄 2：腸域異常狀態（2026/04/21）- 觸發 status-alert 警告色 -->
          <div class="health-timeline-item status-alert">
            <div class="timeline-left-axis">
              <div class="timeline-line"></div>
              <div class="health-timeline-dot"></div>
            </div>
            <div class="health-timeline-info">
              <div class="health-timeline-date">2026 / 04 / 21</div>

              <div class="health-log-badges">
                <span class="log-badge badge-weight">⚖️ 13.5 kg</span>
                <span class="log-badge badge-water">💧 飲水 420 ml</span>
                <span class="log-badge badge-food">🍖 進食 120 g</span>
                <span class="log-badge badge-stool alert"
                  >💩 便便 2次 (輕微軟便)</span
                >
              </div>
              <div class="health-log-badges" style="margin-top: 2px">
                <span class="log-badge badge-status">✨ 精神：輕微疲倦</span>
                <span class="log-badge badge-activity">⚡ 活動量：中等</span>
              </div>

              <p class="health-log-memo">
                備註：早上大便型態稍微偏軟，食慾稍降，可能跟昨晚新開的副食罐頭有關，先持續觀察精神狀態。
              </p>
            </div>
          </div>

          <!-- 📌 紀錄 3：脫水預警狀態（2026/04/20）- 飲水量偏低提示，觸發 status-alert -->
          <div class="health-timeline-item status-alert">
            <div class="timeline-left-axis">
              <div class="timeline-line"></div>
              <div class="health-timeline-dot"></div>
            </div>
            <div class="health-timeline-info">
              <div class="health-timeline-date">2026 / 04 / 20</div>

              <div class="health-log-badges">
                <span class="log-badge badge-weight">⚖️ 13.4 kg</span>
                <span class="log-badge badge-water alert">💧 飲水 310 ml</span>
                <span class="log-badge badge-food">🍖 進食 170 g</span>
                <span class="log-badge badge-stool">💩 便便 1次 (正常)</span>
              </div>
              <div class="health-log-badges" style="margin-top: 2px">
                <span class="log-badge badge-status">✨ 精神：普通</span>
                <span class="log-badge badge-activity">⚡ 活動量：偏低</span>
              </div>

              <p class="health-log-memo">
                備註：今天喝水量明顯低於每日建議量（310ml），主人加班較晚回家，晚上有額外在乾乾裡加水強迫補充。
              </p>
            </div>
          </div>

          <!-- 📌 紀錄 4：週末出遊高峰（2026/04/19）- 運動量與排泄次數大增 -->
          <div class="health-timeline-item">
            <div class="timeline-left-axis">
              <div class="timeline-line"></div>
              <div class="health-timeline-dot"></div>
            </div>
            <div class="health-timeline-info">
              <div class="health-timeline-date">2026 / 04 / 19</div>

              <div class="health-log-badges">
                <span class="log-badge badge-weight">⚖️ 13.6 kg</span>
                <span class="log-badge badge-water">💧 飲水 650 ml</span>
                <span class="log-badge badge-food">🍖 進食 200 g</span>
                <span class="log-badge badge-stool">💩 便便 3次 (正常)</span>
              </div>
              <div class="health-log-badges" style="margin-top: 2px">
                <span class="log-badge badge-status">✨ 精神：極度興奮</span>
                <span class="log-badge badge-activity"
                  >⚡ 活動量：極高 (寵物泳池)</span
                >
              </div>

              <p class="health-log-memo">
                備註：週末帶小福去苗栗寵物泳池玩水，活動量消耗極大，因此飲水量與排泄次數都比平時顯著增加，晚上秒入睡。
              </p>
            </div>
          </div>

          <!-- 📌 紀錄 5：醫院回診追蹤（2026/04/18）- 體重觀察正常 -->
          <div class="health-timeline-item">
            <div class="timeline-left-axis">
              <div class="timeline-line"></div>
              <div class="health-timeline-dot"></div>
            </div>
            <div class="health-timeline-info">
              <div class="health-timeline-date">2026 / 04 / 18</div>

              <div class="health-log-badges">
                <span class="log-badge badge-weight">⚖️ 13.5 kg</span>
                <span class="log-badge badge-water">💧 飲水 480 ml</span>
                <span class="log-badge badge-food">🍖 進食 160 g</span>
                <span class="log-badge badge-stool"
                  >💩 便便 1次 (稍微偏硬)</span
                >
              </div>
              <div class="health-log-badges" style="margin-top: 2px">
                <span class="log-badge badge-status">✨ 精神：良好</span>
                <span class="log-badge badge-activity">⚡ 活動量：正常</span>
              </div>

              <p class="health-log-memo">
                備註：早上帶去快樂動物醫院進行皮膚科複診，醫生說傷口恢復得很好。回家後情緒穩定，下午進行了正常的例行性散步。
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

// ==========================================================================
// 1. 左側表單綁定數據物件（對應 v-model）
// ==========================================================================
const formData = ref({
  weight: "",
  water: "",
  food: "",
  poop: "1", // 預設選中 1 次
  poopStatus: "", // 便便狀態快捷選項的綁定值，預設為空（未選擇）
  mood: "很好", // 預設精神狀態很好
  activity: "中", // 新增：活動量快捷選項的綁定值，預設為「中」
  note: "", // 新增：用來綁定多行文字框的備註內容
});

// 快捷按鈕的靜態選項配置
const poopOptions = ["0", "1", "2", "3", "4+"];
const statusOptions = [
  { label: "很好", emoji: "😊" },
  { label: "普通", emoji: "😐" },
  { label: "不好", emoji: "😟" },
];

// 活動量快捷選項的靜態選項配置
const activityOptions = [
  { label: "低", emoji: "🛌" },
  { label: "中", emoji: "🚶" },
  { label: "高", emoji: "🏃" },
];

// 控制備註說明輸入框是否顯示的開關（預設隱藏）
const showNote = ref(false);

const poopStatusOptions = [
  { label: "正常", emoji: "👍" },
  { label: "軟便", emoji: "🟡" },
  { label: "便秘", emoji: "🟠" },
  { label: "拉肚子", emoji: "🔴" },
];

// ==========================================================================
// 2. 圖表時間篩選狀態（預設為 'week'，可切換為 'month' 或 'year'）
// ==========================================================================
const currentTimeRange = ref("week");

// ==========================================================================
// 3. 核心數據庫：週、月、年模擬歷史紀錄（完全同步你剛才提供的內容！）
// ==========================================================================
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

// 雙色長條圖專用數據（固定取當週飲食）
const weeklyFoodWaterData = ref(weeklyData);

// ==========================================================================
// 4. 動態計算屬性（當時間範圍按鈕切換時，折線圖的點位會全自動即時重算重新繪製！）
// ==========================================================================
const currentChartData = computed(() => {
  if (currentTimeRange.value === "week") return weeklyData;
  if (currentTimeRange.value === "month") return monthlyData;
  return yearlyData;
});

// 依據原檔核心邏輯，自動幫你計算小福當前的體重狀態
const currentWeight = 13.6;
const idealMin = 11;
const idealMax = 16;

const statusLabel = computed(() => {
  return currentWeight < idealMin
    ? "偏瘦"
    : currentWeight > idealMax
      ? "過重"
      : "正常";
});

const statusColor = computed(() => {
  return currentWeight < idealMin
    ? "#e29553"
    : currentWeight > idealMax
      ? "#df4733"
      : "#6bae8a";
});

const statusBg = computed(() => {
  return currentWeight < idealMin
    ? "rgba(226, 149, 83, 0.15)"
    : currentWeight > idealMax
      ? "rgba(223, 71, 51, 0.15)"
      : "rgba(107, 174, 138, 0.15)";
});

// 右側上方：三大健康數據摘要小卡片的聯動資料
const healthStatsSummary = computed(() => {
  return [
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
  ];
});

// ==========================================================================
// 5. 表單提交儲存紀錄函式
// ==========================================================================
function handleSubmitRecord() {
  const w = formData.value.weight || "13.6";
  const wt = formData.value.water || "480";
  const f = formData.value.food || "250";
  const n = formData.value.note || "無"; //新增：獲取備註內容，若為空則預設顯示「無」

  alert(
    `今日健康紀錄已儲存！\n體重 ${w} kg · 飲水 ${wt} ml · 進食 ${f} g\n備註：${n}`,
  );
}
</script>
