<template>
  <!-- 最外層容器，自帶頁面淡入動畫 -->
  <div class="clinic-container main-container page-enter">
    <!-- 新增的附近診所 Banner 區塊 -->
    <div class="clinic-banner">
      <!-- 這裡放您新增的附近診所搜尋 Banner 圖片 -->
      <img
        src="@/images/clinic-search-banner.jpg"
        alt="附近診所 Banner"
        class="banner-image"
      />

      <!-- 頁面頂部標頭 (移入 Banner 內部) -->
      <header class="clinic-header">
        <h1>附近診所搜尋</h1>
        <p class="subtitle">找尋您附近的動物醫院與診所</p>

        <!-- 新增按鈕保持在 Banner 內右側或適當位置 -->
        <button class="add-clinic-top-btn" @click="handleRecordInfo">
          ＋ 立即定位您的位置
        </button>
      </header>
    </div>

    <!-- 主排版區：採用標準 Grid 網格佈局（左側面板 + 右側地圖預留區） -->
    <div class="clinic-main-layout stagger-children">
      <!-- 【左側面板】：搜尋欄與距離篩選 -->
      <div class="left-panel">
        <!-- 1. 固定區域 (Sticky Header)：包含搜尋與篩選，不隨列表滾動 -->
        <div class="sticky-header">
          <div class="pawcare-card search-box-card">
            <!-- 新增 Tab 切換區塊 -->
            <div class="tab-switcher">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                class="tab-btn"
                :class="{ 'is-active': activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="搜尋診所名稱或地址..."
                class="clinic-search-input"
              />
              <button
                type="button"
                class="locate-btn"
                :class="{ 'is-loading': isLocating }"
                @click="handleLocate"
                title="定位目前位置"
              >
                <span class="locate-icon">{{ isLocating ? "⌛" : "🎯" }}</span>
              </button>
            </div>

            <div class="distance-filter-row">
              <span class="filter-label">距離：</span>
              <div class="filter-buttons-group">
                <button
                  v-for="dist in distanceOptions"
                  :key="dist"
                  type="button"
                  class="distance-tab-btn"
                  :class="{ 'is-active': selectedDistance === dist }"
                  @click="selectedDistance = dist"
                >
                  {{ dist }}km
                </button>
              </div>
            </div>

            <div class="filter-chips-row">
              <button
                v-for="item in filterOptions"
                :key="item.key"
                type="button"
                class="chip-toggle-btn"
                :class="{ 'is-active': filters[item.key] }"
                @click="toggleFilter(item.key)"
              >
                <span class="chip-icon">{{ item.icon }}</span>
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 2. 滾動區域 (Scrollable List)：僅讓診所清單在此區域內滾動 -->
        <div class="scrollable-list">
          <div class="clinic-list-scroll-view">
            <p class="search-result-count">
              找到 {{ filteredClinics.length }} 間診所
            </p>

            <div
              v-for="clinic in filteredClinics"
              :key="clinic.id"
              class="pawcare-card clinic-item-card"
              :class="{ 'is-selected-card': selectedClinicId === clinic.id }"
              @click="selectedClinicId = clinic.id"
            >
              <div class="clinic-card-top flex">
                <button
                  class="favorite-btn"
                  :class="{ 'is-favorited': clinic.isFavorite }"
                  @click.stop="toggleFavorite(clinic)"
                >
                  ♥
                </button>
                <div
                  class="clinic-icon-badge"
                  :class="{
                    'badge-open': clinic.isOpen,
                    'badge-closed': !clinic.isOpen,
                  }"
                >
                  📍
                </div>

                <div class="clinic-info-main">
                  <div class="clinic-name-row">
                    <span class="clinic-title-text">{{ clinic.name }}</span>
                    <span
                      class="status-capsule"
                      :class="clinic.isOpen ? 'capsule-open' : 'capsule-closed'"
                    >
                      {{ clinic.isOpen ? "營業中" : "休息中" }}
                    </span>
                  </div>

                  <div class="clinic-meta-row">
                    🕒 {{ clinic.hours }} <span class="divider-dot">·</span> 📍
                    {{ clinic.distance }}
                  </div>

                  <div class="clinic-rating-row">
                    ⭐ <span class="rating-num">{{ clinic.rating }}</span>
                    <span class="reviews-count"
                      >({{ clinic.reviews }} 則評價)</span
                    >
                  </div>

                  <div class="clinic-tags-wrapper">
                    <span
                      v-for="tag in clinic.tags"
                      :key="tag"
                      class="normal-tag"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="clinic.isNight" class="night-tag"> 夜間 </span>
                  </div>
                </div>
              </div>

              <div class="clinic-card-actions">
                <button
                  class="action-nav-btn"
                  @click.stop="handleNavigate(clinic)"
                >
                  🚀 導航
                </button>
                <button
                  class="action-phone-btn"
                  @click.stop="handleCall(clinic)"
                >
                  📞 撥號
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 【右側地圖區】：未來放置 Google Maps 或模擬地圖畫面 -->
      <div class="right-map-panel pawcare-card">
        <!-- 我們內嵌一個高畫質的地圖視窗，預設定位在動物醫院密集的市中心 -->
        <iframe
          class="embedded-google-map"
          src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m124.536!2d121.543!3d25.033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1z5YuV54mp6Yar6Zmi!5e0!3m2!1szh-TW!2stw!4v1710000000000!5m2!1szh-TW!2stw"
          frameborder="0"
          scrolling="no"
          marginheight="0"
          marginwidth="0"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import "@/css/medical/medical-clinic-search.css";

// ==========================================================================
// 1. 搜尋、距離、標籤篩選的響應式變數
// ==========================================================================
const searchQuery = ref(""); // 對應原檔的 useState("")
const selectedDistance = ref("5"); // 對應原檔的 useState("5")
const selectedClinicId = ref(1); // 預設選中第一間診所的 ID
const isLocating = ref(false); // 定位中狀態

// 進階複選狀態對照物件
const filters = ref({
  open: false, // 營業中
  night: false, // 夜間門診
  appointment: false, // 免預約（對應原檔：非 needAppointment）
});

// 在頂部新增 Tab 相關變數
const activeTab = ref("search"); // 預設為搜尋頁籤
const tabs = ref([
  { id: "search", label: "搜尋診所" },
  { id: "favorites", label: "我的收藏" },
]);

// ==========================================================================
// 2. 靜態下拉與按鈕的對照陣列
// ==========================================================================
const distanceOptions = ["1", "5", "10"];

const filterOptions = [
  { key: "open", label: "營業中", icon: "🟢" },
  { key: "night", label: "夜間門診", icon: "🌙" },
  { key: "appointment", label: "免預約", icon: "📅" },
];

// ==========================================================================
// 3. 診所原始數據庫 (已完美同步你剛才提供的新數據內容！)
// ==========================================================================
const clinicsDatabase = ref([
  {
    id: 1,
    name: "台北動物醫院",
    address: "台北市大安區仁愛路四段 300 號",
    distance: "0.8 km",
    phone: "02-2700-1234",
    rating: 4.8,
    reviews: 234,
    isOpen: true,
    hours: "09:00 - 21:00",
    isNight: true,
    needAppointment: false,
    tags: ["全科", "急診", "外科"],
    rawDistance: 0.8,
    isFavorite: false, // 新增收藏屬性
  },
  {
    id: 2,
    name: "愛寵動物診所",
    address: "台北市信義區基隆路一段 180 號",
    distance: "1.2 km",
    phone: "02-2720-5678",
    rating: 4.6,
    reviews: 156,
    isOpen: true,
    hours: "10:00 - 20:00",
    isNight: false,
    needAppointment: true,
    tags: ["皮膚科", "眼科"],
    rawDistance: 1.2,
    isFavorite: false, // 新增收藏屬性
  },
  {
    id: 3,
    name: "毛孩子動物醫院",
    address: "台北市松山區南京東路五段 88 號",
    distance: "2.1 km",
    phone: "02-2760-9012",
    rating: 4.9,
    reviews: 312,
    isOpen: false,
    hours: "09:00 - 18:00",
    isNight: false,
    needAppointment: false,
    tags: ["全科", "牙科", "復健"],
    rawDistance: 2.1,
    isFavorite: false, // 新增收藏屬性
  },
  {
    id: 4,
    name: "24H 緊急動物醫院",
    address: "台北市中山區林森北路 200 號",
    distance: "3.5 km",
    phone: "02-2531-3456",
    rating: 4.5,
    reviews: 89,
    isOpen: true,
    hours: "24 小時",
    isNight: true,
    needAppointment: false,
    tags: ["急診", "24H", "重症"],
    rawDistance: 3.5,
    isFavorite: false, // 新增收藏屬性
  },
]);

// ==========================================================================
// 4. 核心：大聯動交叉過濾器 (完全翻譯原檔的 clinics.filter 邏輯)
// ==========================================================================
const filteredClinics = computed(() => {
  return clinicsDatabase.value.filter((c) => {
    // 如果是收藏頁籤，只顯示已收藏的診所
    if (activeTab.value === "favorites" && !c.isFavorite) {
      return false;
    }
    // 1. 搜尋框模糊比對（名字或地址包含關鍵字）
    const matchSearch =
      c.name.includes(searchQuery.value) ||
      c.address.includes(searchQuery.value);

    // 2. 距離篩選（將字串轉為數字比對公里數）
    const matchDist = c.rawDistance <= parseFloat(selectedDistance.value);

    // 3. 進階複選邏輯
    const matchOpen = !filters.value.open || c.isOpen;
    const matchNight = !filters.value.night || c.isNight;

    // 免預約對應 needAppointment 為 false (即不需要預約)
    const matchAppt = !filters.value.appointment || !c.needAppointment;

    // 五個條件同時成立才留下來
    return matchSearch && matchDist && matchOpen && matchNight && matchAppt;
  });
});

// 切換收藏狀態
function toggleFavorite(clinic) {
  const clinicIndex = clinicsDatabase.value.findIndex(
    (c) => c.id === clinic.id,
  );
  if (clinicIndex !== -1) {
    clinicsDatabase.value[clinicIndex].isFavorite =
      !clinicsDatabase.value[clinicIndex].isFavorite;
  }
}

// ==========================================================================
// 5. 點擊動作函式 (彈出提示視窗)
// ==========================================================================
async function handleLocate() {
  if (!navigator.geolocation) {
    alert("您的瀏覽器不支援定位功能");
    return;
  }

  isLocating.value = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // [預留位置] 呼叫 Geocoding API 將經緯度轉為地址
        // 例如：const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`)
        // const data = await response.json()
        // searchQuery.value = data.results[0].formatted_address

        // 模擬取得地址後的動作
        searchQuery.value = `台北市大安區 (已取得目前定位)`;
        console.log(`定位成功: ${latitude}, ${longitude}`);
      } catch (error) {
        console.error("地址解析失敗", error);
      } finally {
        isLocating.value = false;
      }
    },
    (error) => {
      isLocating.value = false;
      alert("無法取得位置資訊，請確認權限設定");
    },
  );
}

function toggleFilter(key) {
  filters.value[key] = !filters.value[key];
}

function handleNavigate(clinic) {
  alert(`🚀 正在呼叫外部地圖導航至：${clinic.name}\n地址：${clinic.address}`);
}

function handleCall(clinic) {
  alert(`📞 正在撥號給 ${clinic.name}\n電話號碼：${clinic.phone}`);
}
</script>
