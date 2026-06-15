<template>
  <!-- 最外層容器 -->
  <div class="records-container page-enter">
    <!-- 新增的病歷紀錄 Banner 區塊 -->
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

    <!-- 主排版區：左側面板 + 右側列表區 -->
    <div class="records-main-grid stagger-children">
      <!-- ==========================================
           【左側欄】：上傳區 + 統計數 + 插圖區
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
            <button class="select-file-btn" @click="handleFileSelect">
              選擇檔案
            </button>
          </div>
        </div>

        <!-- 2. 插圖展示卡 -->
        <div class="pawcare-card illustration-card">
          <img
            src="https://manuscdn.com"
            alt="醫療紀錄插圖"
            class="illustration-img"
          />
          <div class="illustration-footer-info">
            <p>
              共 {{ medicalRecordsList.length }} 筆病歷 ·
              {{ totalFilesCount }} 個檔案
            </p>
          </div>
        </div>

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
import { ref, computed } from "vue";
import "@/css/medical/medical-records.css";

// ==========================================================================
// 1. UI 互動狀態
// ==========================================================================
const searchQuery = ref(""); // 搜尋關鍵字
const selectedTypeKey = ref("all"); // 目前選中的分類分頁
const expandedRecordId = ref(null); // 目前展開的病歷 recordId（null = 全收合）
const dragging = ref(false); // 拖曳上傳狀態開關

// ==========================================================================
// 2. 醫療紀錄五大類別設定檔
//    key 值對應 MedicalRecords.fileType 欄位
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

// 自動產生頂部分頁按鈕陣列（全部 + 五大分類）
const filterTabsList = computed(() => {
  const base = [{ key: "all", label: "全部" }];
  Object.entries(typeConfig).forEach(([k, v]) => {
    base.push({ key: k, label: v.label });
  });
  return base;
});

// ==========================================================================
// 3. 醫療紀錄核心資料（對應 MedicalRecords 表）
//    欄位：recordId, petId, recordDate, diagnosis, filePath,
//          fileSize, fileType, exportCount, status, medicalHistory,
//          clinicName（顯示用，實際串接時從 Clinics 表 JOIN）,
//          tags（顯示用關鍵字）
// ==========================================================================
const medicalRecordsList = ref([
  {
    recordId: 1,
    petId: 1,
    recordDate: "2026/04/10",
    diagnosis: "年度健康檢查報告", // MedicalRecords.diagnosis
    clinicName: "台北動物醫院", // 顯示用（來自 Clinics.clinicName）
    doctor: "陳獸醫師",
    fileType: "checkup", // MedicalRecords.fileType（對應 typeConfig key）
    exportCount: 3, // MedicalRecords.exportCount（顯示檔案數）
    tags: ["血液檢查", "X光", "心電圖"],
    status: "正常", // MedicalRecords.status
    medicalHistory: "整體健康狀況良好，建議半年後追蹤血液指數。", // Pet.medicalHistory
  },
  {
    recordId: 2,
    petId: 1,
    recordDate: "2026/03/22",
    diagnosis: "皮膚炎回診紀錄",
    clinicName: "愛寵動物診所",
    doctor: "林獸醫師",
    fileType: "followup",
    exportCount: 1,
    tags: ["皮膚科", "過敏"],
    status: "追蹤中",
    medicalHistory: "皮膚狀況改善中，繼續使用藥膏，兩週後回診。",
  },
  {
    recordId: 3,
    petId: 1,
    recordDate: "2026/03/05",
    diagnosis: "狂犬病疫苗接種",
    clinicName: "台北動物醫院",
    doctor: "陳獸醫師",
    fileType: "vaccine",
    exportCount: 1,
    tags: ["疫苗", "狂犬病"],
    status: "完成",
    medicalHistory: "疫苗接種完成，下次接種時間：2027/03/05。",
  },
  {
    recordId: 4,
    petId: 1,
    recordDate: "2026/01/15",
    diagnosis: "腸胃炎急診紀錄",
    clinicName: "24H 緊急動物醫院",
    doctor: "王獸醫師",
    fileType: "emergency",
    exportCount: 2,
    tags: ["急診", "腸胃", "點滴"],
    status: "已康復",
    medicalHistory: "急性腸胃炎，點滴治療後恢復良好。",
  },
  {
    recordId: 5,
    petId: 1,
    recordDate: "2025/12/20",
    diagnosis: "心絲蟲預防用藥",
    clinicName: "台北動物醫院",
    doctor: "陳獸醫師",
    fileType: "medicine",
    exportCount: 1,
    tags: ["預防藥", "心絲蟲"],
    status: "完成",
    medicalHistory: "每月定期服用預防藥，下次：2026/01/20。",
  },
]);

// ==========================================================================
// 4. 篩選計算器（關鍵字 + 分類同時過濾）
// ==========================================================================
const filteredRecords = computed(() => {
  return medicalRecordsList.value.filter((record) => {
    // 模糊比對：診斷名稱、診所名稱、或任一標籤
    const matchSearch =
      record.diagnosis.includes(searchQuery.value) ||
      record.clinicName.includes(searchQuery.value) ||
      record.tags.some((t) => t.includes(searchQuery.value));

    // 分類分頁過濾（all = 全顯示）
    const matchType =
      selectedTypeKey.value === "all" ||
      record.fileType === selectedTypeKey.value;

    return matchSearch && matchType;
  });
});

// 依 fileType 統計各分類筆數（左側統計小卡用）
function getRecordCountByType(typeKey) {
  return medicalRecordsList.value.filter((r) => r.fileType === typeKey).length;
}

// 加總所有病歷的 exportCount（左側插圖卡用）
const totalFilesCount = computed(() => {
  return medicalRecordsList.value.reduce(
    (total, r) => total + r.exportCount,
    0,
  );
});

// ==========================================================================
// 5. 摺疊展開與互動函式
// ==========================================================================
function toggleExpandRecord(recordId) {
  expandedRecordId.value =
    expandedRecordId.value === recordId ? null : recordId;
}

function handleRecordInfo() {
  alert("💡 新增病歷功能即將推出！");
}

function handleFileSelect() {
  alert("請選擇您電腦中的 PDF 或圖檔報告 📄");
}

function handleFileDrop() {
  dragging.value = false;
  alert("🎉 檔案上傳成功！病歷檔案已加入紀錄。");
}

function handleViewFile(record) {
  alert(
    `👁️ 正在為您開啟：\n【${record.diagnosis}】的 PDF 報告原始檔\n主治醫生：${record.doctor}`,
  );
}

function handleDownloadFile(record) {
  alert(
    `📥 開始下載【${record.diagnosis}】的病歷打包檔案 (共 ${record.exportCount} 個附件)`,
  );
}

// 依 fileType 取得對應的顯示設定（找不到時給預設值）
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
</script>
