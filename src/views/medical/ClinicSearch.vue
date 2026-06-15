<template>
  <!-- 最外層容器，自帶頁面淡入動畫 -->
  <div class="clinic-container main-container page-enter">
    <!-- 附近診所 Banner 區塊 -->
    <div class="clinic-banner">
      <img
        src="@/images/clinic-search-banner.jpg"
        alt="附近診所 Banner"
        class="banner-image"
      />

      <!-- 頁面頂部標頭 -->
      <header class="clinic-header">
        <h1>附近診所搜尋</h1>
        <p class="subtitle">找尋您附近的動物醫院與診所</p>

        <button class="add-clinic-top-btn" @click="handleRecordInfo">
          ＋ 立即定位您的位置
        </button>
      </header>
    </div>

    <!-- 主排版區：左側面板 + 右側地圖預留區 -->
    <div class="clinic-main-layout stagger-children">
      <!-- 【左側面板】：搜尋欄與距離篩選 -->
      <div class="left-panel">
        <!-- 固定區域：搜尋與篩選 -->
        <div class="sticky-header">
          <div class="pawcare-card search-box-card">
            <!-- Tab 切換 -->
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

            <!-- 距離篩選按鈕群 -->
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

            <!-- 進階複選篩選 Chips -->
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

        <!-- 滾動區域：診所清單 -->
        <div class="scrollable-list">
          <div class="clinic-list-scroll-view">
            <p class="search-result-count">
              找到 {{ filteredClinics.length }} 間診所
            </p>

            <div
              v-for="clinic in filteredClinics"
              :key="clinic.clinicId"
              class="pawcare-card clinic-item-card"
              :class="{
                'is-selected-card': selectedClinicId === clinic.clinicId,
              }"
              @click="selectedClinicId = clinic.clinicId"
            >
              <div class="clinic-card-top flex">
                <!-- 收藏按鈕（對應 UserFavoriteClinics） -->
                <button
                  class="favorite-btn"
                  :class="{ 'is-favorited': clinic.isFavorited }"
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
                    <!-- Clinics.clinicName -->
                    <span class="clinic-title-text">{{
                      clinic.clinicName
                    }}</span>
                    <span
                      class="status-capsule"
                      :class="clinic.isOpen ? 'capsule-open' : 'capsule-closed'"
                    >
                      {{ clinic.isOpen ? "營業中" : "休息中" }}
                    </span>
                  </div>

                  <div class="clinic-meta-row">
                    🕒 {{ clinic.businessHours }}
                    <span class="divider-dot">·</span>
                    📍 {{ clinic.distanceText }}
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
                    <span v-if="clinic.hasEmergency" class="night-tag"
                      >夜間</span
                    >
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

      <!-- 【右側地圖區】 -->
      <div class="right-map-panel pawcare-card">
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
// 1. UI 互動狀態
// ==========================================================================
const searchQuery = ref(""); // 搜尋關鍵字
const selectedDistance = ref("5"); // 目前選中的距離篩選（預設 5km）
const selectedClinicId = ref(1); // 目前選中的診所 clinicId（預設第一間）
const isLocating = ref(false); // 定位中狀態開關
const activeTab = ref("search"); // 目前分頁（"search" | "favorites"）

// Tab 選項
const tabs = ref([
  { id: "search", label: "搜尋診所" },
  { id: "favorites", label: "我的收藏" },
]);

// 進階複選篩選狀態（key 對應 Clinics / ClinicBusinessHours 欄位語意）
const filters = ref({
  open: false, // 只顯示營業中
  night: false, // 只顯示夜間門診
  appointment: true, // 只顯示特寵（requireBooking）
});

// ==========================================================================
// 2. 靜態選項陣列
// ==========================================================================
const distanceOptions = ["1", "5", "10"];

const filterOptions = [
  { key: "open", label: "營業中", icon: "🟢" },
  { key: "night", label: "夜間門診", icon: "🌙" },
  { key: "appointment", label: "特寵", icon: "🦎" },
];

// ==========================================================================
// 3. 診所核心資料（對應 Clinics + ClinicBusinessHours + UserFavoriteClinics 表）
//
//    clinicId      → Clinics.clinicId
//    clinicName    → Clinics.clinicName
//    address       → Clinics.address
//    phone         → Clinics.phone
//    rating        → Clinics.rating
//    hasEmergency  → Clinics.hasEmergency（夜間急診）
//    requireBooking→ Clinics.requireBooking（需預約 / 特寵）
//    latitude      → Clinics.latitude（計算距離用）
//    longitude     → Clinics.longitude
//    businessHours → ClinicBusinessHours（openTime ~ closeTime，顯示用）
//    isFavorited   → UserFavoriteClinics（是否已加入常用診所）
//    isOpen        → 前端根據 ClinicBusinessHours 計算的即時開關狀態
//    distanceText  → 前端計算後的顯示用距離文字
//    rawDistance   → 前端計算後的公里數（用於距離篩選）
// ==========================================================================
const clinicsList = ref([
  {
    clinicId: 1,
    clinicName: "台北動物醫院",
    address: "台北市大安區仁愛路四段 300 號",
    phone: "02-2700-1234",
    rating: 4.8,
    reviews: 234,
    hasEmergency: true, // Clinics.hasEmergency
    requireBooking: false, // Clinics.requireBooking
    latitude: 25.033, // Clinics.latitude
    longitude: 121.543, // Clinics.longitude
    businessHours: "09:00 - 21:00", // 顯示用（來自 ClinicBusinessHours）
    isOpen: true, // 前端計算即時開關狀態
    distanceText: "0.8 km", // 顯示用距離文字
    rawDistance: 0.8, // 篩選用公里數
    tags: ["全科", "急診", "外科"],
    isFavorited: false, // 對應 UserFavoriteClinics 是否存在此 clinicId
  },
  {
    clinicId: 2,
    clinicName: "愛寵動物診所",
    address: "台北市信義區基隆路一段 180 號",
    phone: "02-2720-5678",
    rating: 4.6,
    reviews: 156,
    hasEmergency: false,
    requireBooking: true,
    latitude: 25.03,
    longitude: 121.558,
    businessHours: "10:00 - 20:00",
    isOpen: true,
    distanceText: "1.2 km",
    rawDistance: 1.2,
    tags: ["皮膚科", "眼科", "特寵"],
    isFavorited: false,
  },
  {
    clinicId: 3,
    clinicName: "毛孩子動物醫院",
    address: "台北市松山區南京東路五段 88 號",
    phone: "02-2760-9012",
    rating: 4.9,
    reviews: 312,
    hasEmergency: false,
    requireBooking: false,
    latitude: 25.051,
    longitude: 121.561,
    businessHours: "09:00 - 18:00",
    isOpen: false,
    distanceText: "2.1 km",
    rawDistance: 2.1,
    tags: ["全科", "牙科", "復健"],
    isFavorited: false,
  },
  {
    clinicId: 4,
    clinicName: "24H 緊急動物醫院",
    address: "台北市中山區林森北路 200 號",
    phone: "02-2531-3456",
    rating: 4.5,
    reviews: 89,
    hasEmergency: true,
    requireBooking: false,
    latitude: 25.058,
    longitude: 121.524,
    businessHours: "24 小時",
    isOpen: true,
    distanceText: "3.5 km",
    rawDistance: 3.5,
    tags: ["急診", "24H", "重症"],
    isFavorited: false,
  },
]);

// ==========================================================================
// 4. 交叉過濾計算器
// ==========================================================================
const filteredClinics = computed(() => {
  return clinicsList.value.filter((clinic) => {
    // 收藏頁籤：只顯示已加入 UserFavoriteClinics 的診所
    if (activeTab.value === "favorites" && !clinic.isFavorited) return false;

    // 關鍵字模糊比對（clinicName 或 address）
    const matchSearch =
      clinic.clinicName.includes(searchQuery.value) ||
      clinic.address.includes(searchQuery.value);

    // 距離篩選
    const matchDist = clinic.rawDistance <= parseFloat(selectedDistance.value);

    // 進階複選條件
    const matchOpen = !filters.value.open || clinic.isOpen;
    const matchNight = !filters.value.night || clinic.hasEmergency; // hasEmergency 對應夜間
    const matchAppt = !filters.value.appointment || clinic.requireBooking; // requireBooking 對應特寵

    return matchSearch && matchDist && matchOpen && matchNight && matchAppt;
  });
});

// ==========================================================================
// 5. 互動函式
// ==========================================================================

// 切換收藏狀態（對應新增/刪除 UserFavoriteClinics 紀錄）
function toggleFavorite(clinic) {
  const idx = clinicsList.value.findIndex(
    (c) => c.clinicId === clinic.clinicId,
  );
  if (idx !== -1) {
    clinicsList.value[idx].isFavorited = !clinicsList.value[idx].isFavorited;
    // TODO：呼叫後端 API 新增或刪除 UserFavoriteClinics 紀錄
  }
}

// 切換進階篩選 Chip
function toggleFilter(key) {
  filters.value[key] = !filters.value[key];
}

// 定位功能
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
        // TODO：呼叫 Geocoding API 將經緯度轉為地址
        // const res = await fetch(`https://maps.googleapis.com/.../geocode/json?latlng=${latitude},${longitude}&key=YOUR_KEY`)
        searchQuery.value = "台北市大安區 (已取得目前定位)";
        console.log(`定位成功: ${latitude}, ${longitude}`);
      } catch (error) {
        console.error("地址解析失敗", error);
      } finally {
        isLocating.value = false;
      }
    },
    () => {
      isLocating.value = false;
      alert("無法取得位置資訊，請確認權限設定");
    },
  );
}

// 導航（使用 Clinics.address）
function handleNavigate(clinic) {
  alert(
    `🚀 正在呼叫外部地圖導航至：${clinic.clinicName}\n地址：${clinic.address}`,
  );
}

// 撥號（使用 Clinics.phone）
function handleCall(clinic) {
  alert(`📞 正在撥號給 ${clinic.clinicName}\n電話號碼：${clinic.phone}`);
}

// Banner 按鈕（預留）
function handleRecordInfo() {
  handleLocate();
}
</script>
