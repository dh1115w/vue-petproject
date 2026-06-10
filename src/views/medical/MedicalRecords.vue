<template>
  <!-- 最外層容器，自帶頁面淡入動畫 -->
  <div class="records-container page-enter">
    <!-- 新增的病歷紀錄 Banner 區塊 -->
    <div class="medical-records-banner">
      <!-- 這裡放您新增的病歷紀錄 Banner 圖片 -->
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

        <!-- 新增按鈕保持在 Banner 內右側或適當位置 -->
        <button class="add-record-top-btn" @click="handleRecordInfo">
          ＋ 新增病歷
        </button>
      </header>
    </div>

    <!-- 主排版區：採用標準 Grid 網格佈局（左側面板 + 右側列表區） -->
    <div class="records-main-grid stagger-children">
      <!-- ==========================================
           【左側欄】：上傳區 + 統計數 + 插圖區
           ========================================== -->
      <div class="left-panel-column">
        <!-- 1. 拖曳檔案上傳虛線盒 -->
        <!-- 當 dragging 為 true 時，Vue 會自動套用 .is-dragging 樣式 -->
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

        <!-- 3. 精美插圖展示卡 (結合你上傳的醫療剪貼簿圖片！) -->
        <div class="pawcare-card illustration-card">
          <img
            src="https://manuscdn.com"
            alt="醫療紀錄插圖"
            class="illustration-img"
          />
          <div class="illustration-footer-info">
            <p>
              共 {{ recordsDatabase.length }} 筆病歷 ·
              {{ totalFilesCount }} 個檔案
            </p>
          </div>
        </div>

        <!-- 2. 紀錄類別分類統計小卡 -->
        <div class="pawcare-card">
          <h3 class="panel-small-title">紀錄統計</h3>
          <div class="stats-list-stack">
            <div
              v-for="(cfg, key) in typeConfig"
              :key="key"
              class="stat-row-item"
            >
              <!-- 分類圓角小圖示 -->
              <div class="stat-icon-badge" :style="{ backgroundColor: cfg.bg }">
                {{ cfg.icon }}
              </div>
              <!-- 分類名稱 -->
              <span class="stat-label-text">{{ cfg.label }}</span>
              <!-- 分類筆數 (動態計算) -->
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
        <!-- 頂部過濾大盒子 -->
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

        <!-- 【可摺疊式病歷卡片列表】（緊跟在過濾面板卡片的下方） -->
        <div class="records-list-stack">
          <!-- 跑 v-for 迴圈，動態將每筆篩選後的病歷畫出來 -->
          <div
            v-for="record in filteredRecords"
            :key="record.id"
            class="pawcare-card record-item-card"
          >
            <!-- 卡片頭部：點擊時切換展開/收合狀態 -->
            <div
              class="record-card-header"
              @click="toggleExpandRecord(record.id)"
            >
              <!-- 左側類別小圖示 (自動讀取設定檔的背景色與 Emoji) -->
              <div
                class="record-type-icon"
                :style="{ backgroundColor: getEventConfig(record.type).bg }"
              >
                <span :style="{ color: getEventConfig(record.type).color }">
                  {{ getEventConfig(record.type).icon }}
                </span>
              </div>

              <!-- 中間核心欄位資訊 -->
              <div class="record-info-center">
                <div class="record-title-row">
                  <span class="record-main-title">{{ record.title }}</span>
                  <span
                    class="record-type-badge"
                    :style="{
                      backgroundColor: getEventConfig(record.type).bg,
                      color: getEventConfig(record.type).color,
                    }"
                  >
                    {{ getEventConfig(record.type).label }}
                  </span>
                </div>

                <!-- 診所、日期與檔案數小字 -->
                <div class="record-meta-row">
                  <span>🕒 {{ record.date }}</span>
                  <span>🏥 {{ record.clinic }}</span>
                  <span>📄 {{ record.files }} 個檔案</span>
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
                <!-- 當目前 ID 等於展開 ID 時，自動套用 .is-rotated 進行 90 度旋轉 -->
                <span
                  class="chevron-arrow-icon"
                  :class="{ 'is-rotated': expandedRecordId === record.id }"
                >
                  ▶
                </span>
              </div>
            </div>

            <!-- 【手風琴展開區】：當此卡片 ID 等於 expandedRecordId 時才渲染 -->
            <div
              v-if="expandedRecordId === record.id"
              class="record-expanded-drawer"
            >
              <p class="doctor-notes-text">
                <strong>醫師備註：</strong>{{ record.notes }}
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
// 1. 搜尋、篩選分頁與目前展開的卡片 ID 響應式變數
// ==========================================================================
const searchQuery = ref(""); // 對應原檔的 useState("")
const selectedTypeKey = ref("all"); // 對應原檔的 useState("all")
const expandedRecordId = ref(null); // 存放目前展開的病歷 ID，null 代表全收合
const dragging = ref(false); // 拖曳狀態開關

// ==========================================================================
// 2. 醫療紀錄五大類別的配色與 Emoji 設定檔（完美同步你剛才提供的新設定！）
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

// 自動生成頂部分頁切換按鈕陣列（全部 + 五大分類）
const filterTabsList = computed(() => {
  const base = [{ key: "all", label: "全部" }];
  Object.entries(typeConfig).forEach(([k, v]) => {
    base.push({ key: k, label: v.label });
  });
  return base;
});

// ==========================================================================
// 3. 醫療紀錄核心資料庫 (完美同步你剛才提供的 5 筆精準原始病歷數據！)
// ==========================================================================
const recordsDatabase = ref([
  {
    id: 1,
    date: "2026/04/10",
    title: "年度健康檢查報告",
    clinic: "台北動物醫院",
    doctor: "陳獸醫師",
    type: "checkup",
    files: 3,
    tags: ["血液檢查", "X光", "心電圖"],
    status: "正常",
    notes: "整體健康狀況良好，建議半年後追蹤血液指數。",
  },
  {
    id: 2,
    date: "2026/03/22",
    title: "皮膚炎回診紀錄",
    clinic: "愛寵動物診所",
    doctor: "林獸醫師",
    type: "followup",
    files: 1,
    tags: ["皮膚科", "過敏"],
    status: "追蹤中",
    notes: "皮膚狀況改善中，繼續使用藥膏，兩週後回診。",
  },
  {
    id: 3,
    date: "2026/03/05",
    title: "狂犬病疫苗接種",
    clinic: "台北動物醫院",
    doctor: "陳獸醫師",
    type: "vaccine",
    files: 1,
    tags: ["疫苗", "狂犬病"],
    status: "完成",
    notes: "疫苗接種完成，下次接種時間：2027/03/05。",
  },
  {
    id: 4,
    date: "2026/01/15",
    title: "腸胃炎急診紀錄",
    clinic: "24H 緊急動物醫院",
    doctor: "王獸醫師",
    type: "emergency",
    files: 2,
    tags: ["急診", "腸胃", "點滴"],
    status: "已康復",
    notes: "急性腸胃炎，點滴治療後恢復良好。",
  },
  {
    id: 5,
    date: "2025/12/20",
    title: "心絲蟲預防用藥",
    clinic: "台北動物醫院",
    doctor: "陳獸醫師",
    type: "medicine",
    files: 1,
    tags: ["預防藥", "心絲蟲"],
    status: "完成",
    notes: "每月定期服用預防藥，下次：2026/01/20。",
  },
]);

// ==========================================================================
// 4. 核心：交叉篩選計算器 (完美翻譯原檔的 records.filter 篩選比對邏輯)
// ==========================================================================
const filteredRecords = computed(() => {
  return recordsDatabase.value.filter((record) => {
    // 1. 關鍵字搜尋（模糊比對標題、診所、或任意一個 tags 標籤貼紙內文）
    const matchSearch =
      record.title.includes(searchQuery.value) ||
      record.clinic.includes(searchQuery.value) ||
      record.tags.some((t) => t.includes(searchQuery.value));

    // 2. 類別分頁切換過濾
    const matchType =
      selectedTypeKey.value === "all" || record.type === selectedTypeKey.value;

    return matchSearch && matchType;
  });
});

// 分類統計動態筆數函數（讓左側統計小卡能動態抓取數據筆數）
function getRecordCountByType(typeKey) {
  return recordsDatabase.value.filter((r) => r.type === typeKey).length;
}

// 自動動態加總核心資料庫內的所有病歷檔案個數
const totalFilesCount = computed(() => {
  return recordsDatabase.value.reduce((total, r) => total + r.files, 0);
});

// ==========================================================================
// 5. 摺疊展開與功能互動函式
// ==========================================================================
function toggleExpandRecord(id) {
  expandedRecordId.value = expandedRecordId.value === id ? null : id;
}

function handleRecordInfo() {
  alert("💡 新增病歷功能即將推出！");
}
function handleFileSelect() {
  alert("請選擇您電腦中的 PDF 或圖檔報告 📄");
}

// 拖曳檔案放開時的處理函式
function handleFileDrop() {
  dragging.value = false;
  alert("🎉 檔案上傳成功！病歷檔案已加入紀錄。");
}

function handleViewFile(record) {
  alert(
    `👁️ 正在為您開啟：\n【${record.title}】的 PDF 報告原始檔\n主治醫生：${record.doctor}`,
  );
}
function handleDownloadFile(record) {
  alert(
    `📥 開始下載【${record.title}】的病歷打包檔案 (共 ${record.files} 個附件)`,
  );
}

function getEventConfig(type) {
  return (
    typeConfig[type] || {
      label: "其他",
      color: "#999999",
      bg: "#f3f0e8",
      icon: "📝",
    }
  );
}
</script>
