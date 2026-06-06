<template>
 <!-- 最外層容器，自帶頁面淡入動畫 -->
<div class="transport-container page-enter">

  <!-- 新增的寵物接送 Banner 區塊 -->
  <div class="transport-banner">
    <!-- 這裡放您新增的寵物接送服務 Banner 圖片 -->
    <img src="@/images/taxi-service-banner01.jpg" alt="寵物接送 Banner" class="banner-image" />
    
    <!-- 頁面頂部標頭 (移入 Banner 內部) -->
    <header class="transport-header">
      <h1>寵物接送服務</h1>
      <p class="subtitle">寵物友善叫車服務，安心前往動物醫院</p>

      <!-- 新增按鈕保持在 Banner 內右側或適當位置 -->
      <button class="add-taxi-top-btn" @click="handleRecordInfo">
        ＋ 立即定位您的位置
      </button>
    </header>
  </div>

    <!-- 主排版區：採用標準 Grid 網格佈局（左側行程設定 + 右側叫車選項） -->
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
                <span class="address-text">台北市大安區敦化南路二段 100 號（目前位置）</span>
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
                  <div class="dest-name">{{ selectedClinic.name }}</div>
                  <div class="dest-address">{{ selectedClinic.address }}</div>
                </div>
                <span class="arrow-right-icon">▶</span>
              </div>

              <!-- 3. 常用診所快速選取按鈕群 -->
              <div class="quick-clinics-row">
                <button
                  v-for="clinic in recentClinics"
                  :key="clinic.name"
                  type="button"
                  class="clinic-chip-btn"
                  :class="{ 'is-active': selectedClinic.name === clinic.name }"
                  @click="selectedClinic = clinic"
                >
                  {{ clinic.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- 4. 三欄式行程數據預估 -->
          <div class="trip-info-estimate-grid">
            <div class="estimate-item">
              <div class="estimate-icon">🚀</div>
              <div class="estimate-value">{{ selectedClinic.distance }}</div>
              <div class="estimate-label">預估距離</div>
            </div>
            <div class="estimate-item">
              <div class="estimate-icon">🕒</div>
              <div class="estimate-value">{{ selectedClinic.estimatedTime }}</div>
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
        <div class="pawcare-card" style="margin-top: 1rem;">
          <h3 class="panel-small-title">寵物資訊</h3>
          <div class="pet-info-form-body">
            <!-- 寵物簡介橫條 -->
            <div class="pet-mini-profile-row">
              <img src="@/images/dog.jpg" alt="小福" class="driver-pet-avatar" />
              <div class="driver-pet-text">
                <div class="p-name">小福</div>
                <div class="p-desc">黃金獵犬 · 13.6 kg</div>
              </div>
              <span class="verified-check-mark">✅</span>
            </div>

            <!-- 寵物數量選擇 -->
            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">寵物數量</label>
              <div class="flex-buttons-row">
                <button v-for="n in ['1', '2', '3+']" :key="n" type="button" class="square-tab-btn" :class="{ 'is-active': petCount === n }" @click="petCount = n">{{ n }}</button>
              </div>
            </div>

            <!-- 需求備註輸入 -->
            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">特殊需求備註</label>
              <input type="text" v-model="specialNotes" placeholder="例：需要大型車廂、寵物有攻擊性..." class="form-input" />
            </div>
          </div>
        </div>

      </div>

      <!-- ==========================================
           【右側欄】：選擇叫車方式
           ========================================== -->
      <div class="right-ride-options-column">
        <!-- 叫車方式清單 -->
        <div class="pawcare-card">
          <h3 class="panel-small-title">選擇叫車方式</h3>
          <div class="ride-options-list">
            <div
              v-for="option in rideOptions"
              :key="option.id"
              class="ride-option-item-box"
              :class="{ 'is-selected': selectedRideId === option.id, 'is-disabled': !option.available }"
              @click="option.available && (selectedRideId = option.id)"
            >
              <div class="ride-item-top flex">
                <div class="ride-car-emoji">{{ option.icon }}</div>
                <div class="ride-car-info-main">
                  <div class="ride-car-name-row">
                    <span class="car-name-text">{{ option.name }}</span>
                    <span v-if="option.recommended" class="badge-recommend">推薦</span>
                    <span v-if="!option.available" class="badge-disabled">目前不可用</span>
                  </div>
                  <!-- 時間與車資 -->
                  <div class="ride-car-meta">
                    <span>🕒 {{ option.eta }}</span>
                    <span>💰 {{ option.price }}</span>
                    <span>⭐ {{ option.rating }}</span>
                  </div>
                  <!-- 特色貼紙標籤 -->
                  <div class="ride-features-wrap">
                    <span v-for="f in option.features" :key="f" class="feature-tag">🐾 {{ f }}</span>
                  </div>
                </div>
                <!-- 勾選狀態 -->
                <span v-if="selectedRideId === option.id && option.available" class="checked-circle">✓</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 安全提示框 -->
        <div class="safety-alert-notice-box">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content-text">
            <strong>安全提醒</strong>
            <p>建議將寵物放入提籠或使用安全帶固定，確保行車安全。司機已通過寵物友善認證訓練。</p>
          </div>
        </div>

        <!-- 立即叫車 CTA 按鈕 -->
        <button class="call-taxi-now-btn" @click="handleCallTaxi">🚗 立即叫車</button>
        <button class="call-clinic-direct-btn" @click="handleCallClinic">📞 直接撥打診所電話</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import '@/css/medical/medical-taxi-service.css'
// ==========================================================================
// 1. 常用動物醫院叫車數據
// ==========================================================================
const recentClinics = [
  { name: "台北動物醫院", address: "台北市大安區仁愛路四段 300 號", distance: "0.8 km", estimatedTime: "5 分鐘" },
  { name: "愛寵動物診所", address: "台北市信義區基隆路一段 180 號", distance: "1.2 km", estimatedTime: "8 分鐘" },
  { name: "毛孩子動物醫院", address: "台北市松山區南京東路五段 88 號", distance: "2.1 km", estimatedTime: "12 分鐘" }
]

// 當前選中的目的地診所（預設選中第一間 recentClinics[0]）
const selectedClinic = ref(recentClinics[0])

// ==========================================================================
// 2. 寵物資訊與需求雙向綁定數據
// ==========================================================================
const petCount = ref('1')      // 對應原檔的 useState("1")
const specialNotes = ref('')   // 對應原檔的 useState("")

// ==========================================================================
// 3. 叫車車款原始數據庫 (已完美同步你剛才提供的 4 種精準車種數據！)
// ==========================================================================
const rideOptions = ref([
  {
    id: "taxi",
    name: "寵物友善計程車",
    icon: "🚕",
    eta: "3 分鐘",
    price: "起跳 NT$85",
    rating: 4.8,
    features: ["寵物友善", "大型車廂", "司機有養寵物"],
    available: true,
    recommended: true,
  },
  {
    id: "uber",
    name: "Uber Pet",
    icon: "🚗",
    eta: "5 分鐘",
    price: "預估 NT$120-180",
    rating: 4.7,
    features: ["寵物友善", "GPS 追蹤", "線上付款"],
    available: true,
    recommended: false,
  },
  {
    id: "van",
    name: "寵物專車",
    icon: "🚐",
    eta: "15 分鐘",
    price: "固定 NT$350",
    rating: 4.9,
    features: ["專業寵物運輸", "籠架固定", "急救設備"],
    available: true,
    recommended: false,
  },
  {
    id: "ambulance",
    name: "寵物救護車",
    icon: "🚑",
    eta: "20 分鐘",
    price: "NT$800 起",
    rating: 5.0,
    features: ["緊急醫療", "獸醫隨行", "24H 服務"],
    available: false,
    recommended: false,
  },
])

// 當前選中的車款 ID（對應原檔預設的 "taxi"）
const selectedRideId = ref("taxi")

// ==========================================================================
// 4. 計算屬性（動態獲取當前選中車款的中文名稱，用於叫車成功的彈窗提示）
// ==========================================================================
const currentSelectedRideName = computed(() => {
  const target = rideOptions.value.find(o => o.id === selectedRideId.value)
  return target ? target.name : "友善車輛"
})

// ==========================================================================
// 5. 點擊按鈕的叫車事件處理函式 (純 JavaScript 邏輯)
// ==========================================================================
function handleCallTaxi() {
  alert(`🎉 叫車成功！\n系統已為您派遣【${currentSelectedRideName.value}】\n司機正在前往您的位置，預計 3 分鐘後抵達！\n特殊需求：${specialNotes.value || '無'}`)
}

function handleCallClinic() {
  alert(`📞 已複製並為您撥打【${selectedClinic.value.name}】的電話：02-2700-1234`)
}
</script>
