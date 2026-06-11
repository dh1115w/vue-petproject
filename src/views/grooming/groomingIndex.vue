<template>
  <div>
    <NavBar />

    <header class="hero">
      <div class="hero-content">
        <h1>給毛孩最頂級的呵護</h1>
        <p>專業美容師團隊，透明化價格，提供最安心的洗剪洗藥浴服務</p>
        <router-link to="/grooming/booking" class="btn btn-primary">立即預約服務</router-link>
      </div>
    </header>

    <section class="features-section container">
      <h2 class="section-title">我們的堅持</h2>
      <div class="grid grid-3">
        <div class="feature-item">
          <h4>全程透明公開</h4>
          <p>開放式美容空間，家長最安心。</p>
        </div>
        <div class="feature-item">
          <h4>天然草本洗劑</h4>
          <p>嚴選低敏配方，呵護毛孩肌膚。</p>
        </div>
        <div class="feature-item">
          <h4>國際證照美容師</h4>
          <p>豐富經驗，安撫毛孩緊張情緒。</p>
        </div>
      </div>
    </section>

    <section class="services-section container">
      <h2 class="section-title">熱門服務項目</h2>
      <div class="grid grid-3">
        <div class="card service-card">
          <div class="card-body">
            <h3 class="service-title-link">
              <router-link :to="{ path: '/grooming/booking', query: { serviceId: 1 } }" style="color: inherit; text-decoration: none;">基礎洗澡</router-link>
            </h3>
            <p class="price">NT$ 500 起</p>
            <p class="duration">⏱ 時長：60 分鐘</p>
            <p class="desc">包含剪指甲、清耳朵、擠肛門腺、溫和洗毛精清潔。</p>
          </div>
        </div>
        <div class="card service-card">
          <div class="card-body"> 
            <h3 class="service-title-link">
              <router-link :to="{ path: '/grooming/booking', query: { serviceId: 2 } }" style="color: inherit; text-decoration: none;">精緻造型剪毛</router-link>
            </h3>
            <p class="price">NT$ 1,200 起</p>
            <p class="duration">⏱ 時長：120 分鐘</p>
            <p class="desc">職人手剪、客製化造型溝通、全身毛髮蓬鬆打理。</p>
          </div>
        </div>
        <div class="card service-card">
          <div class="card-body"> 
            <h3 class="service-title-link">
              <router-link :to="{ path: '/grooming/booking', query: { serviceId: 3 } }" style="color: inherit; text-decoration: none;">草本舒緩藥浴</router-link>
            </h3>
            <p class="price">NT$ 800 起</p>
            <p class="duration">⏱ 時長：90 分鐘</p>
            <p class="desc">針對敏感肌毛孩，使用天然草本配方，改善皮膚問題。</p>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <router-link to="/grooming/services" class="btn btn-outline">查看完整服務內容與價格表</router-link>
      </div>
    </section>

    <!-- 優惠促銷區塊 -->
    <section v-if="isPromoActive" ref="promoSection" class="promo-section container">
      <div class="promo-content">
        <div class="promo-tag">LIMITED OFFER</div>
        <h2>夏日清爽大作戰！新客首享 8 折</h2>
        <p>
          即日起至本月底，首次預約「全套美容服務」，結帳輸入專屬代碼 
          <span 
            class="promo-code" 
            @click="copyCode('PET80')" 
            @keyup.enter="copyCode('PET80')"
            tabindex="0"
            role="button"
            title="點擊複製代碼"
          >PET80</span> 
          即享 8 折優惠。
        </p>
        
        <!-- 倒數計時器區塊 -->
        <div class="countdown-container">
          <div class="timer-item">
            <span class="timer-num">{{ countdown.days }}</span>
            <span class="timer-label">天</span>
          </div>
          <div class="timer-item">
            <span class="timer-num">{{ countdown.hours }}</span>
            <span class="timer-label">時</span>
          </div>
          <div class="timer-item">
            <span class="timer-num">{{ countdown.minutes }}</span>
            <span class="timer-label">分</span>
          </div>
          <div class="timer-item">
            <span class="timer-num">{{ countdown.seconds }}</span>
            <span class="timer-label">秒</span>
          </div>
        </div>

        <router-link to="/grooming/booking" class="btn btn-primary">
          立即預約領取優惠
        </router-link>
      </div>
    </section>

    <!-- Toast 提示區塊 -->
    <transition name="toast-fade">
      <div v-if="showToast" :class="['toast-notification', toastType]">
        <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i> {{ toastMessage }}
      </div>
    </transition>

    <section class="contact-section container">
      <h2 class="section-title">聯絡我們</h2>
      <div class="contact-grid">
        <a href="https://www.google.com/maps/search/?api=1&query=台北市大安區忠孝東路四段123號" target="_blank" rel="noopener noreferrer" class="contact-item contact-link" title="在 Google 地圖中開啟">
          <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
          <h4>地址</h4>
        </a>
        <a href="tel:+886223456789" class="contact-item contact-link" title="點擊撥打電話">
          <div class="contact-icon"><i class="fas fa-phone"></i></div>
          <h4>電話</h4>
        </a>
        <a href="https://line.me/R/ti/p/@pet_grooming" class="contact-item contact-link" target="_blank" rel="noopener noreferrer">
          <div class="contact-icon icon-line"><i class="fab fa-line"></i></div>
          <h4>LINE</h4>
        </a>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" class="contact-item contact-link">
          <div class="contact-icon icon-facebook"><i class="fab fa-facebook-f"></i></div>
          <h4>Facebook</h4>
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="contact-item contact-link">
          <div class="contact-icon icon-instagram"><i class="fab fa-instagram"></i></div>
          <h4>Instagram</h4>
        </a>
      </div>

      <!-- Google Map 嵌入區塊 -->
      <div class="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m121.5434729!2d25.0416757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abc30148c0cf%3A0x280e30349195325!2zMTA25Y-w5YyX5biC5aSn5a6J5Y2A5b-g5a2d6KeS6Lev5Zub5q61MTIz6Jmf!5e0!3m2!1szh-TW!2stw!4v1717400000000!5m2!1szh-TW!2stw"
          width="100%"
          style="border:0; border-radius: 15px;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>

  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'GroomingIndex',
  components: { NavBar },
  data() {
    return {
      countdown: {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00'
      }, 
      isPromoActive: true, // 新增：控制優惠區塊是否顯示
      showToast: false,    // 控制 Toast 顯示
      toastMessage: '',    // Toast 顯示文字
      toastType: 'success', // 新增：Toast 類型 (success / error)
      timerInterval: null
    }
  },
  mounted() {
    // 建立觀察器：偵測元素是否進入畫面
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.2 }); // 當 20% 的區塊出現在畫面時觸發

    if (this.$refs.promoSection) {
      this.observer.observe(this.$refs.promoSection);
    }

    // 啟動倒數計時
    this.startCountdown();
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect();
    if (this.timerInterval) clearInterval(this.timerInterval);
  },
  methods: {
    startCountdown() {
      // 設定目標時間：本月最後一天 23:59:59
      const now = new Date();
      const targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const update = () => {
        const currentTime = new Date().getTime();
        const diff = targetDate.getTime() - currentTime;

        if (diff <= 0) {
          clearInterval(this.timerInterval);
          this.isPromoActive = false; // 倒數結束，隱藏優惠區塊
          return;
        }

        this.countdown.days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
        this.countdown.hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        this.countdown.minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        this.countdown.seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        return diff;
      };

      const initialDiff = update();
      // 如果一開始就已經過期，則不需要啟動計時器
      if (initialDiff <= 0) {
        return;
      }
      this.timerInterval = setInterval(update, 1000);
    },
    copyCode(code) {
      navigator.clipboard.writeText(code).then(() => {
        this.toastMessage = '優惠代碼已複製：' + code;
        this.triggerToast('success');
      }).catch(err => {
        console.error('無法複製代碼', err);
        this.toastMessage = '複製失敗，請手動輸入代碼';
        this.triggerToast('error');
      });
    },
    triggerToast(type = 'success') {
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000); // 3秒後自動消失
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/index.css';

/* 將內聯樣式整理至此 */
.hero {
  /* 換成寵物照片，並加入半透明遮罩確保文字易讀 */
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), 
              url('https://images.unsplash.com/photo-1581888227599-779811939961?w=1200&h=450&fit=crop');
  background-size: cover;
  background-position: center;
  
  /* 調整為更適當的長方形比例 */
  height: 400px; 
  max-width: 1200px;
  margin: 30px auto;
  border-radius: 20px; /* 增加圓角讓視覺更柔和 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.hero-content {
  color: #fff;
}

.hero-content h1 {
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.features-section, .services-section {
  margin-top: 50px;
}
.feature-item {
  text-align: center;
}
.feature-item h4 {
  margin-top: 10px;
}
.feature-item p {
  font-size: 0.9rem;
  color: #666;
}
.service-card {
  padding: 0;
  overflow: hidden;
}
.card-body {
  padding: 20px;
}

.btn-outline {
  border: 1.5px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  text-align: center;
  padding: 10px 25px;
  border-radius: 6px;
  display: inline-block;
  text-decoration: none;
}
.btn-outline:hover {
  background: var(--primary-color);
  color: #fff;
}

.contact-section {
  margin-top: 50px;
  margin-bottom: 80px;
  text-align: center;
}

.contact-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.contact-item {
  width: 120px; /* 固定寬度 */
  height: 120px; /* 固定高度，使其成為正方形 */
  flex: none; /* 防止 flex 項目拉伸 */
  padding: 10px; /* 增加內邊距，確保內容不會貼邊 */
  background: #fff;
  box-sizing: border-box; /* 確保 padding 不會增加總尺寸 */
  border-radius: 15px;
  overflow: hidden; /* 確保內容不溢出邊界 */
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中內容 */
  justify-content: center; /* 垂直居中內容 */
  text-align: center; /* 確保文字居中 */
}

.contact-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.1);
}

.contact-icon {
  font-size: 1.7rem; /* 再稍微縮小圖標 */
  margin-bottom: 5px; /* 減少圖標與文字的間距 */
  color: #2c3e50;
  transition: color 0.3s ease;
}

.contact-item h4 {
  font-size: 0.85rem; /* 再稍微縮小文字 */
  margin: 0; /* 強制移除所有方向的預設邊距 */
  width: 100%; /* 寬度佔滿 */
  word-break: break-all; /* 防止長單字溢出 */
  color: #333;
}
.map-container {
  margin-top: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-radius: 15px;
  overflow: hidden;
}
.map-container iframe {
  /* 桌面版預設高度 */
  height: 450px;
  display: block; /* 移除 iframe 底部的微小間隙 */
}

@media (max-width: 768px) {
  .map-container iframe {
    /* 手機版自動調整為較小的高度 */
    height: 300px;
  }
}

/* 新增的宣傳區塊樣式 */
.promo-section {
  /* 改為更沉穩、柔和的綠色調漸層，降低亮度 */
  background: linear-gradient(135deg, rgba(190, 230, 190, 0.95), rgba(150, 200, 150, 0.9)), 
              url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  color: #166534; /* 深綠色文字，提升閱讀舒適度 */
  text-align: center;
  padding: 40px 20px; /* 縮小垂直內邊距，從 80px 改為 40px */
  margin-top: 30px; /* 縮小與上方區塊的間距 */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  
  /* 初始狀態：透明且往下偏移 50px */
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 1.2s ease-out, transform 1s ease-out;
  will-change: opacity, transform;
}

.promo-tag {
  display: inline-block;
  background: #166534; /* 標籤改為深綠背景 */
  color: #fff;
  padding: 5px 15px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 10px; /* 縮小間距 */
  letter-spacing: 1px;
}

.promo-content h2 {
  font-size: 1.8rem; /* 縮小標題字體 */
  margin-bottom: 15px;
  text-shadow: 0 1px 4px rgba(255,255,255,0.8); /* 淺色背景使用亮色陰影增加立體感 */
}

.promo-content p {
  font-size: 1rem; /* 縮小描述字體 */
  margin-bottom: 20px;
  line-height: 1.6;
}

.promo-code {
  background: rgba(255, 255, 255, 0.3); /* 調整為半透明白色，在較深背景下更清晰 */
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  border: 1px dashed #166534;
  cursor: pointer;
  transition: all 0.2s ease;
}

.promo-code:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

/* 當觀察器偵測到元素進入時觸發的狀態 */
.promo-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 倒數計時器樣式 */
.countdown-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px; /* 縮小計時器下方的間距 */
}
.timer-item {
  background: rgba(255, 255, 255, 0.8); /* 提高不透明度，讓數字在淺綠背景上更清晰 */
  padding: 8px; /* 縮小內部邊距 */
  border-radius: 10px;
  min-width: 55px; /* 縮小最小寬度 */
  backdrop-filter: blur(5px);
  border: 1px solid rgba(22, 101, 52, 0.2);
}
.timer-num {
  display: block;
  font-size: 1.5rem; /* 縮小數字大小 */
  font-weight: bold;
  line-height: 1.1;
}
.timer-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Toast 樣式 */
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

/* 聯絡資訊連結樣式 */
.contact-link {
  color: inherit;
  text-decoration: none;
}
/* Hover 狀態下的圖示顏色變化 */
.contact-item:hover .icon-line { color: #00c300; }
.contact-item:hover .icon-facebook { color: #1877f2; }
.contact-item:hover .icon-instagram { color: #e4405f; }
.contact-item:hover .fa-map-marker-alt { color: #d32f2f; }
.contact-item:hover .fa-phone { color: #2e7d32; }
</style>