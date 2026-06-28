<template>
  <!-- 最外層容器 -->
  <div class="records-container page-enter">
    <!-- 病歷紀錄 Banner 區塊 -->
    <div class="medical-records-banner">
      <img
        src="@/images/medical-records-banner.jpg"
        alt="病歷紀錄 Banner"
        class="banner-image"
      />

      <!-- 頁面頂部標頭與按鈕 (移入 Banner 內部) -->
      <header class="records-header">
        <div class="header-text-group">
          <h1>病歷紀錄</h1>
          <p class="subtitle">管理小福的所有醫療紀錄與檢查報告</p>
        </div>

        <button class="add-record-top-btn" @click="handleRecordInfo">
          ＋ 新增病歷
        </button>
      </header>
    </div>

    <!-- AI 辨識確認表單（只在「有結果 且 還沒儲存」時顯示） -->
    <div v-if="parsedResult && !savedRecordId" class="ai-confirm-form-wrap">
      <div class="ai-confirm-form-card">
        <h3 class="ai-form-title">資訊結果確認</h3>
        <p class="ai-form-subtitle">
          請確認以下資訊是否正確，可直接修改後再儲存
        </p>

        <div class="ai-form-grid">
          <div class="ai-form-field">
            <label class="ai-form-label">診所名稱</label>
            <input
              class="ai-form-input"
              v-model="parsedResult.clinicName"
              placeholder="未辨識，請手動填寫"
            />
          </div>
          <div class="ai-form-field">
            <label class="ai-form-label">就診日期</label>
            <input
              class="ai-form-input"
              v-model="parsedResult.visitDate"
              placeholder="yyyy-MM-dd"
            />
          </div>
          <div class="ai-form-field">
            <label class="ai-form-label">獸醫師姓名</label>
            <input
              class="ai-form-input"
              v-model="parsedResult.vetName"
              placeholder="未辨識，請手動填寫"
            />
          </div>
          <div class="ai-form-field">
            <label class="ai-form-label">回診日期</label>
            <input
              class="ai-form-input"
              v-model="parsedResult.followUpDate"
              placeholder="yyyy-MM-dd"
            />
          </div>
          <div class="ai-form-field ai-form-field--full">
            <label class="ai-form-label">診斷結果</label>
            <textarea
              class="ai-form-textarea"
              v-model="parsedResult.diagnosis"
              placeholder="未辨識，請手動填寫"
              rows="3"
            ></textarea>
          </div>
          <div class="ai-form-field ai-form-field--full">
            <label class="ai-form-label">症狀描述</label>
            <textarea
              class="ai-form-textarea"
              v-model="parsedResult.symptoms"
              placeholder="未辨識，請手動填寫"
              rows="2"
            ></textarea>
          </div>
          <div class="ai-form-field">
            <label class="ai-form-label">藥物名稱</label>
            <input
              class="ai-form-input"
              v-model="parsedResult.medication"
              placeholder="未辨識"
            />
          </div>
          <div class="ai-form-field">
            <label class="ai-form-label">劑量與頻率</label>
            <input
              class="ai-form-input"
              v-model="parsedResult.dosage"
              placeholder="未辨識"
            />
          </div>
        </div>

        <!-- 按鈕列 -->
        <div class="ai-form-actions">
          <button class="ai-form-cancel-btn" @click="parsedResult = null">
            取消
          </button>
          <button class="ai-form-save-btn" @click="handleSaveRecord">
            確認儲存
          </button>
        </div>
      </div>
    </div>

    <!-- 健康建議區塊獨立在確認表單外，條件與 parsedResult 完全無關 -->
    <!-- isAnalyzing = true 時顯示「分析中」；healthAdvice 有內容時顯示建議 -->
    <div v-if="isAnalyzing || healthAdvice" class="ai-confirm-form-wrap">
      <div class="ai-confirm-form-card">
        <h3 class="ai-form-title">🐾 健康照護建議</h3>
        <p v-if="isAnalyzing && !healthAdvice" class="ai-form-subtitle">
          AI 分析中，請稍候...
        </p>
        <pre class="health-advice-text" style="white-space: pre-wrap">{{
          healthAdvice
        }}</pre>
      </div>
    </div>

    <!-- 主排版區：左側面板 + 右側列表區 -->
    <div class="records-main-grid stagger-children">
      <!-- ==========================================
           【左側欄】：上傳區 + 統計數
           ========================================== -->
      <div class="left-panel-column">
        <!-- 1. 拖曳檔案上傳虛線盒 -->
        <div
          class="pawcare-card upload-dashed-zone"
          :class="{ 'is-dragging': dragging }"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="handleFileDrop"
        >
          <div class="upload-content-wrapper">
            <div class="upload-icon-box" :class="{ 'icon-active': dragging }">
              📤
            </div>
            <p class="upload-main-text">拖曳檔案至此上傳</p>
            <p class="upload-sub-text">支援 PDF、JPG、PNG 格式，最大 20MB</p>

            <button
              class="select-file-btn"
              @click="handleFileSelect"
              :disabled="isParsingAI"
            >
              {{ isParsingAI ? "辨識中..." : "選擇檔案" }}
            </button>

            <!-- 隱藏的檔案選擇器 -->
            <input
              type="file"
              ref="fileInputRef"
              accept=".jpg,.jpeg,.png,.pdf"
              style="display: none"
              @change="handleFileChosen"
            />
          </div>
        </div>

        <!-- 全螢幕 loading 遮罩 -->
        <teleport to="body">
          <div v-if="isParsingAI" class="ai-fullscreen-overlay">
            <img
              src="@/images/loading-cat.gif"
              alt="AI 辨識中"
              class="ai-loading-gif"
            />
            <p class="ai-loading-text">AI 辨識中，請稍候...</p>
          </div>
        </teleport>

        <!-- 3. 紀錄類別分類統計小卡 -->
        <div class="pawcare-card">
          <h3 class="panel-small-title">紀錄統計</h3>
          <div class="stats-list-stack">
            <div
              v-for="(cfg, key) in typeConfig"
              :key="key"
              class="stat-row-item"
            >
              <div class="stat-icon-badge" :style="{ backgroundColor: cfg.bg }">
                {{ cfg.icon }}
              </div>
              <span class="stat-label-text">{{ cfg.label }}</span>
              <span class="stat-count-number" :style="{ color: cfg.color }">
                {{ getRecordCountByType(key) }} 筆
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================
           【右側欄】：搜尋欄 + 類別分頁切換按鈕區
           ========================================== -->
      <div class="right-list-column">
        <div class="pawcare-card filter-panel-card">
          <div class="search-bar-row">
            <div class="search-input-box">
              <span class="lens-icon">🔍</span>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="搜尋病歷名稱、診所..."
                class="records-search-input"
              />
            </div>
            <button class="filter-icon-btn">⚙️</button>
          </div>

          <!-- 分類分頁標籤切換按鈕群 -->
          <div class="tab-buttons-wrap">
            <button
              v-for="tab in filterTabsList"
              :key="tab.key"
              type="button"
              class="tab-pill-btn"
              :class="{ 'is-active': selectedTypeKey === tab.key }"
              @click="selectedTypeKey = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 【可摺疊式病歷卡片列表】 -->
        <div class="records-list-stack">
          <!-- 沒有資料時的提示 -->
          <div
            v-if="filteredRecords.length === 0"
            class="pawcare-card"
            style="text-align: center; padding: 32px; color: #999"
          >
            目前沒有符合條件的病歷紀錄
          </div>

          <div
            v-for="record in filteredRecords"
            :key="record.recordId"
            class="pawcare-card record-item-card"
          >
            <!-- 卡片頭部：點擊時切換展開/收合狀態 -->
            <div
              class="record-card-header"
              @click="toggleExpandRecord(record.recordId)"
            >
              <!-- 左側類別小圖示 -->
              <div
                class="record-type-icon"
                :style="{ backgroundColor: getEventConfig(record.fileType).bg }"
              >
                <span :style="{ color: getEventConfig(record.fileType).color }">
                  {{ getEventConfig(record.fileType).icon }}
                </span>
              </div>

              <!-- 中間核心欄位資訊 -->
              <div class="record-info-center">
                <div class="record-title-row">
                  <span class="record-main-title">{{ record.diagnosis }}</span>
                  <span
                    class="record-type-badge"
                    :style="{
                      backgroundColor: getEventConfig(record.fileType).bg,
                      color: getEventConfig(record.fileType).color,
                    }"
                  >
                    {{ getEventConfig(record.fileType).label }}
                  </span>
                </div>

                <!-- 診所、日期與檔案數小字 -->
                <div class="record-meta-row">
                  <span>🕒 {{ record.recordDate }}</span>
                  <span>🏥 {{ record.clinicName }}</span>
                  <span>📄 {{ record.exportCount }} 個檔案</span>
                </div>

                <!-- 內部關鍵字標籤貼紙 -->
                <div class="record-tags-box">
                  <span
                    v-for="tag in record.tags"
                    :key="tag"
                    class="record-mini-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 右側狀態與旋轉小箭頭 -->
              <div class="record-header-right">
                <span
                  :class="
                    record.status === '正常' ||
                    record.status === '完成' ||
                    record.status === '已康復'
                      ? 'status-badge-normal'
                      : 'status-badge-warning'
                  "
                >
                  {{ record.status }}
                </span>
                <span
                  class="chevron-arrow-icon"
                  :class="{
                    'is-rotated': expandedRecordId === record.recordId,
                  }"
                >
                  ▶
                </span>
              </div>
            </div>

            <!-- 當此卡片 ID 等於 expandedRecordId 時才渲染 -->
            <div
              v-if="expandedRecordId === record.recordId"
              class="record-expanded-drawer"
            >
              <p class="doctor-notes-text">
                <strong>醫師備註：</strong>{{ record.medicalHistory }}
              </p>

              <!-- 動作按鈕列 -->
              <div class="drawer-actions-row">
                <button class="drawer-view-btn" @click="handleViewFile(record)">
                  👁️ 查看
                </button>
                <button
                  class="drawer-download-btn"
                  @click="handleDownloadFile(record)"
                >
                  📥 下載
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "@/plugins/axios.js";
import "@/css/medical/medical-records.css";

// ==========================================================================
// 1. UI 互動狀態
// ==========================================================================
const searchQuery = ref("");
const selectedTypeKey = ref("all");
const expandedRecordId = ref(null);
const dragging = ref(false);

// AI 功能相關狀態
const fileInputRef = ref(null);
const isParsingAI = ref(false);
const parsedResult = ref(null);
const healthAdvice = ref("");
const savedRecordId = ref(null);
const isAnalyzing = ref(false); // 串流進行中的狀態

// ==========================================================================
// 2. 醫療紀錄五大類別設定檔
// ==========================================================================
const typeConfig = {
  checkup: {
    label: "健康檢查",
    icon: "🩺",
    color: "#7bb3d4",
    bg: "rgba(123, 179, 212, 0.12)",
  },
  vaccine: {
    label: "疫苗接種",
    icon: "💉",
    color: "#6bae8a",
    bg: "rgba(107, 174, 138, 0.12)",
  },
  medicine: {
    label: "用藥紀錄",
    icon: "💊",
    color: "#e29553",
    bg: "rgba(226, 149, 83, 0.12)",
  },
  followup: {
    label: "回診追蹤",
    icon: "📄",
    color: "#b59bd4",
    bg: "rgba(181, 155, 212, 0.12)",
  },
  emergency: {
    label: "急診紀錄",
    icon: "🚨",
    color: "#df4733",
    bg: "rgba(223, 71, 51, 0.12)",
  },
};

const filterTabsList = computed(() => {
  const base = [{ key: "all", label: "全部" }];
  Object.entries(typeConfig).forEach(([k, v]) => {
    base.push({ key: k, label: v.label });
  });
  return base;
});

// ==========================================================================
// 3. 醫療紀錄列表（從後端 API 載入，初始為空陣列）
// ==========================================================================
const medicalRecordsList = ref([]);

// 從後端載入某寵物的所有病歷
async function loadRecords() {
  try {
    const res = await axios.get("/api/medical/list/1"); // petId 先寫死 1
    medicalRecordsList.value = res.data;
  } catch (e) {
    console.error("載入病歷失敗", e);
  }
}

// 頁面載入時抓一次
onMounted(loadRecords);

// ==========================================================================
// 4. 篩選計算器
// ==========================================================================
const filteredRecords = computed(() => {
  return medicalRecordsList.value.filter((record) => {
    const matchSearch =
      (record.diagnosis && record.diagnosis.includes(searchQuery.value)) ||
      (record.clinicName && record.clinicName.includes(searchQuery.value)) ||
      (record.tags && record.tags.some((t) => t.includes(searchQuery.value)));
    const matchType =
      selectedTypeKey.value === "all" ||
      record.fileType === selectedTypeKey.value;
    return matchSearch && matchType;
  });
});

function getRecordCountByType(typeKey) {
  return medicalRecordsList.value.filter((r) => r.fileType === typeKey).length;
}

const totalFilesCount = computed(() => {
  return medicalRecordsList.value.reduce(
    (total, r) => total + (r.exportCount || 0),
    0,
  );
});

// ==========================================================================
// 5. 摺疊展開與基本互動
// ==========================================================================
function toggleExpandRecord(recordId) {
  expandedRecordId.value =
    expandedRecordId.value === recordId ? null : recordId;
}

// 查看檔案：用 recordId 開啟後端存的原始檔（瀏覽器會依檔案類型預覽）
function handleViewFile(record) {
  window.open(
    `http://localhost:8080/api/medical/file/${record.recordId}`,
    "_blank",
  );
}

// 下載檔案：同一支 API
function handleDownloadFile(record) {
  window.open(
    `http://localhost:8080/api/medical/file/${record.recordId}`,
    "_blank",
  );
}

function getEventConfig(fileType) {
  return (
    typeConfig[fileType] || {
      label: "其他",
      color: "#999999",
      bg: "#f3f0e8",
      icon: "📝",
    }
  );
}

// ==========================================================================
// 6. AI 上傳辨識功能
// ==========================================================================
function handleRecordInfo() {
  fileInputRef.value.value = "";
  fileInputRef.value.click();
}
function handleFileSelect() {
  fileInputRef.value.value = "";
  fileInputRef.value.click();
}

async function handleFileDrop(event) {
  dragging.value = false;
  const file = event.dataTransfer.files[0];
  if (!file) return;
  await uploadAndParse(file);
}

async function handleFileChosen(event) {
  const file = event.target.files[0];
  if (!file) return;
  await uploadAndParse(file);
}

async function uploadAndParse(file) {
  if (isParsingAI.value) return;

  isParsingAI.value = true;
  parsedResult.value = null;
  healthAdvice.value = "";
  savedRecordId.value = null;
  isAnalyzing.value = false; // 重置分析狀態

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/medical/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    parsedResult.value = response.data;
    const 要清洗的欄位 = [
      "clinicName",
      "vetName",
      "visitDate",
      "followUpDate",
      "diagnosis",
      "symptoms",
      "medication",
      "dosage",
    ];
    要清洗的欄位.forEach(function (欄位名稱) {
      if (
        parsedResult.value[欄位名稱] === "null" ||
        parsedResult.value[欄位名稱] === null
      ) {
        parsedResult.value[欄位名稱] = "";
      }
    });
    parsedResult.value._file = file;
  } catch (error) {
    console.error("AI 辨識失敗：", error);
    alert("❌ 辨識失敗，請確認檔案格式或稍後再試。");
  } finally {
    isParsingAI.value = false;
  }
}

async function handleSaveRecord() {
  if (!parsedResult.value) return;

  try {
    const formData = new FormData();
    formData.append("petId", 1);
    formData.append("file", parsedResult.value._file);
    formData.append("diagnosis", parsedResult.value.diagnosis || "待確認");
    formData.append("clinicName", parsedResult.value.clinicName || "");
    formData.append("vetName", parsedResult.value.vetName || "");
    formData.append("visitDate", parsedResult.value.visitDate || "");
    formData.append("symptoms", parsedResult.value.symptoms || "");
    formData.append("medication", parsedResult.value.medication || "");
    formData.append("dosage", parsedResult.value.dosage || "");
    formData.append("followUpDate", parsedResult.value.followUpDate || "");
    formData.append(
      "recordType",
      parsedResult.value.recordType || "HEALTH_CHECK",
    );
    formData.append(
      "tags",
      parsedResult.value.tags ? parsedResult.value.tags.join(",") : "",
    );
    formData.append(
      "aiConfidenceNote",
      parsedResult.value.aiConfidenceNote || "",
    );

    const response = await axios.post("/api/medical/save", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    savedRecordId.value = response.data;
    console.log("儲存成功，recordId =", savedRecordId.value);

    await startHealthAnalysis(savedRecordId.value);

    // 存完後重新載入列表，讓剛新增的病歷出現
    await loadRecords();
  } catch (error) {
    console.error("儲存失敗：", error);
    alert("❌ 儲存失敗，請稍後再試。");
  }
}

async function startHealthAnalysis(recordId) {
  console.log("startHealthAnalysis 開始，recordId =", recordId);
  healthAdvice.value = "";
  isAnalyzing.value = true; // 開始：顯示「分析中」

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:8080/api/medical/analyze/${recordId}`);
    xhr.setRequestHeader("Accept", "text/event-stream");

    xhr.onprogress = function () {
      const text = xhr.responseText;
      const lines = text.split("\n");
      let assembled = "";
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const content = line.slice(5);
          if (content === "" || content === " ") {
            assembled += "\n"; // 空 data 行 = 換行
          } else {
            assembled += content; // 有內容就接上
          }
        }
      }
      // 1. 把每個 ・ 前面加換行，讓條列各自一行
      assembled = assembled.replace(/・/g, "\n・");
      // 2. 先把所有多重換行壓成單一，清乾淨
      assembled = assembled.replace(/\n{2,}/g, "\n");
      // 3. 只在這幾個大標題前面加一個空行，做出區塊分隔
      const 大標題 = [
        "日常照護重點",
        "飲食與飲水注意事項",
        "需要立即回診的警示症狀",
        "用藥提醒",
      ];
      大標題.forEach((標題) => {
        assembled = assembled.replace(標題, "\n" + 標題);
      });
      healthAdvice.value = assembled;
    };

    xhr.onload = function () {
      console.log("串流結束");
      isAnalyzing.value = false; // 結束
      resolve();
    };

    xhr.onerror = function () {
      console.error("串流請求失敗");
      isAnalyzing.value = false; // 結束（請求失敗狀態）
      resolve();
    };

    xhr.send();
  });
}
</script>
