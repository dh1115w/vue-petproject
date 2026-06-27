<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <h2 class="section-title">預約寵物美容</h2>
      <div class="grid grid-2" style="align-items: start; gap: 40px;">
        <div class="booking-info-side">
          <div class="card reminder-card">
            <h4>🐾 預約溫馨小叮嚀</h4>
            <ol class="reminder-list">
              <li>為了毛孩的安全，若有心臟病、癲癇或具攻擊性行為請務必於備註告知。</li>
              <li>預約時段將為您保留 15 分鐘，逾時將自動取消並釋出時段。</li>
              <li>若欲取消預約，請於前一日至會員中心或來電取消。</li>
            </ol>
          </div>

          <div class="booking-visual-gallery">
            <div class="gallery-item dog-item">
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=400&fit=crop" alt="Dog Grooming" />
            </div>
            <div class="gallery-item cat-item">
              <img src="https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=500&h=400&fit=crop" alt="Cat Grooming" />
            </div>
          </div>

          <div class="card promise-card">
            <p>「每一位毛孩都是我們珍視的家人，我們承諾以最溫柔的耐心與專業，守護毛孩的笑容與健康。」</p>
          </div>

          <!-- 服務詳細說明預覽 -->
          <transition name="fade">
            <div v-if="selectedService" class="card service-preview-card" style="margin-top: 20px; border-left: 4px solid var(--primary-color);">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <img :src="selectedService.image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <h4 style="margin: 0; color: var(--primary-color);">{{ selectedService.title }}</h4>
                <span class="badge-duration">⏱ {{ estimatedDuration || selectedService.duration }} min</span>
              </div>
              <ul style="padding-left: 20px; margin: 0; font-size: 0.85rem; color: #666; line-height: 1.6;">
                <li v-for="feature in selectedService.features" :key="feature">✓ {{ feature }}</li>
              </ul>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee; text-align: right;">
                <span style="font-weight: bold; color: var(--primary-color);">價格自 NT$ {{ selectedService.minPrice }} 起</span>
              </div>
              <!-- 預估價格顯示（含折扣邏輯） -->
              <div v-if="estimatedPrice" style="margin-top: 5px; text-align: right;">
                <div v-if="!appliedCoupon" style="color: #e67e22; font-weight: bold; font-size: 1.1rem;">
                  預估金額：NT$ {{ estimatedPrice }}
                </div>
                <div v-else>
                  <div style="text-decoration: line-through; color: #999; font-size: 0.85rem;">原價：NT$ {{ estimatedPrice }}</div>
                  <div style="color: #2ecc71; font-size: 0.9rem; font-weight: bold;">✨ 已套用：{{ appliedCoupon.label }}</div>
                  <div style="color: #e67e22; font-weight: bold; font-size: 1.2rem;">折扣後金額：NT$ {{ finalPrice }}</div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 新增連結至預約紀錄 -->
          <div style="margin-top: 20px; text-align: center;">
            <router-link to="/grooming/appointments" class="btn btn-outline-alt" style="width: 100%; display: block; text-decoration: none;">
              📋 查看我的預約紀錄
            </router-link>
          </div>
        </div>

        <form class="form-container" style="margin-top: 0;" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="petSelect">選擇您的毛孩 (pet_id)</label>
            <select id="petSelect" v-model="form.petId" required> 
              <option value="">-- 請選擇毛孩 --</option>
              <option v-for="pet in pets" :key="pet.id" :value="pet.id">{{ pet.name }} ({{ pet.breed }}/{{ pet.age }}歲)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="petSize">毛孩體型 (Size)</label>
            <select id="petSize" v-model="form.size" required>
              <option value="" disabled>-- 請選擇體型 --</option>
              <option value="small">小型 - 5kg 以下</option>
              <option value="mid">中型 - 5-15kg</option>
              <option value="big">大型 - 15kg 以上</option>
            </select>
          </div>
          <div class="form-group">
            <label for="serviceSelect">選擇服務項目 (service_id)</label>
            <div v-if="incompatibleServiceWarning" class="warning-message">
              {{ incompatibleServiceWarning }}
            </div>
            <select id="serviceSelect" v-model="form.serviceId" required>
              <option value="">-- 請選擇服務 --</option>
              <option v-for="service in filteredServices" :key="service.id" :value="service.id">{{ service.title }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="groomerSelect">指定美容師 (groomer_id)</label>
            <select id="groomerSelect" v-model="form.groomerId" required>
              <option value="">
                {{ !form.serviceId ? '-- 請先選擇服務項目 --' : '-- 請選擇美容師 --' }}
              </option> 
              <option v-for="groomer in filteredGroomers" :key="groomer.id" :value="groomer.id">
                {{ groomer.name }}
              </option>
            </select>
          </div>
          <div class="form-group grid grid-2" style="padding:0; gap:15px; margin-top:0;">
            <div>
              <label for="aptDate">預約日期</label>
              <input type="date" id="aptDate" v-model="form.appointmentDate" :min="minDate" required>
              <!-- 新增：店休公告 -->
              <div v-if="isDateHoliday" class="holiday-announcement">
                ⚠️ 很抱歉，當日為店休日，暫不提供美容服務。
              </div>
            </div>
            <div>
              <label for="timeSlot">可用時段</label>
              <select id="timeSlot" v-model="form.timeSlot" required :disabled="!form.appointmentDate || !form.groomerId || isLoadingTimeSlots || timeSlotsError">
                <option value="" disabled>-- 請選擇時段 --</option>
                <option v-if="isLoadingTimeSlots" disabled>載入中...</option>
                <option v-else-if="timeSlotsError" disabled>載入失敗: {{ timeSlotsError }}</option>
                <option v-else-if="!availableTimeSlots.length && form.appointmentDate && form.groomerId" disabled>此日期與美容師無可用時段</option>
                <option 
                  v-for="slot in availableTimeSlots" 
                  :key="slot.value" 
                  :value="slot.value">
                  {{ slot.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>訂金預付方式</label>
            <p style="margin: 0;">PayPal（線上刷卡）</p>
          </div>

          <div class="form-group">
            <label for="couponCode">優惠碼 (Coupon Code)</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" id="couponCode" v-model="form.couponCode" placeholder="輸入折扣碼，例如 PET80" style="flex: 1; text-transform: uppercase;">
              <!-- 清空按鈕：僅在有輸入內容時顯示 -->
              <button 
                v-if="form.couponCode" 
                type="button" 
                @click="form.couponCode = ''" 
                class="btn-clear-coupon"
                title="清空優惠碼"
              >
                清空
              </button>
              <span v-if="appliedCoupon" style="color: #2ecc71; align-self: center; font-weight: bold;">✓ 已套用</span>
            </div>
            <div v-if="couponError" class="coupon-error-message">
              {{ couponError }}
            </div>
          </div>

          <div class="form-group">
            <label for="notes">備註事項 (notes)</label>
            <textarea id="notes" rows="4" v-model="form.note" placeholder="請註明毛孩是否有過敏史、近期手術或特殊排斥行為..."></textarea>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <button type="submit" class="btn btn-primary">🐾 送出預約</button>
          </div>
        </form>
      </div>

      <!-- 確認預約彈窗 (Modal) -->
      <div v-if="isConfirmModalOpen" class="modal-overlay" @click.self="closeConfirmModal">
        <div class="card modal-content">
          <h3 class="modal-title">確認您的預約資訊</h3>
          <div class="modal-body">
            <p>毛孩：<strong>{{ selectedPetName }}</strong></p>
            <p>體型：<strong>{{ form.size === 'small' ? '小型' : form.size === 'mid' ? '中型' : '大型' }}</strong></p>
            <p>服務：<strong>{{ selectedService ? selectedService.title : '未選擇' }}</strong></p>
            <p>美容師：<strong>{{ selectedGroomerName }}</strong></p>
            <p>日期：<strong>{{ form.appointmentDate }}</strong></p>
            <p>時段：<strong>{{ form.timeSlot }}</strong></p>
            <p v-if="estimatedDuration">預估時長：<strong>{{ estimatedDuration }} 分鐘</strong></p>
            <p v-if="form.note">備註：<strong>{{ form.note }}</strong></p>
            <p v-if="estimatedPrice">預估金額：<strong>NT$ {{ estimatedPrice }}</strong></p>
            <p v-if="appliedCoupon" style="color: #2ecc71;">已套用優惠：<strong>{{ appliedCoupon.label }}</strong></p>
            <hr />
            <p style="font-size: 1.1rem; color: #e67e22;">最終總計：<strong>NT$ {{ finalPrice }}</strong></p>
            <p style="font-size: 1.2rem; color: #d32f2f; font-weight: bold;">線上應付訂金 (30%)：NT$ {{ depositAmount }}</p>
            <p style="font-size: 0.9rem; color: #888;">到店支付尾款：NT$ {{ finalPrice - depositAmount }}</p>
            <p style="font-size: 0.85rem; color: #666; margin-top: 10px;">付款方式：<strong>{{ paymentMethodLabel }}</strong></p>
          </div>
          <div class="modal-actions" v-if="!paypalOrderId">
            <button type="button" @click="confirmBooking" class="btn btn-primary flex-1" :disabled="isProcessingPayment">
              {{ isProcessingPayment ? '處理中...' : '前往付款' }}
            </button>
            <button type="button" @click="closeConfirmModal" class="btn btn-cancel flex-1">取消</button>
          </div>
          <!-- 後端已經建立好 PayPal 訂單，這裡渲染 PayPal 官方按鈕讓使用者真正付款 -->
          <div v-else class="modal-actions" style="flex-direction: column; align-items: stretch;">
            <div id="paypal-button-container"></div>
            <button type="button" @click="cancelPayPalPayment" class="btn btn-cancel flex-1" style="margin-top: 10px;">取消付款</button>
          </div>
        </div>
      </div>

      <!-- Toast 提示區塊 -->
      <transition name="toast-fade">
        <div v-if="showToast" :class="['toast-notification', toastType]">
          <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i> {{ toastMessage }}
        </div>
      </transition>
    </main>


  </div>
</template>

<script>
import NavBar from './NavBar.vue'
import { getAvailableTimeSlots, createAppointment, getAllServices, getGroomers, validateCoupon, createGroomingPayment, captureGroomingPayment, cancelAppointment } from './groomingApi'
import useUserStore from '@/stores/user.js'

export default {
  name: 'BookingPage',
  components: { NavBar },
  data() {
    return {
      // 表單資料
      form: {
        // petId, size, serviceId, groomerId, appointmentDate, timeSlot, note, couponCode
        petId: '',
        size: '',
        serviceId: '',
        groomerId: '',
        appointmentDate: '',
        timeSlot: '',
        note: '',
        couponCode: '',
      },
      isConfirmModalOpen: false, // 控制確認預約彈窗顯示
      showToast: false,          // 控制 Toast 顯示
      toastMessage: '',          // Toast 顯示文字
      toastType: 'success',      // Toast 類型 (success / error)
      isProcessingPayment: false, // 是否正在處理金流（true 時按鈕要顯示 loading、不能再按）
      paypalOrderId: null,       // 跟後端建立好的 PayPal 訂單 id，PayPal 按鈕要用這個
      createdAppointmentId: null, // 「已建立但還沒付款」的預約 id；使用者若放棄付款，要靠它叫後端取消、釋放時段
      apiCoupon: null,           // 儲存 API 驗證後的優惠券資訊
      couponTimer: null,         // 用於 debounce 請求 (防抖)
      couponError: null,         // 新增：儲存優惠碼錯誤訊息
      pets: [], // 改成從 user.js 共用資料源撈，見 mounted()
      groomers: [], // 改成從後端 fetchGroomers() 撈，見 mounted()
      services: [],
      availableTimeSlots: [], // 儲存可用的預約時段
      isLoadingTimeSlots: false, // 載入時段的狀態
      timeSlotsError: null, // 載入時段的錯誤訊息
      incompatibleServiceWarning: '', // 儲存不相容服務的提示訊息
      // 國定假日等指定店休日（格式 YYYY-MM-DD）。已清掉過時的 2024 範例日期；
      // 要設特定店休日時把日期填進這個陣列，週一固定公休由下面的 fixedWeeklyOffDay 控制
      shopHolidays: [],
      fixedWeeklyOffDay: 1, // 週一公休
      minDate: new Date().toLocaleDateString('sv-SE') // 取得 YYYY-MM-DD 格式的今天日期
    }
  },
  async mounted() {
    await this.fetchServices();
    await this.fetchGroomers();

    // 讀 user.js 共用資料源：寵物清單 + 目前切換的寵物，預設帶入這隻
    const userStore = useUserStore();
    this.pets = userStore.pets.map(pet => ({
      ...pet,
      type: this.speciesToType(pet.species)
    }));
    if (userStore.selectPetId) {
      this.form.petId = userStore.selectPetId;
    }

    // 檢查網址是否有傳遞 petId 參數，如果有則自動選取該毛孩
    if (this.$route.query.petId) {
      this.form.petId = this.$route.query.petId;
    }
    // 檢查網址是否有傳遞 serviceId 參數，如果有則自動選取該服務
    if (this.$route.query.serviceId) {
      this.form.serviceId = this.$route.query.serviceId;
    }
  },
  computed: {
    // 根據選中的 service_id 找出對應的服務物件
    selectedService() {
      return this.services.find(s => s.id == this.form.serviceId);
    },
    selectedPetName() {
      const pet = this.pets.find(p => p.id == this.form.petId);
      return pet ? `${pet.name} (${pet.breed}/${pet.age}歲)` : '未選擇';
    },
    selectedGroomerName() {
      const groomer = this.groomers.find(g => g.id == this.form.groomerId);
      return groomer ? groomer.name : '未選擇';
    },
    // 新增：根據毛孩種類過濾可選服務
    filteredServices() {
      // 如果尚未選擇毛孩（例如從服務頁面直接跳轉過來），顯示所有服務，確保自動填入功能正常
      if (!this.form.petId) return this.services;
      const pet = this.pets.find(p => p.id == this.form.petId);
      // pet.type 判斷不出來（物種文字看不出貓狗）時，先顯示全部服務，不要整個擋掉
      if (!pet || !pet.type) return this.services;
      return this.services.filter(s => !s.allowedSpecies || s.allowedSpecies.includes(pet.type));
    },
    // 新增：動態計算預估價格
    estimatedPrice() {
      if (!this.form.size || !this.form.serviceId) return null;
      const service = this.services.find(s => s.id == this.form.serviceId);
      if (service && service.priceMap) {
        return service.priceMap[this.form.size] || service.minPrice;
      }
      return null;
    },
    // 新增：動態計算預估時長
    estimatedDuration() {
      if (!this.form.size || !this.form.serviceId) return null;
      const service = this.services.find(s => s.id == this.form.serviceId);
      if (service && service.durationMap) {
        return service.durationMap[this.form.size] || service.duration;
      }
      return null;
    },
    // 新增：根據所選服務動態計算可選擇的美容師清單
    filteredGroomers() {
      if (!this.form.serviceId) return [];
      const service = this.services.find(s => s.id == this.form.serviceId);
      if (!service || !service.allowedGroomers) return this.groomers; // 若無設定則顯示全部
      return this.groomers.filter(g => service.allowedGroomers.includes(g.id));
    },
    // 新增：尋找目前輸入的優惠券
    appliedCoupon() {
      return this.apiCoupon;
    },
    // 新增：計算最終折扣後價格
    finalPrice() {
      const basePrice = this.estimatedPrice;
      if (!basePrice) return null;
      
      const coupon = this.appliedCoupon;
      if (!coupon) return basePrice;

      if (coupon.type === 'percent') {
        return Math.round(basePrice * coupon.discount);
      } else if (coupon.type === 'fixed') {
        return Math.max(0, basePrice - coupon.discount);
      }
      return basePrice;
    },
    // 新增：計算訂金 (假設為總額 30%)
    depositAmount() {
      return this.finalPrice ? Math.round(this.finalPrice * 0.3) : 0;
    },
    // 取得付款方式的中文顯示（目前只有 PayPal 這個真的選項）
    paymentMethodLabel() {
      return 'PayPal';
    }
    // 新增：根據選定日期判斷是否為店休
    ,isDateHoliday() {
      if (!this.form.appointmentDate) return false;
      
      // 解析日期（使用 replace 確保相容性）
      const date = new Date(this.form.appointmentDate.replace(/-/g, '/'));
      const day = date.getDay();
      
      return day === this.fixedWeeklyOffDay || this.shopHolidays.includes(this.form.appointmentDate);
    }
  },
  watch: {
    // 新增：當切換毛孩時，自動帶入體型；若原選服務不適用該種類，則重設服務
    'form.petId'(newPetId, oldPetId) {
      // 清除任何先前的警告訊息
      this.incompatibleServiceWarning = '';

      const pet = this.pets.find(p => p.id == newPetId);
      if (!pet) return;

      // 自動根據毛孩檔案預填體型，但使用者仍可手動更改
      // 寵物資料庫沒填過體型的話 pet.size 會是 null，這種情況就不帶入，維持讓客人自己選
      if (pet.size) {
        this.form.size = pet.size;
      }

      // 只有「之前已經選過服務」才需要檢查現在這隻寵物還適不適用
      if (this.form.serviceId) {
        const previouslySelectedService = this.services.find(s => s.id == this.form.serviceId);
        if (previouslySelectedService && previouslySelectedService.allowedSpecies && !previouslySelectedService.allowedSpecies.includes(pet.type)) {
          this.incompatibleServiceWarning = `您選擇的毛孩 (${pet.name}) 不適用「${previouslySelectedService.title}」服務，請重新選擇。`;
          this.form.serviceId = ''; // 清空不相容的服務
        }
      }
    },
    // 當預約日期或美容師改變時，重新獲取可用時段
    'form.appointmentDate': 'handleDateOrGroomerChange',
    'form.groomerId': 'handleDateOrGroomerChange',
    // 體型會影響服務要花多久（duration），所以也要重新查可用時段
    'form.size': 'fetchAvailableTimeSlots',
    // 新增：監控服務項目，若切換服務後目前的美容師不符合資格，則重設美容師選擇
    // 同時，當服務被手動更改時，清除不相容服務的警告
    'form.serviceId'(newServiceId) {
      this.incompatibleServiceWarning = ''; // 服務改變時清除警告
      const service = this.services.find(s => s.id == newServiceId);
      if (service && service.allowedGroomers && !service.allowedGroomers.includes(this.form.groomerId)) {
        this.form.groomerId = '';
      }
      // 服務改變也會影響時長，重新查可用時段
      this.fetchAvailableTimeSlots();
    },
    // 新增：監控優惠碼輸入，自動呼叫 API 驗證
    'form.couponCode'(newCode) {
      clearTimeout(this.couponTimer);
      this.couponError = null; // 清除之前的錯誤訊息
      if (!newCode) {
        this.apiCoupon = null;
        this.couponError = null; // 清空時也清除錯誤
        return;
      }
      // 設定 500ms 延遲，避免打字時頻繁發送請求
      this.couponTimer = setTimeout(() => {
        this.verifyCoupon(newCode);
      }, 500);
    }
  },
  methods: {
    async fetchServices() {
      try {
        const response = await getAllServices();
        this.services = response.data;
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    },
    // 把寵物的 species（自由填寫文字，例如「貓」「狗」）轉成 'cat'/'dog'，
    // 抓不出來就回傳 null，filteredServices 那邊會處理（顯示全部服務，不會擋住）
    speciesToType(species) {
      if (!species) return null;
      const lower = species.toLowerCase();
      if (species.includes('貓') || lower.includes('cat')) return 'cat';
      if (species.includes('狗') || lower.includes('dog')) return 'dog';
      return null;
    },
    async fetchGroomers() {
      try {
        const response = await getGroomers();
        this.groomers = response.data;
      } catch (error) {
        console.error('Failed to fetch groomers:', error);
      }
    },
    // 新增：呼叫 API 驗證優惠碼
    async verifyCoupon(code) {
      this.couponError = null; // 每次驗證前先清除錯誤訊息
      if (!this.estimatedPrice) {
        // 還沒選好服務項目，沒有金額可以拿去檢查最低消費門檻，先不要送出去
        this.apiCoupon = null;
        this.couponError = '請先選擇服務項目，才能套用優惠碼';
        return;
      }
      try {
        const response = await validateCoupon(code, this.estimatedPrice);
        if (response.data.success) {
          this.apiCoupon = response.data.data;
          this.couponError = null; // 成功驗證則清除錯誤
        } else {
          // 如果後端回傳 success: false 但狀態碼不是 400
          this.apiCoupon = null;
          this.couponError = response.data.message || '優惠碼驗證失敗';
        }
      } catch (error) {
        this.apiCoupon = null; // 驗證失敗 (如 400 錯誤) 則清除套用狀態
        if (error.response && error.response.data && error.response.data.message) {
          this.couponError = error.response.data.message; // 顯示後端傳來的錯誤訊息
        } else {
          this.couponError = '優惠碼驗證失敗，請檢查網路或稍後再試。'; // 通用錯誤訊息
        }
      }
    },
    // 用服務 id + 體型找出對應的 pricingId（後端要靠這個查價格、時長）；找不到回 null
    findPricingId(serviceId, size) {
      const service = this.services.find(s => s.id == serviceId);
      return service && service.pricingIdMap ? service.pricingIdMap[size] : null;
    },
    async fetchAvailableTimeSlots() {
      const { appointmentDate, groomerId, serviceId, size } = this.form;

      // 日期、美容師、服務、體型都要選好，才知道要算哪個服務的可用時段
      if (!appointmentDate || !groomerId || !serviceId || !size) {
        this.availableTimeSlots = [];
        this.timeSlotsError = null;
        return;
      }

      // 用服務 + 體型找出對應的 pricingId（送給後端用來查時長）
      const pricingId = this.findPricingId(serviceId, size);
      if (!pricingId) {
        this.availableTimeSlots = [];
        this.timeSlotsError = null;
        return;
      }

      this.isLoadingTimeSlots = true;
      this.timeSlotsError = null;

      try {
        const response = await getAvailableTimeSlots({
          date: appointmentDate,
          groomer_id: groomerId,
          pricing_id: pricingId
        });
        this.availableTimeSlots = response.data;

        if (this.availableTimeSlots.length === 0) {
           console.log('當天該美容師已無可用時段');
        }
      } catch (error) {
        console.error('Error fetching available time slots:', error);
        this.timeSlotsError = '無法載入可用時段';
      } finally {
        this.isLoadingTimeSlots = false;
      }
    },
    handleDateOrGroomerChange() {
      // 如果已選擇日期且該日期為店休/週一公休
      if (this.form.appointmentDate && this.isDateHoliday) {
        this.triggerToast('⚠️ 此日期為店休日（週一公休或國定假日），請選擇其他日期。', 'error');
        this.form.appointmentDate = ''; // 強制清空已選日期
        this.form.timeSlot = '';      // 同時清空時段
        return;
      }
      this.form.timeSlot = ''; // 清空已選時段
      this.fetchAvailableTimeSlots();
    },
    handleSubmit() {
      // 表單驗證 (在開啟確認彈窗前進行)
      if (!this.form.petId || !this.form.serviceId || !this.form.groomerId || !this.form.appointmentDate || !this.form.timeSlot) {
        alert('請填寫所有必填欄位！');
        return;
      }

      // 二次檢查防止過去日期
      if (this.form.appointmentDate < this.minDate) {
        alert('不可預約過去的日期！');
        return;
      }
      
      if (this.isDateHoliday) {
        alert('當日為店休日，請重新選擇預約日期。');
        return;
      }

      this.isConfirmModalOpen = true; // 驗證通過，打開確認彈窗
    },
    async confirmBooking() {
      this.isProcessingPayment = true;

      // 用服務 + 體型找出對應的 pricingId，後端要靠這個查價格、時長
      const pricingId = this.findPricingId(this.form.serviceId, this.form.size);

      const appointmentData = {
        petId: parseInt(this.form.petId),
        groomerId: parseInt(this.form.groomerId),
        pricingId: pricingId,
        appointmentDate: this.form.appointmentDate,
        startTime: this.form.timeSlot,
        note: this.form.note
      };

      let appointmentId;
      try {
        const response = await createAppointment(appointmentData);
        appointmentId = response.data.id;
        // 記下這筆預約 id：它現在已經佔住時段了，等一下如果使用者放棄付款，要靠它叫後端取消
        this.createdAppointmentId = appointmentId;
      } catch (error) {
        this.isProcessingPayment = false;
        // 後端驗證沒通過時（例如時段被搶走了），把原因顯示給使用者看，不要靜默失敗
        this.triggerToast(`❌ ${this.extractErrorMessage(error, '預約失敗，請重新嘗試')}`, 'error');
        return;
      }

      // 預約建立成功後，跟後端建立 PayPal 訂單（付訂金，不是全額）
      try {
        const paymentResponse = await createGroomingPayment({
          appointmentId,
          amount: this.depositAmount,
          couponCode: this.appliedCoupon ? this.form.couponCode : null
        });
        this.paypalOrderId = paymentResponse.data.paypalOrderId;
      } catch (error) {
        this.isProcessingPayment = false;
        // PayPal 訂單沒建成功，等於沒辦法付款了，把剛剛建立的預約取消掉，不要留一筆卡住時段
        await this.cancelPendingAppointment();
        this.triggerToast(`❌ ${this.extractErrorMessage(error, 'PayPal 訂單建立失敗，請重新嘗試')}`, 'error');
        return;
      }

      this.isProcessingPayment = false;

      // 等畫面把 #paypal-button-container 渲染出來後，才能掛 PayPal 按鈕上去
      await this.$nextTick();
      await this.renderPayPalButton();
    },
    // 動態載入 PayPal 官方提供的 JS SDK（只有要用到的時候才載入，不放在 index.html 裡）
    loadPayPalScript() {
      if (window.paypal) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // Client ID 是設計給前端公開使用的（跟密碼性質的 Secret 不一樣），可以直接寫在這裡
        script.src = 'https://www.paypal.com/sdk/js?client-id=AZaFFX3VraF12lhqkQiNJ9V3i8OkFQa5XBuLG9VAQRcwtG-DXRtGKDMLSl7uz8CzxkJyBp9GjlngWjsU&currency=TWD';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },
    // 把 PayPal 官方的付款按鈕渲染到 #paypal-button-container 裡
    async renderPayPalButton() {
      try {
        await this.loadPayPalScript();
      } catch (error) {
        this.triggerToast('❌ PayPal 按鈕載入失敗，請檢查網路連線', 'error');
        return;
      }

      // 先把容器清空，避免「取消付款→再次前往付款」時舊的 PayPal 按鈕沒被清掉、疊出兩顆
      const container = document.getElementById('paypal-button-container')
      if (container) {
        container.innerHTML = ''
      }

      window.paypal.Buttons({
        // 訂單已經在後端建立好了，這裡只要回傳訂單 id，不用重新建立
        createOrder: () => this.paypalOrderId,
        onApprove: async (data) => {
          await this.handlePayPalApprove(data.orderID);
        },
        // 使用者在 PayPal 視窗按「取消」或直接關掉視窗時會進到這裡：
        // 把剛建立的預約取消掉，釋放時段，不要留一筆沒付款的卡在那
        onCancel: async () => {
          await this.cancelPendingAppointment();
          this.paypalOrderId = null;
          this.triggerToast('已取消付款，這筆預約未成立', 'error');
        },
        onError: (err) => {
          // 印到 console 方便除錯（按 F12 看 Console 分頁）
          console.error('PayPal Buttons onError:', err);
          this.triggerToast('❌ PayPal 付款發生錯誤，請重新嘗試', 'error');
        }
      }).render('#paypal-button-container');
    },
    // 使用者在 PayPal 視窗按確認後，呼叫後端真正請款
    async handlePayPalApprove(paypalOrderId) {
      try {
        await captureGroomingPayment(paypalOrderId);
      } catch (error) {
        console.error('captureGroomingPayment 失敗:', error);
        this.triggerToast(`❌ ${this.extractErrorMessage(error, '付款失敗，請重新嘗試')}`, 'error');
        return;
      }

      // 付款成功了，這筆預約正式成立，清掉「待取消」的記號（不可以再被當成棄單去取消）
      this.createdAppointmentId = null;

      // 關閉確認彈窗
      this.isConfirmModalOpen = false;
      this.paypalOrderId = null;

      // 顯示 Toast 成功通知
      this.triggerToast(`✅ 訂金 NT$ ${this.depositAmount} 支付成功！預約已確認。`, 'success');

      // 延遲跳轉頁面，讓使用者有時間看到 Toast 通知
      setTimeout(() => {
        // 預約成功後跳轉至紀錄頁面
        this.$router.push('/grooming/appointments');
        // 重置表單 (在跳轉後進行，避免影響 Toast 訊息的顯示)
        this.form = { petId: '', size: '', serviceId: '', groomerId: '', appointmentDate: '', timeSlot: '', note: '', couponCode: '' };
      }, 1500); // 1.5 秒後跳轉
    },
    // 使用者在 PayPal 按鈕渲染出來後反悔，按「取消付款」：
    // 先把剛建立、還沒付款的預約取消掉（釋放時段），再回到「前往付款」畫面
    async cancelPayPalPayment() {
      await this.cancelPendingAppointment();
      this.paypalOrderId = null;
    },
    // 共用：把「已建立但還沒付款」的預約叫後端取消，釋放它佔住的時段。
    // 取消成功或這筆本來就不存在都沒關係；取消失敗也不擋使用者操作（只記在 console）。
    async cancelPendingAppointment() {
      if (!this.createdAppointmentId) return;
      const idToCancel = this.createdAppointmentId;
      this.createdAppointmentId = null; // 先清掉，避免同一筆被重複取消
      try {
        await cancelAppointment(idToCancel);
      } catch (error) {
        console.error('取消未付款預約失敗:', error);
      }
    },
    // 關閉確認彈窗：如果裡面有「已建立但還沒付款」的預約，一起取消掉，避免關掉視窗就留下孤兒預約卡住時段
    async closeConfirmModal() {
      await this.cancelPendingAppointment();
      this.paypalOrderId = null;
      this.isConfirmModalOpen = false;
    },
    triggerToast(message, type = 'success') {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000); // 3秒後自動消失
    },
    // 把後端回傳的錯誤內容轉成「一定是字串」的訊息，不要讓畫面顯示 [object Object]
    // （後端有時候回的是純文字，但 Spring 系統發生未預期的錯誤時，回的會是一個物件）
    extractErrorMessage(error, fallback) {
      const data = error.response ? error.response.data : null;
      if (!data) return fallback;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      return fallback;
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/booking.css';

.reminder-card {
  background: #f8f9fa; /* 改為極淺灰色，增加區隔感但不失統一風格 */
  border: 1px solid #f0f0f0;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* 與 Services.vue 統一的陰影 */
}

.reminder-card h4 {
  color: var(--primary-color); /* 改為主題色，移除橘色 */
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: bold;
}

.reminder-list {
  padding-left: 20px;
  margin: 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.8;
}

/* 視覺藝廊樣式：雙圖交錯 */
.booking-visual-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 25px;
}

.gallery-item {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: 180px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.cat-item {
  margin-top: 20px; /* 營造高低錯落感 */
}

/* 服務承諾樣式優化 */
.promise-card {
  margin-top: 25px;
  padding: 25px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
  border: none;
  border-left: 4px solid var(--primary-color);
  text-align: center;
}

.promise-card p {
  color: var(--primary-color);
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
  margin: 0;
}

.reminder-list li {
  margin-bottom: 10px;
}

.reminder-list li:last-child {
  margin-bottom: 0;
}

.btn {
  width: fit-content;
  min-width: 140px; /* 統一按鈕最小寬度 */
  padding: 10px 30px;
}

/* 下拉選單與輸入框質感優化 */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
  font-size: 0.95rem;
}

select,
input[type="date"],
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s ease;
  outline: none;
}

/* 針對 select 的特別處理：自定義箭頭 */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  padding-right: 40px;
}

select:focus,
input[type="date"]:focus,
textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(100, 149, 237, 0.1); /* 柔和的主題色光暈 */
  background-color: #fff;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.btn-outline-alt {
  border: 1.5px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  text-align: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-outline-alt:hover {
  background: var(--primary-color);
  color: #fff;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.badge-duration {
  background: #f0f4ff;
  color: var(--primary-color);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  text-align: left;
  animation: slideIn 0.3s ease-out;
}

.modal-title {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.modal-body p {
  margin-bottom: 10px;
  font-size: 1rem;
  color: #555;
}

.modal-body p strong {
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.modal-actions .btn {
  flex: 1;
  padding: 12px 20px;
  font-size: 1rem;
  border-radius: 8px;
}

.btn-cancel {
  background: #e0e0e0;
  color: #555;
  border: none;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 警告訊息樣式 */
.warning-message {
  color: #e74c3c; /* 醒目的紅色 */
  background-color: #fef0f0; /* 淺紅色背景 */
  border: 1px solid #e74c3c;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

/* Toast 樣式 (從 groomingIndex.vue 複製) */
.toast-notification {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #166534; /* 使用與宣傳區一致的深綠色 */
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 9999;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none; /* 避免遮擋點擊 */
}

/* 錯誤狀態的 Toast 背景色 */
.toast-notification.error {
  background-color: #d32f2f;
}

.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 30px);
}

/* 店休公告樣式 */
.holiday-announcement {
  color: #d32f2f;
  background-color: #fdf2f2;
  border: 1px solid #fabebe;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 0.85rem;
  font-weight: bold;
  animation: slideIn 0.3s ease-out;
}

/* 清空按鈕樣式 */
.btn-clear-coupon {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-clear-coupon:hover {
  background-color: #eee;
  border-color: #ccc;
}

/* 新增：優惠碼錯誤訊息樣式 */
.coupon-error-message {
  color: #d32f2f; /* 醒目的紅色 */
  font-size: 0.85rem;
  margin-top: 5px;
  font-weight: bold;
}
</style>
