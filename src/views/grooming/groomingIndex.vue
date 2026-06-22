<template>
  <div>
    <NavBar />

    <header class="grooming-hero-section">
      <div class="grooming-hero-inner">
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
        <div v-for="service in featuredServices" :key="service.id" class="card service-card">
          <div class="card-body">
            <h3 class="service-title-link">
              <router-link :to="{ path: '/grooming/booking', query: { serviceId: service.id } }" style="color: inherit; text-decoration: none;">{{ service.title }}</router-link>
            </h3>
            <p class="price">NT$ {{ service.price }} 起</p>
            <p class="duration">⏱ 時長：{{ service.duration }} 分鐘</p>
            <p class="desc">{{ service.desc }}</p>
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
        <div class="promo-tag">{{ promoData.tag }}</div>
        <h2>{{ promoData.title }}</h2>
        <p>
          {{ promoData.description }}
          <span 
            class="promo-code" 
            @click="copyCode(promoData.promoCode)" 
            @keyup.enter="copyCode(promoData.promoCode)"
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
          <div class="contact-icon icon-address"><i class="fas fa-map-marker-alt"></i></div>
          <p class="contact-info">台北市大安區忠孝東路四段123號</p>
        </a>
        <a href="tel:+886223456789" class="contact-item contact-link" title="點擊撥打電話">
          <div class="contact-icon icon-phone"><i class="fas fa-phone-alt"></i></div>
          <p class="contact-info">02-2345-6789</p>
        </a>
        <a href="https://line.me/R/ti/p/@pet_grooming" class="contact-item contact-link" target="_blank" rel="noopener noreferrer">
          <div class="contact-icon icon-line"><i class="fab fa-line"></i></div>
          <p class="contact-info">@pet_grooming</p>
        </a>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" class="contact-item contact-link">
          <div class="contact-icon icon-facebook"><i class="fab fa-facebook-f"></i></div>
          <p class="contact-info">Pet Grooming Studio</p>
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="contact-item contact-link">
          <div class="contact-icon icon-instagram"><i class="fab fa-instagram"></i></div>
          <p class="contact-info">@pet_grooming_life</p>
        </a>
      </div>
      <!-- 營業時間改為下方置中文字 -->
      <div class="business-hours-info">
        <i class="fas fa-clock"></i> 營業時間： 10:00 - 20:00 (週一公休)
      </div>
    </section>

  </div>
</template>

<script>
import NavBar from './NavBar.vue'
import { getFeaturedServices, getActivePromotion } from '@/api/groomingApi';

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
      timerInterval: null,
      featuredServices: [], // 從 API 獲取的服務
      promoData: {
        promoCode: '',
        endDate: '',
        title: '',
        description: '',
        tag: ''
      }
    }
  },
  async mounted() {
    await this.fetchInitialData();

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
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect();
    if (this.timerInterval) clearInterval(this.timerInterval);
  },
  methods: {
    async fetchInitialData() {
      try {
        const [servicesRes, promoRes] = await Promise.all([
          getFeaturedServices(),
          getActivePromotion()
        ]);
        
        this.featuredServices = servicesRes.data;
        this.promoData = promoRes.data;
        this.isPromoActive = promoRes.data.isActive;

        if (this.isPromoActive && this.promoData.endDate) {
          this.startCountdown(this.promoData.endDate);
        }
      } catch (error) {
        console.error('獲取首頁資料失敗:', error);
      }
    },
    startCountdown(endDateStr) {
      const targetDate = new Date(endDateStr);
      
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
/* 引入 FontAwesome 圖示庫 CSS */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

@import '@/css/grooming/index.css';

/* 將內聯樣式整理至此 */
.grooming-hero-section {
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

.grooming-hero-inner {
  color: #fff;
  text-align: center; /* 讓內容與按鈕置中 */
}

.grooming-hero-inner p {
  color: #ffffff;
  text-shadow: 0 1px 5px rgba(0,0,0,0.5); /* 增加陰影確保在背景圖上更易讀 */
  margin-bottom: 20px;
}

.grooming-hero-inner h1 {
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.section-title {
  text-align: center;
  letter-spacing: 0.4em; 
  text-indent: 0.4em;   /* 抵銷最後一個字的右側間距，確保視覺完全置中 */
  font-weight: 700;
  margin-bottom: 30px;
  color: #2c3e50;
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
  margin: 30px auto 0; /* 透過 auto 確保卡片區塊整體置中 */
  width: 100%;
  max-width: 780px; /* 5張卡片(140px*5) + 間距(20px*4) = 780px */
}

.contact-item {
  width: 140px; /* 進一步縮小寬度 */
  min-height: 100px; /* 降低最小高度 */
  flex: none; /* 防止 flex 項目拉伸 */
  padding: 15px 10px; /* 縮小內距讓版面更緊湊 */
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
  font-size: 1.8rem; /* 稍微縮小圖示尺寸 */
  margin-bottom: 6px; /* 調整圖示與資訊文字的間距 */
  color: #2c3e50; /* 預設深色 */
  transition: color 0.3s ease;
}

.contact-info {
  font-size: 0.7rem; 
  color: #777;
  margin-top: 5px;
  line-height: 1.4;
  word-break: break-all;
}

.business-hours-info {
  margin-top: 35px;
  font-size: 1.2rem; 
  color: #aca9a7; 
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* 宣傳區塊樣式 */
.promo-section {
  background: linear-gradient(135deg, rgba(190, 230, 190, 0.95), rgba(108, 136, 108, 0.9)), 
              url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  color: #166534;
  text-align: center;
  padding: 40px 20px;
  margin-top: 30px; 
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

/* 直接為圖示加上顏色，讓它不再只是純文字感 */
.icon-address { color: #d32f2f; }
.icon-phone { color: #2e7d32; }
.icon-line { color: #00c300; }
.icon-facebook { color: #1877f2; }
.icon-instagram { color: #e4405f; }

.contact-item:hover {
  background-color: #fdfdfd;
}
</style>