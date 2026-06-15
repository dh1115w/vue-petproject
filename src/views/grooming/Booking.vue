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
            <router-link to="/grooming/Appointments" class="btn btn-outline-alt" style="width: 100%; display: block; text-decoration: none;">
              📋 查看我的預約紀錄
            </router-link>
          </div>
        </div>

        <form class="form-container" style="margin-top: 0;" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="petSelect">選擇您的毛孩 (pet_id)</label>
            <select id="petSelect" v-model="form.pet_id" required> 
              <option value="">-- 請選擇毛孩 --</option>
              <option v-for="pet in pets" :key="pet.id" :value="pet.id">{{ pet.name }} ({{ pet.breed }}/{{ pet.age }}歲)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="petSize">毛孩體型 (Size)</label>
            <select id="petSize" v-model="form.pet_size" required>
              <option value="" disabled>-- 請選擇體型 --</option>
              <option value="S">小型 (S) - 5kg 以下</option>
              <option value="M">中型 (M) - 5-15kg</option>
              <option value="L">大型 (L) - 15kg 以上</option>
            </select>
          </div>
          <div class="form-group">
            <label for="serviceSelect">選擇服務項目 (service_id)</label>
            <div v-if="incompatibleServiceWarning" class="warning-message">
              {{ incompatibleServiceWarning }}
            </div>
            <select id="serviceSelect" v-model="form.service_id" required>
              <option value="">-- 請選擇服務 --</option>
              <option v-for="service in filteredServices" :key="service.id" :value="service.id">{{ service.title }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="groomerSelect">指定美容師 (groomer_id)</label>
            <select id="groomerSelect" v-model="form.groomer_id" required>
              <option value="">
                {{ !form.service_id ? '-- 請先選擇服務項目 --' : '-- 請選擇美容師 --' }}
              </option> 
              <option v-for="groomer in filteredGroomers" :key="groomer.id" :value="groomer.id">
                {{ groomer.name }}
              </option>
            </select>
          </div>
          <div class="form-group grid grid-2" style="padding:0; gap:15px; margin-top:0;">
            <div>
              <label for="aptDate">預約日期</label>
              <input type="date" id="aptDate" v-model="form.apt_date_date" :min="minDate" required>
            </div>
            <div>
              <label for="timeSlot">可用時段</label>
              <select id="timeSlot" v-model="form.timeSlot" required :disabled="!form.apt_date_date || !form.groomer_id || isLoadingTimeSlots || timeSlotsError">
                <option value="" disabled>-- 請選擇時段 --</option>
                <option v-if="isLoadingTimeSlots" disabled>載入中...</option>
                <option v-else-if="timeSlotsError" disabled>載入失敗: {{ timeSlotsError }}</option>
                <option v-else-if="!availableTimeSlots.length && form.apt_date_date && form.groomer_id" disabled>此日期與美容師無可用時段</option>
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
            <label for="paymentMethod">訂金預付方式</label>
            <select id="paymentMethod" v-model="form.payment_method" required>
              <option value="credit_card">信用卡 / Google Pay</option>
              <option value="line_pay">LINE Pay</option>
              <option value="atm">虛擬帳號轉帳</option>
              <option value="store_credit">儲值金扣款</option>
            </select>
          </div>

          <div class="form-group">
            <label for="couponCode">優惠碼 (Coupon Code)</label>
            <div style="display: flex; gap: 10px;">
              <input type="text" id="couponCode" v-model="form.coupon_code" placeholder="輸入折扣碼，例如 PET80" style="flex: 1; text-transform: uppercase;">
              <span v-if="appliedCoupon" style="color: #2ecc71; align-self: center; font-weight: bold;">✓ 已套用</span>
            </div>
          </div>

          <div class="form-group">
            <label for="notes">備註事項 (notes)</label>
            <textarea id="notes" rows="4" v-model="form.notes" placeholder="請註明毛孩是否有過敏史、近期手術或特殊排斥行為..."></textarea>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <button type="submit" class="btn btn-primary">🐾 送出預約</button>
          </div>
        </form>
      </div>

      <!-- 確認預約彈窗 (Modal) -->
      <div v-if="isConfirmModalOpen" class="modal-overlay" @click.self="isConfirmModalOpen = false">
        <div class="card modal-content">
          <h3 class="modal-title">確認您的預約資訊</h3>
          <div class="modal-body">
            <p>毛孩：<strong>{{ selectedPetName }}</strong></p>
            <p>體型：<strong>{{ form.pet_size === 'S' ? '小型' : form.pet_size === 'M' ? '中型' : '大型' }}</strong></p>
            <p>服務：<strong>{{ selectedService ? selectedService.title : '未選擇' }}</strong></p>
            <p>美容師：<strong>{{ selectedGroomerName }}</strong></p>
            <p>日期：<strong>{{ form.apt_date_date }}</strong></p>
            <p>時段：<strong>{{ form.timeSlot }}</strong></p>
            <p v-if="estimatedDuration">預估時長：<strong>{{ estimatedDuration }} 分鐘</strong></p>
            <p v-if="form.notes">備註：<strong>{{ form.notes }}</strong></p>
            <p v-if="estimatedPrice">預估金額：<strong>NT$ {{ estimatedPrice }}</strong></p>
            <p v-if="appliedCoupon" style="color: #2ecc71;">已套用優惠：<strong>{{ appliedCoupon.label }}</strong></p>
            <hr />
            <p style="font-size: 1.1rem; color: #e67e22;">最終總計：<strong>NT$ {{ finalPrice }}</strong></p>
            <p style="font-size: 1.2rem; color: #d32f2f; font-weight: bold;">線上應付訂金 (30%)：NT$ {{ depositAmount }}</p>
            <p style="font-size: 0.9rem; color: #888;">到店支付尾款：NT$ {{ finalPrice - depositAmount }}</p>
            <p style="font-size: 0.85rem; color: #666; margin-top: 10px;">付款方式：<strong>{{ paymentMethodLabel }}</strong></p>
          </div>
          <div class="modal-actions">
            <button type="button" @click="confirmBooking" class="btn btn-primary flex-1" :disabled="isProcessingPayment">
              {{ isProcessingPayment ? '處理金流中...' : '前往付款' }}
            </button>
            <button type="button" @click="isConfirmModalOpen = false" class="btn btn-cancel flex-1">取消</button>
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

export default {
  name: 'BookingPage',
  components: { NavBar },
  data() {
    return {
      // 表單資料
      form: {
        member_id: 1, // 假設會員ID為1，實際應從登入狀態獲取
        // pet_id, pet_size, service_id, groomer_id, apt_date_date, timeSlot, notes
        pet_id: '',
        pet_size: '',
        service_id: '',
        groomer_id: '',
        apt_date_date: '',
        timeSlot: '',
        notes: '',
        coupon_code: '',
        payment_method: 'credit_card'
      },
      isConfirmModalOpen: false, // 控制確認預約彈窗顯示
      showToast: false,          // 控制 Toast 顯示
      toastMessage: '',          // Toast 顯示文字
      toastType: 'success',      // Toast 類型 (success / error)
      isProcessingPayment: false, // 模擬金流處理狀態
      coupons: [ // 模擬優惠券資料庫
        { code: 'PET80', discount: 0.8, type: 'percent', label: '新客首享 8 折' },
        { code: 'SAVE100', discount: 100, type: 'fixed', label: '滿額折 100 元' }
      ],
      pets: [ // Mock pet data
        { id: 1, name: '巧克力', breed: '貴賓', age: 3, type: 'dog', size: 'S' },
        { id: 2, name: 'Mimi', breed: '波斯貓', age: 2, type: 'cat', size: 'S' }
      ],
      groomers: [ // Mock groomer data
        { id: 1, name: 'Andy (大型犬專家)' },
        { id: 2, name: 'Emily (貓咪/造型專家)' },
        { id: 3, name: 'Jason (皮膚藥浴專家)' },
        { id: 4, name: 'Sophie (SPA/貓咪專家)' }
      ],
      services: [
        {
          id: 1,
          title: '基礎洗澡 (Basic Bath)',
          image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=300&fit=crop',
          minPrice: 500,
          duration: 60,
          features: ['溫和低敏洗毛精兩道清洗', '基礎修剪 (腳底毛、腹毛、肛門毛)', '清耳道、剪指甲、修腳圓'],
          allowedGroomers: [1, 2, 3, 4],
          allowedSpecies: ['dog', 'cat'],
          priceMap: { S: 500, M: 700, L: 900 },
          durationMap: { S: 60, M: 90, L: 120 }
        },
        {
          id: 2,
          title: '精緻造型剪毛 (Full Grooming)',
          image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&fit=crop',
          minPrice: 1200,
          duration: 120,
          features: ['包含所有「基礎洗澡」內容', '職人手剪全身造型', '客製化造型溝通'],
          allowedGroomers: [1, 2],
          allowedSpecies: ['dog'],
          priceMap: { S: 1200, M: 1800, L: 2500 },
          durationMap: { S: 120, M: 180, L: 240 }
        },
        {
          id: 3,
          title: '草本舒緩藥浴 (Medicated Bath)',
          image: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=500&h=300&fit=crop',
          minPrice: 800,
          duration: 90,
          features: ['針對皮膚過敏、止癢、異味處理', '天然植物萃取藥劑', '恆溫微氣泡抗菌處理'],
          allowedGroomers: [3, 4],
          allowedSpecies: ['dog'],
          priceMap: { S: 800, M: 1100, L: 1500 },
          durationMap: { S: 90, M: 120, L: 150 }
        },
        {
          id: 4,
          title: '深層芳療泥浴 (Mud Spa)',
          image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&h=300&fit=crop',
          minPrice: 1000,
          duration: 90,
          features: ['死海礦物泥深層吸附髒污', '舒壓按摩與熱敷', '讓毛髮重現光澤'],
          allowedGroomers: [4],
          allowedSpecies: ['dog'],
          priceMap: { S: 1000, M: 1400, L: 1800 },
          durationMap: { S: 90, M: 120, L: 150 }
        },
        {
          id: 5,
          title: '貓咪舒壓洗護 (Cat Relaxation Wash)',
          image: 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=500&h=300&fit=crop',
          minPrice: 800,
          duration: 90,
          features: ['專屬貓房獨立洗護', '低噪音低風速吹乾', '專業深層去油洗劑'],
          allowedGroomers: [2, 4],
          allowedSpecies: ['cat'],
          priceMap: { S: 800, M: 1200 },
          durationMap: { S: 90, M: 120 }
        },
        {
          id: 6,
          title: '貓咪廢毛梳理 (Cat De-shedding)',
          image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=300&fit=crop',
          minPrice: 600,
          duration: 60,
          features: ['深層去除底層廢毛', '專業不鏽鋼排梳技巧', '防止居家毛髮紛飛'],
          allowedGroomers: [2, 4],
          allowedSpecies: ['cat'],
          priceMap: { S: 600, M: 1000 },
          durationMap: { S: 60, M: 90 }
        }
      ],
      availableTimeSlots: [], // 儲存可用的預約時段
      isLoadingTimeSlots: false, // 載入時段的狀態
      timeSlotsError: null, // 載入時段的錯誤訊息
      incompatibleServiceWarning: '', // 儲存不相容服務的提示訊息
      minDate: new Date().toLocaleDateString('sv-SE') // 取得 YYYY-MM-DD 格式的今天日期
    }
  },
  mounted() {
    // 檢查網址是否有傳遞 petId 參數，如果有則自動選取該毛孩
    if (this.$route.query.petId) {
      this.form.pet_id = this.$route.query.petId;
    }
    // 檢查網址是否有傳遞 serviceId 參數，如果有則自動選取該服務
    if (this.$route.query.serviceId) {
      this.form.service_id = this.$route.query.serviceId;
    }
  },
  computed: {
    // 根據選中的 service_id 找出對應的服務物件
    selectedService() {
      return this.services.find(s => s.id == this.form.service_id);
    },
    selectedPetName() {
      const pet = this.pets.find(p => p.id == this.form.pet_id);
      return pet ? `${pet.name} (${pet.breed}/${pet.age}歲)` : '未選擇';
    },
    selectedGroomerName() {
      const groomer = this.groomers.find(g => g.id == this.form.groomer_id);
      return groomer ? groomer.name : '未選擇';
    },
    // 新增：根據毛孩種類過濾可選服務
    filteredServices() {
      // 如果尚未選擇毛孩（例如從服務頁面直接跳轉過來），顯示所有服務，確保自動填入功能正常
      if (!this.form.pet_id) return this.services;
      const pet = this.pets.find(p => p.id == this.form.pet_id);
      if (!pet) return this.services;
      return this.services.filter(s => s.allowedSpecies.includes(pet.type));
    },
    // 新增：動態計算預估價格
    estimatedPrice() {
      if (!this.form.pet_size || !this.form.service_id) return null;
      const service = this.services.find(s => s.id == this.form.service_id);
      if (service && service.priceMap) {
        return service.priceMap[this.form.pet_size] || service.minPrice;
      }
      return null;
    },
    // 新增：動態計算預估時長
    estimatedDuration() {
      if (!this.form.pet_size || !this.form.service_id) return null;
      const service = this.services.find(s => s.id == this.form.service_id);
      if (service && service.durationMap) {
        return service.durationMap[this.form.pet_size] || service.duration;
      }
      return null;
    },
    // 新增：根據所選服務動態計算可選擇的美容師清單
    filteredGroomers() {
      if (!this.form.service_id) return [];
      const service = this.services.find(s => s.id == this.form.service_id);
      if (!service || !service.allowedGroomers) return this.groomers; // 若無設定則顯示全部
      return this.groomers.filter(g => service.allowedGroomers.includes(g.id));
    },
    // 新增：尋找目前輸入的優惠券
    appliedCoupon() {
      if (!this.form.coupon_code) return null;
      return this.coupons.find(c => c.code.toUpperCase() === this.form.coupon_code.trim().toUpperCase());
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
    // 取得付款方式的中文顯示
    paymentMethodLabel() {
      const methods = {
        credit_card: '信用卡 / Google Pay',
        line_pay: 'LINE Pay',
        atm: '虛擬帳號轉帳',
        store_credit: '儲值金扣款'
      };
      return methods[this.form.payment_method] || '未選擇';
    }
  },
  watch: {
    // 新增：當切換毛孩時，若原選服務不適用該種類，則重設服務
    'form.pet_id'(newPetId, oldPetId) {
      // 清除任何先前的警告訊息
      this.incompatibleServiceWarning = '';

      const pet = this.pets.find(p => p.id == newPetId);
      // 只有當有選擇毛孩且之前有選服務時才檢查
      if (pet && this.form.service_id) {
        // 自動根據毛孩檔案預填體型，但使用者仍可手動更改
        this.form.pet_size = pet.size;

        const previouslySelectedService = this.services.find(s => s.id == this.form.service_id);
        if (previouslySelectedService && !previouslySelectedService.allowedSpecies.includes(pet.type)) {
          this.incompatibleServiceWarning = `您選擇的毛孩 (${pet.name}) 不適用「${previouslySelectedService.title}」服務，請重新選擇。`;
          this.form.service_id = ''; // 清空不相容的服務
        }
      }
    },
    // 當預約日期或美容師改變時，重新獲取可用時段 
    'form.apt_date_date': 'handleDateOrGroomerChange',
    'form.groomer_id': 'handleDateOrGroomerChange',
    // 新增：監控服務項目，若切換服務後目前的美容師不符合資格，則重設美容師選擇
    // 同時，當服務被手動更改時，清除不相容服務的警告
    'form.service_id'(newServiceId) {
      this.incompatibleServiceWarning = ''; // 服務改變時清除警告
      const service = this.services.find(s => s.id == newServiceId);
      if (service && service.allowedGroomers && !service.allowedGroomers.includes(this.form.groomer_id)) {
        this.form.groomer_id = '';
      }
    }
  },
  methods: {
    async fetchAvailableTimeSlots() {
      const { apt_date_date, groomer_id } = this.form;

      // 只有當日期和美容師都選定時才發送請求
      if (!apt_date_date || !groomer_id) {
        this.availableTimeSlots = [];
        this.timeSlotsError = null;
        return;
      }

      this.isLoadingTimeSlots = true;
      this.timeSlotsError = null;
      this.availableTimeSlots = []; 

      try {
        // 1. 定義店內所有的預約時段範本
        const allPossibleSlots = [
          { value: '10:00', label: '10:00 - 12:00' },
          { value: '13:00', label: '13:00 - 15:00' },
          { value: '15:30', label: '15:30 - 17:30' },
          { value: '18:00', label: '18:00 - 20:00' }
        ];

        // 2. 模擬從資料庫取得的「已預約/排班」資料
        // 格式：{ '日期': { 美容師ID: [已佔用時段] } }
        const mockBookedSchedule = {
          '2024-06-10': {
            1: ['10:00', '13:00'], // Andy 這天早上跟中午沒空
            2: ['15:30']           // Emily 這天下午沒空
          },
          '2024-06-11': {
            1: ['10:00', '13:00', '15:30', '18:00'], // Andy 全滿
            3: ['10:00']                             // Jason 只有早上沒空
          },
          '2024-06-15': {
            // 假設這天是店休或該美容師全天不排班，可以在這處理
            1: [], 2: [], 3: [], 4: [] 
          }
        };

        // 實際應用中，這裡會改用 API 獲取資料：
        // const response = await axios.get('/api/available-slots', { params: { date: apt_date_date, groomer_id } });
        // let slots = response.data;

        await new Promise(resolve => setTimeout(resolve, 500)); // 模擬 API 延遲

        // 3. 根據選定的日期與美容師，找出已被佔用的時段
        const daySchedule = mockBookedSchedule[apt_date_date] || {};
        const occupiedSlots = daySchedule[groomer_id] || [];

        // 4. 自動過濾：只留下未被佔用的時段
        this.availableTimeSlots = allPossibleSlots.filter(slot => !occupiedSlots.includes(slot.value));

        // 5. 如果過濾後完全沒有時段，可以給予提示（由 template 中的 v-else-if 處理）
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
      this.form.timeSlot = ''; // 清空已選時段
      this.fetchAvailableTimeSlots();
    },
    handleSubmit() {
      // 表單驗證 (在開啟確認彈窗前進行)
      if (!this.form.pet_id || !this.form.service_id || !this.form.groomer_id || !this.form.apt_date_date || !this.form.timeSlot) {
        alert('請填寫所有必填欄位！');
        return;
      }

      // 二次檢查防止過去日期
      if (this.form.apt_date_date < this.minDate) {
        alert('不可預約過去的日期！');
        return;
      }

      this.isConfirmModalOpen = true; // 驗證通過，打開確認彈窗
    },
    async confirmBooking() {
      this.isProcessingPayment = true;
      
      const appointmentData = {
        member_id: this.form.member_id,
        pet_id: parseInt(this.form.pet_id),
        service_id: parseInt(this.form.service_id),
        groomer_id: parseInt(this.form.groomer_id),
        apt_date: `${this.form.apt_date_date} ${this.form.timeSlot}:00`,
        total_price: this.finalPrice || this.estimatedPrice,
        deposit_paid: this.depositAmount,
        payment_method: this.form.payment_method,
        coupon_used: this.form.coupon_code,
        status: 1, // 假設 1 代表「已付訂金，待服務」
        notes: this.form.notes
      };
      
      console.log('正在導向金流串接頁面...', appointmentData);

      // 模擬金流轉址與驗證延遲
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      this.isProcessingPayment = false;

      // 關閉確認彈窗
      this.isConfirmModalOpen = false;

      // 顯示 Toast 成功通知
      this.triggerToast(`✅ 訂金 NT$ ${this.depositAmount} 支付成功！預約已確認。`, 'success');

      // 延遲跳轉頁面，讓使用者有時間看到 Toast 通知
      setTimeout(() => {
        // 預約成功後跳轉至紀錄頁面
        this.$router.push('/grooming/Appointments');
        // 重置表單 (在跳轉後進行，避免影響 Toast 訊息的顯示)
        this.form = { pet_id: '', service_id: '', groomer_id: '', apt_date_date: '', timeSlot: '', notes: '', coupon_code: '' };
      }, 1500); // 1.5 秒後跳轉
      
      // 呼叫 Line 通知方法 (這部分通常由後端處理更安全)
      this.sendLineNotification(appointmentData);
    },
    triggerToast(message, type = 'success') {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000); // 3秒後自動消失
    },
    async sendLineNotification(appointmentData) {
      // 實際應用中，這裡應該向您的後端 API 發送請求，由後端負責發送 Line 通知
      // 這樣可以避免將 Line Notify Token 暴露在前端程式碼中
      console.log('Attempting to send Line notification...');
      try {
        // 模擬後端 API 呼叫
        // const response = await axios.post('/api/send-line-notification', {
        //   message: `您的寵物美容預約已成功！\n毛孩: ${appointmentData.pet_id}\n時間: ${appointmentData.apt_date}`,
        //   userId: appointmentData.member_id // 或其他識別用戶的資訊
        // });
        console.log('Line notification simulated: Appointment confirmation sent for', appointmentData.apt_date);
      } catch (error) {
        console.error('Failed to send Line notification:', error);
      }
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
</style>
