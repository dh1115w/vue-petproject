<template>
  <!-- 最外層容器，自帶頁面淡入動畫 -->
  <div class="transport-container page-enter">
    <!-- 寵物接送 Banner 區塊 -->
    <div class="transport-banner">
      <img
        src="@/images/taxi-service-banner01.jpg"
        alt="寵物接送 Banner"
        class="banner-image"
      />

      <!-- 頁面頂部標頭 -->
      <header class="transport-header">
        <h1>寵物接送服務</h1>
        <p class="subtitle">寵物友善叫車服務，安心前往動物醫院</p>

        <button class="add-taxi-top-btn" @click="handleLocate">
          ＋ 立即定位您的位置
        </button>
      </header>
    </div>

    <!-- 主排版區：左側行程設定 + 右側叫車選項 -->
    <div class="transport-main-grid stagger-children">
      <!-- ==========================================
           【左側欄】：行程設定 + 寵物資訊
           ========================================== -->
      <div class="left-setup-column">
        <!-- 行程設定卡片 -->
        <div class="pawcare-card pawcare-card-accent-green">
          <h3 class="panel-small-title">行程設定</h3>

          <div class="route-inputs-stack">
            <!-- 1. 出發地點（固定目前位置） -->
            <div class="location-group">
              <label class="location-label">
                <span class="dot blue-dot"></span> 出發地點
              </label>
              <div class="location-static-box bg-muted">
                <span class="pin-icon text-accent">📍</span>
                <span class="address-text"
                  >台北市大安區敦化南路二段 100 號（目前位置）</span
                >
              </div>
            </div>

            <!-- 垂直虛線裝飾線條 -->
            <div class="dashed-line-divider">
              <div class="vertical-line"></div>
            </div>

            <!-- 2. 目的地診所（點擊下方按鈕會動態換內容） -->
            <div class="location-group">
              <label class="location-label">
                <span class="dot green-dot"></span> 目的地（診所）
              </label>
              <div class="location-static-box dest-active-box">
                <span class="pin-icon text-primary">📍</span>
                <div class="dest-info-wrapper">
                  <!-- 對應 Clinics.clinicName -->
                  <div class="dest-name">{{ selectedClinic.clinicName }}</div>
                  <!-- 對應 Clinics.address -->
                  <div class="dest-address">{{ selectedClinic.address }}</div>
                </div>
                <span class="arrow-right-icon">▶</span>
              </div>

              <!-- 3. 常用診所快速選取按鈕群（對應 UserFavoriteClinics） -->
              <div class="quick-clinics-row">
                <button
                  v-for="clinic in favoriteClinics"
                  :key="clinic.clinicName"
                  type="button"
                  class="clinic-chip-btn"
                  :class="{
                    'is-active':
                      selectedClinic.clinicName === clinic.clinicName,
                  }"
                  @click="selectedClinic = clinic"
                >
                  {{ clinic.clinicName }}
                </button>
              </div>
            </div>
          </div>

          <!-- 4. 三欄式行程數據預估 -->
          <div class="trip-info-estimate-grid">
            <div class="estimate-item">
              <div class="estimate-icon">🚀</div>
              <div class="estimate-value">
                {{ selectedClinic.distanceText }}
              </div>
              <div class="estimate-label">預估距離</div>
            </div>
            <div class="estimate-item">
              <div class="estimate-icon">🕒</div>
              <div class="estimate-value">
                {{ selectedClinic.estimatedTime }}
              </div>
              <div class="estimate-label">預估時間</div>
            </div>
            <div class="estimate-item">
              <div class="estimate-icon">💰</div>
              <div class="estimate-value">NT$ 120</div>
              <div class="estimate-label">預估費用</div>
            </div>
          </div>
        </div>

        <!-- 寵物資訊確認卡片 -->
        <div class="pawcare-card" style="margin-top: 1rem">
          <h3 class="panel-small-title">寵物資訊</h3>

          <div class="pet-info-form-body">
            <div class="pet-selection-list">
              <!-- v-for 跑所有寵物，key 對應 Pet.id -->
              <div
                v-for="pet in petList"
                :key="pet.id"
                class="pet-mini-profile-row"
                :class="{ 'is-checked': selectedPetIds.includes(pet.id) }"
                @click="togglePetSelection(pet.id)"
              >
                <!-- 左側：頭貼與文字資訊 -->
                <div class="pet-meta-box">
                  <img
                    :src="pet.avatar || defaultDogImage"
                    :alt="pet.name"
                    class="driver-pet-avatar"
                  />
                  <div class="driver-pet-text">
                    <!-- Pet.name -->
                    <div class="p-name">{{ pet.name }}</div>
                    <!-- Pet.breed · Pet.weight -->
                    <div class="p-desc">
                      {{ pet.breed }} · {{ pet.weight }} kg
                    </div>
                  </div>
                </div>

                <!-- 右側：打勾狀態（主寵物顯示📌鎖定，其他顯示✅或空心框） -->
                <span class="verified-check-mark">
                  <span
                    v-if="selectedPetIds.includes(pet.id)"
                    style="color: #6bae8a"
                  >
                    {{ pet.id === currentPetId ? "📌" : "✅" }}
                  </span>
                  <span v-else style="color: #cccccc">🔲</span>
                </span>
              </div>
            </div>

            <!-- 寵物數量選擇 -->
            <div class="form-group" style="margin-top: 1rem">
              <label class="form-label">寵物數量</label>
              <div class="flex-buttons-row">
                <button
                  v-for="n in ['1', '2', '3']"
                  :key="n"
                  type="button"
                  class="square-tab-btn"
                  :class="{ 'is-active': petCount === n }"
                  @click="petCount = n"
                >
                  {{ n }}
                </button>
              </div>
            </div>

            <!-- 特殊需求備註 -->
            <div class="form-group" style="margin-top: 1rem">
              <label class="form-label">特殊需求備註</label>
              <input
                type="text"
                v-model="description"
                placeholder="例：需要大型車廂、寵物有攻擊性..."
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================
           【右側欄】：選擇叫車方式
           ========================================== -->
      <div class="right-ride-options-column">
        <!-- 叫車方式清單（對應 TaxiServiceProviders 表） -->
        <div class="pawcare-card">
          <h3 class="panel-small-title">選擇叫車方式</h3>
          <div class="ride-options-list">
            <div
              v-for="provider in taxiProvidersList"
              :key="provider.providerId"
              class="ride-option-item-box"
              :class="{
                'is-selected': selectedProviderId === provider.providerId,
                'is-disabled': !provider.isActive,
              }"
              @click="
                provider.isActive && (selectedProviderId = provider.providerId)
              "
            >
              <div class="ride-item-top flex">
                <div class="ride-car-emoji">{{ provider.icon }}</div>
                <div class="ride-car-info-main">
                  <div class="ride-car-name-row">
                    <!-- TaxiServiceProviders.providerName -->
                    <span class="car-name-text">{{
                      provider.providerName
                    }}</span>
                    <span v-if="provider.isRecommended" class="badge-recommend"
                      >推薦</span
                    >
                    <span v-if="!provider.isActive" class="badge-disabled"
                      >目前不可用</span
                    >
                  </div>
                  <!-- 時間與車資 -->
                  <div class="ride-car-meta">
                    <span>🕒 {{ provider.eta }}</span>
                    <span>💰 {{ provider.priceText }}</span>
                    <span>⭐ {{ provider.rating }}</span>
                  </div>
                  <!-- 特色貼紙標籤 -->
                  <div class="ride-features-wrap">
                    <span
                      v-for="f in provider.features"
                      :key="f"
                      class="feature-tag"
                      >🐾 {{ f }}</span
                    >
                  </div>
                </div>
                <!-- 勾選狀態 -->
                <span
                  v-if="
                    selectedProviderId === provider.providerId &&
                    provider.isActive
                  "
                  class="checked-circle"
                  >✓</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 安全提示框 -->
        <div class="safety-alert-notice-box">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content-text">
            <strong>安全提醒</strong>
            <p>
              建議將寵物放入提籠或使用安全帶固定，確保行車安全。司機已通過寵物友善認證訓練。
            </p>
          </div>
        </div>

        <!-- 立即叫車 CTA 按鈕 -->
        <button class="call-taxi-now-btn" @click="handleCallTaxi">
          🚗 立即叫車
        </button>
        <button class="call-clinic-direct-btn" @click="handleCallClinic">
          📞 直接撥打診所電話
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import "@/css/medical/medical-taxi-service.css";

// ==========================================================================
// 1. 常用診所快速選取（對應 UserFavoriteClinics JOIN Clinics）
//    欄位對應：clinicName → Clinics.clinicName
//             address    → Clinics.address
//             distanceText / estimatedTime → 前端計算顯示用
// ==========================================================================
const favoriteClinics = [
  {
    clinicName: "台北動物醫院", // Clinics.clinicName
    address: "台北市大安區仁愛路四段 300 號", // Clinics.address
    distanceText: "0.8 km", // 前端計算後的顯示用距離
    estimatedTime: "5 分鐘",
    phone: "02-2700-1234", // Clinics.phone
  },
  {
    clinicName: "愛寵動物診所",
    address: "台北市信義區基隆路一段 180 號",
    distanceText: "1.2 km",
    estimatedTime: "8 分鐘",
    phone: "02-2720-5678",
  },
  {
    clinicName: "毛孩子動物醫院",
    address: "台北市松山區南京東路五段 88 號",
    distanceText: "2.1 km",
    estimatedTime: "12 分鐘",
    phone: "02-2760-9012",
  },
];

// 目前選中的目的地診所（預設第一間）
const selectedClinic = ref(favoriteClinics[0]);

// ==========================================================================
// 2. 寵物清單與多選狀態（對應 Pet 表）
// ==========================================================================

// 目前全域主寵物的 Pet.id（實際串接時從全域狀態或路由取得）
const currentPetId = ref("pet_01");

// 用戶名下所有寵物（對應 Pet 表）
const petList = ref([
  {
    id: "pet_01", // Pet.id
    name: "小福", // Pet.name
    breed: "黃金獵犬", // Pet.breed
    weight: "13.6", // Pet.weight
    avatar: "",
  },
  {
    id: "pet_02",
    name: "Mimi",
    breed: "美國短毛貓",
    weight: "4.2",
    avatar: "",
  },
  {
    id: "pet_03",
    name: "巧克力",
    breed: "柴犬",
    weight: "10.2",
    avatar: "",
  },
]);

// 頭貼預設圖（Pet.avatar 為空時使用）
const defaultDogImage = "";

// 目前勾選的寵物 id 陣列（預設選中主寵物）
const selectedPetIds = ref([currentPetId.value]);

// 點擊寵物列切換勾選（主寵物鎖定不可取消）
function togglePetSelection(petId) {
  if (petId === currentPetId.value) return; // 主寵物鎖定

  const idx = selectedPetIds.value.indexOf(petId);
  if (idx === -1) {
    selectedPetIds.value.push(petId);
  } else {
    selectedPetIds.value.splice(idx, 1);
  }

  // 自動同步寵物數量按鈕
  const total = selectedPetIds.value.length;
  petCount.value = total >= 3 ? "3" : String(total);
}

// ==========================================================================
// 3. 寵物數量與特殊需求
// ==========================================================================
const petCount = ref("1"); // 寵物數量快捷按鈕
const description = ref(""); // 特殊需求備註（對應 ReminderEvents.description 語意）

// ==========================================================================
// 4. 計程車服務商清單（對應 TaxiServiceProviders 表）
//    欄位：providerId, providerName, isPetFriendly, isActive
//    前端額外顯示用欄位：icon, eta, priceText, rating, features, isRecommended
// ==========================================================================
const taxiProvidersList = ref([
  {
    providerId: "taxi", // TaxiServiceProviders.providerId
    providerName: "寵物友善計程車", // TaxiServiceProviders.providerName
    isPetFriendly: true, // TaxiServiceProviders.isPetFriendly
    isActive: true, // TaxiServiceProviders.isActive
    isRecommended: true,
    icon: "🚕",
    eta: "3 分鐘",
    priceText: "起跳 NT$85",
    rating: 4.8,
    features: ["寵物友善", "大型車廂", "司機有養寵物"],
  },
  {
    providerId: "uber",
    providerName: "Uber Pet",
    isPetFriendly: true,
    isActive: true,
    isRecommended: false,
    icon: "🚗",
    eta: "5 分鐘",
    priceText: "預估 NT$120-180",
    rating: 4.7,
    features: ["寵物友善", "GPS 追蹤", "線上付款"],
  },
  {
    providerId: "van",
    providerName: "寵物專車",
    isPetFriendly: true,
    isActive: true,
    isRecommended: false,
    icon: "🚐",
    eta: "15 分鐘",
    priceText: "固定 NT$350",
    rating: 4.9,
    features: ["專業寵物運輸", "籠架固定", "急救設備"],
  },
  {
    providerId: "ambulance",
    providerName: "寵物救護車",
    isPetFriendly: true,
    isActive: false, // 目前不可用
    isRecommended: false,
    icon: "🚑",
    eta: "20 分鐘",
    priceText: "NT$800 起",
    rating: 5.0,
    features: ["緊急醫療", "獸醫隨行", "24H 服務"],
  },
]);

// 目前選中的服務商 providerId（預設 "taxi"）
const selectedProviderId = ref("taxi");

// 取得當前選中服務商名稱（用於叫車成功彈窗）
const currentProviderName = computed(() => {
  const target = taxiProvidersList.value.find(
    (p) => p.providerId === selectedProviderId.value,
  );
  return target ? target.providerName : "友善車輛";
});

// ==========================================================================
// 5. 按鈕事件函式
// ==========================================================================

// Banner 定位按鈕（預留串接 Geolocation API）
function handleLocate() {
  alert("📍 正在取得您的目前位置...");
  // TODO：呼叫 navigator.geolocation 取得經緯度
}

// 立即叫車
function handleCallTaxi() {
  alert(
    `🎉 叫車成功！\n系統已為您派遣【${currentProviderName.value}】\n司機正在前往您的位置，預計 3 分鐘後抵達！\n特殊需求：${description.value || "無"}`,
  );
}

// 直接撥打診所電話（使用 Clinics.phone）
function handleCallClinic() {
  alert(
    `📞 已複製並為您撥打【${selectedClinic.value.clinicName}】的電話：${selectedClinic.value.phone}`,
  );
}
</script>
