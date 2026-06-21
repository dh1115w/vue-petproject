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
                  @click="handleDistanceChange(dist)"
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
            <p v-if="!hasLocated" class="search-result-count">
              請先點擊上方「定位」按鈕，搜尋附近診所
            </p>
            <p v-else class="search-result-count">
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
        <div id="clinicMap" class="embedded-google-map"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import "@/css/medical/medical-clinic-search.css";
import axios from "@/plugins/axios.js";

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
  appointment: false, // 只顯示特寵（requireBooking）
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
const clinicsList = ref([]); // 改成空陣列，資料改由 API 回傳填入
// 使用者目前的經緯度（定位成功後才會有值）
const userLat = ref(null);
const userLng = ref(null);

// 是否已經定位過（還沒定位前，不顯示任何診所清單）
const hasLocated = ref(false);

// 載入中狀態（呼叫 API 期間顯示 loading 用，可選）
const isSearching = ref(false);

// 地圖相關
let mapInstance = null; // Google Maps 地圖物件本體
let markers = []; // 目前畫在地圖上的所有標記點，之後要清除舊標記點時會用到
let infoWindow = null; // 點擊標記點時跳出的小視窗，全部標記點共用同一個
// ==========================================================================
// 4. 交叉過濾計算器
// ==========================================================================
// 距離、特寵、營業中、夜間門診這幾個條件，後端 API 已經篩選好了，
// 這裡只需要再做「收藏」跟「文字搜尋」這兩個後端沒處理的條件
const filteredClinics = computed(() => {
  return clinicsList.value.filter((clinic) => {
    // 收藏頁籤：只顯示已加入 UserFavoriteClinics 的診所
    if (activeTab.value === "favorites" && !clinic.isFavorited) return false;

    // 關鍵字模糊比對（clinicName 或 address）
    const matchSearch =
      clinic.clinicName.includes(searchQuery.value) ||
      clinic.address.includes(searchQuery.value);

    return matchSearch;
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
// 距離篩選改變時呼叫
function handleDistanceChange(dist) {
  selectedDistance.value = dist;
  if (hasLocated.value) {
    fetchNearbyClinics();
  }
}

// 切換進階篩選 Chip（特寵/營業中/夜間門診）
function toggleFilter(key) {
  filters.value[key] = !filters.value[key];
  if (hasLocated.value) {
    fetchNearbyClinics();
  }
}

// 初始化地圖（頁面載入時執行一次）
function initMap() {
  // 預設中心點：南台科技大學附近（之後使用者定位成功會自動移動到使用者位置）
  const defaultCenter = { lat: 23.0021, lng: 120.2155 };

  mapInstance = new google.maps.Map(document.getElementById("clinicMap"), {
    center: defaultCenter,
    zoom: 14,
    mapId: "CLINIC_SEARCH_MAP", // Advanced Marker 需要這個欄位，可以隨意命名
  });

  // 建立一個共用的資訊小視窗，之後點擊標記點時會重複使用這一個
  infoWindow = new google.maps.InfoWindow();
}

// 清除地圖上所有舊的標記點
function clearMarkers() {
  markers.forEach((marker) => {
    marker.map = null; // 把標記點從地圖上移除
  });
  markers = [];
}

// 依照目前的 clinicsList，在地圖上重新畫出所有標記點
function updateMapMarkers() {
  // 地圖還沒初始化完成，先不做事（避免初始化還沒跑完就被呼叫到，造成錯誤）
  if (!mapInstance) {
    return;
  }

  // 先清掉舊的標記點，再畫新的
  clearMarkers();

  clinicsList.value.forEach((clinic) => {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstance,
      position: { lat: clinic.latitude, lng: clinic.longitude },
      title: clinic.clinicName,
    });

    // 標記點被點擊時，顯示診所資訊小視窗
    marker.addListener("click", () => {
      infoWindow.setContent(`
        <div style="padding: 4px;">
          <strong>${clinic.clinicName}</strong><br/>
          ${clinic.address}<br/>
          📞 ${clinic.phone}<br/>
          ⭐ ${clinic.rating}　📍 ${clinic.distanceText}
        </div>
      `);
      infoWindow.open(mapInstance, marker);

      // 同步選中左側清單對應的卡片
      selectedClinicId.value = clinic.clinicId;
    });

    markers.push(marker);
  });
}

// 呼叫後端 API，搜尋附近診所
// 每次「定位成功」或「篩選條件改變」時，都會呼叫這個函式重新查詢
async function fetchNearbyClinics() {
  // 還沒定位過，不發送請求
  if (userLat.value === null || userLng.value === null) {
    return;
  }

  isSearching.value = true;

  try {
    const response = await axios.get("/api/medical/clinics/nearby", {
      params: {
        lat: userLat.value,
        lng: userLng.value,
        radius: selectedDistance.value,
        petFriendly: filters.value.appointment,
        openNow: filters.value.open,
        nightClinic: filters.value.night,
      },
    });

    // 把後端回傳的資料，轉換成前端畫面需要的格式
    clinicsList.value = response.data.map((clinic) => ({
      clinicId: clinic.clinicId,
      clinicName: clinic.clinicName,
      address: clinic.address,
      phone: clinic.phone,
      rating: clinic.rating,
      reviews: 0, // 後端目前沒有評論數資料，先固定顯示 0
      hasEmergency: clinic.hasEmergency,
      requireBooking: clinic.requireBooking,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      businessHours: formatBusinessHours(clinic.openTime, clinic.closeTime), // 時間格式轉換
      isOpen: clinic.isOpenNow, // 欄位名稱轉換：isOpenNow → isOpen
      distanceText: `${clinic.distance} km`, // 數字轉成顯示用文字
      rawDistance: clinic.distance,
      tags: clinic.isPetFriendly ? ["特寵"] : [], // 後端沒有 tags，先簡單轉換
      isFavorited: false, // 收藏功能尚未串接後端，先固定 false
    }));
    // 資料更新後，同步更新地圖上的標記點
    updateMapMarkers();

    // 如果有搜尋結果，把地圖中心移到使用者目前位置
    if (mapInstance && userLat.value !== null) {
      mapInstance.setCenter({ lat: userLat.value, lng: userLng.value });
    }
  } catch (error) {
    console.error("搜尋附近診所失敗", error);
    alert("搜尋附近診所失敗，請稍後再試");
  } finally {
    isSearching.value = false;
  }
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

      // 把定位拿到的座標存起來，之後篩選條件改變時還會用到
      userLat.value = latitude;
      userLng.value = longitude;
      hasLocated.value = true;

      console.log(`定位成功: ${latitude}, ${longitude}`);

      // 呼叫後端 API，搜尋附近診所
      await fetchNearbyClinics();

      isLocating.value = false;
    },
    () => {
      isLocating.value = false;
      alert("無法取得位置資訊，請確認權限設定");
    },
  );
}

// 把後端傳來的開門/關門時間，轉成畫面顯示用的文字
// 例如 openTime="09:00:00", closeTime="21:00:00" → 回傳 "09:00-21:00"
// 如果今天沒有營業時間資料（公休），就回傳「今日公休」
function formatBusinessHours(openTime, closeTime) {
  if (!openTime || !closeTime) {
    return "今日公休";
  }
  // 後端傳來的格式是 "09:00:00"，只取前 5 碼變成 "09:00"
  const open = openTime.substring(0, 5);
  const close = closeTime.substring(0, 5);
  return `${open}-${close}`;
}

// 導航（使用 Clinics.address）
function handleNavigate(clinic) {
  // 用 Google 地圖網址規格，帶起點（使用者目前位置）跟終點（診所經緯度）
  // 文件：https://developers.google.com/maps/documentation/urls/get-started#directions-action
  const origin = `${userLat.value},${userLng.value}`;
  const destination = `${clinic.latitude},${clinic.longitude}`;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

  // 開新分頁，避免使用者離開目前這個搜尋頁面
  window.open(url, "_blank");
}

// 撥號（使用 Clinics.phone）
function handleCall(clinic) {
  // tel: 連結手機瀏覽器會直接跳出撥號介面，電腦瀏覽器點了通常無反應或詢問用哪個通話軟體，是正常現象
  window.location.href = `tel:${clinic.phone}`;
}

// Banner 按鈕（預留）
function handleRecordInfo() {
  handleLocate();
}

// 頁面元件載入完成後，初始化地圖
onMounted(() => {
  initMap();
});
</script>
