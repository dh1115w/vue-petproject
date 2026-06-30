<template>
  <div>
    <NavBar />

    <header class="grooming-hero-section">
      <div class="grooming-hero-inner">
        <h1>給毛孩最頂級的呵護</h1>
        <p>專業美容師團隊，透明化價格，提供最安心的洗剪洗藥浴服務</p>
      </div>
    </header>

    <div class="band band-white">
      <section class="features-section container reveal">
        <h2 class="section-title" data-en="PROMISE">我們的堅持</h2>
        <div class="grid grid-3">
          <div class="feature-item">
            <div class="feature-icon"><i class="fas fa-eye"></i></div>
            <h4>全程透明公開</h4>
            <p>開放式美容空間，家長最安心。</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><i class="fas fa-leaf"></i></div>
            <h4>天然草本洗劑</h4>
            <p>嚴選低敏配方，呵護毛孩肌膚。</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><i class="fas fa-award"></i></div>
            <h4>國際證照美容師</h4>
            <p>豐富經驗，安撫毛孩緊張情緒。</p>
          </div>
        </div>
      </section>
    </div>

    <div class="band band-cream">
    <section class="services-section container reveal">
      <h2 class="section-title" data-en="SERVICES">熱門服務項目</h2>

      <!-- 美容服務流程：當作熱門服務的副標，放在標題下、卡片上 -->
      <div class="process-grid">
        <div class="process-step">
          <div class="process-icon"><i class="fas fa-calendar-check"></i></div>
          <span class="process-num">STEP 1</span>
          <h4>線上預約</h4>
        </div>
        <div class="process-step">
          <div class="process-icon"><i class="fas fa-comments"></i></div>
          <span class="process-num">STEP 2</span>
          <h4>專業諮詢</h4>
        </div>
        <div class="process-step">
          <div class="process-icon"><i class="fas fa-cut"></i></div>
          <span class="process-num">STEP 3</span>
          <h4>細心美容</h4>
        </div>
        <div class="process-step">
          <div class="process-icon"><i class="fas fa-heart"></i></div>
          <span class="process-num">STEP 4</span>
          <h4>接回毛孩</h4>
        </div>
      </div>

      <div class="grid grid-3">
        <div v-for="service in featuredServices" :key="service.id" class="card service-card">
          <!-- 服務卡上方圖片：有 image 就用後端圖片，沒有或載入失敗就換成預設狗狗照 -->
          <img
            class="service-card-img"
            :src="service.image || '/grooming-img/dog1.jpg'"
            @error="useDefaultImage"
            alt="服務照片"
          />
          <div class="card-body">
            <h3 class="service-title-link">
              <router-link :to="{ path: '/grooming/booking', query: { serviceId: service.id } }" style="color: inherit; text-decoration: none;">{{ service.title }}</router-link>
            </h3>
            <p class="price">NT$ {{ service.price }} 起</p>
            <p class="duration">⏱ 時長：{{ service.duration }} 分鐘</p>
            <p class="desc">{{ service.desc || '專業細心的美容護理，給毛孩最舒適放鬆的體驗。' }}</p>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <router-link to="/grooming/services" class="btn btn-outline">查看完整服務內容與價格表</router-link>
      </div>
    </section>
    </div>

    <!-- 精選好評區塊：只在有抓到評價時才顯示（外層 band 也跟著一起顯示/隱藏） -->
    <div v-if="featuredReviews.length" class="band band-white">
    <section class="testimonials-section container reveal">
      <h2 class="section-title" data-en="REVIEWS">毛孩家長怎麼說</h2>
      <div class="grid grid-3">
        <div v-for="review in featuredReviews" :key="review.id" class="card testimonial-card">
          <div class="testimonial-stars">
            <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= review.rating }">★</span>
          </div>
          <p class="testimonial-text">「{{ review.comment }}」</p>
          <div class="testimonial-footer">
            <span class="testimonial-user">{{ review.userName }}</span>
            <span class="testimonial-groomer">美容師：{{ review.groomerName }}</span>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <router-link to="/grooming/reviews" class="btn btn-outline">查看更多顧客評價</router-link>
      </div>
    </section>
    </div>

    <!-- 優惠促銷區塊：滿版綠色帶（沒促銷時整條 band 一起隱藏） -->
    <div v-if="isPromoActive" class="band band-promo">
    <section ref="promoSection" class="promo-section container">
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
          >{{ promoData.promoCode }}</span>
          {{ promoData.discountText }}。
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
    </div>

    <!-- Toast 提示區塊 -->
    <transition name="toast-fade">
      <div v-if="showToast" :class="['toast-notification', toastType]">
        <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i> {{ toastMessage }}
      </div>
    </transition>

    <div class="band band-cream">
    <section class="contact-section container reveal">
      <h2 class="section-title" data-en="CONTACT">聯絡我們</h2>
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

  </div>
</template>

<script>
import NavBar from './NavBar.vue'
// 【合併前要還原】組員原本寫 '@/api/groomingApi'，但本專案沒有 src/api 資料夾，會導致整個專案編譯失敗。
// 暫時改成相對路徑 './groomingApi'（指向同資料夾的假資料檔），讓本機能跑。上傳 GitHub 前要改回 '@/api/groomingApi'。
import { getFeaturedServices, getActivePromotion, getReviews } from './groomingApi';

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
      featuredReviews: [], // 首頁精選好評（從所有評價中挑評分最高的前 3 筆）
      promoData: {
        promoCode: '',
        endDate: '',
        title: '',
        description: '',
        discountText: '',
        tag: ''
      }
    }
  },
  async mounted() {
    await this.fetchInitialData();
    await this.fetchFeaturedReviews();

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

    // 等畫面更新完（含 v-if 的好評區渲染好），再把所有 reveal 區塊加入觀察
    await this.$nextTick();
    this.$el.querySelectorAll('.reveal').forEach(el => {
      this.observer.observe(el);
    });
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
        // 抓資料失敗時，把促銷橫幅藏起來，避免露出沒有內容的空殼橫幅
        this.isPromoActive = false;
      }
    },
    // 抓所有評價，挑出整體評分最高的前 3 筆，當首頁的「精選好評」
    async fetchFeaturedReviews() {
      try {
        const response = await getReviews();
        const all = response.data || [];
        // 複製一份再排序（不要直接改到原陣列），依 rating 由高到低排，取前 3 筆
        const sorted = [...all].sort((a, b) => b.rating - a.rating);
        this.featuredReviews = sorted.slice(0, 3);
      } catch (error) {
        console.error('獲取精選評價失敗:', error);
        // 抓失敗就讓區塊維持空陣列、不顯示，不影響首頁其他內容
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
    },
    // 服務卡圖片載入失敗時（例如後端圖檔不存在）自動換成預設狗狗照
    useDefaultImage(e) {
      // 已經是預設圖就不再換，避免無限觸發 error
      if (e.target.src.includes('dog1.jpg')) return;
      e.target.src = '/grooming-img/dog1.jpg';
    }
  }
}
</script>

<style scoped>
/* 引入 FontAwesome 圖示庫 CSS */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* 引入優雅襯線字 Playfair Display，只用在標題的英文浮水印上 */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');

@import '@/css/grooming/index.css';

/* 將內聯樣式整理至此 */
.grooming-hero-section {
  /* 換成寵物照片，並加入半透明遮罩確保文字易讀 */
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/grooming-img/image_ea51f7f9.png');
  background-size: cover;
  /* 取景往上移（35%），寬螢幕時才不會把狗狗的頭/耳朵切到上緣 */
  background-position: center 35%;
  
  /* 滿版主視覺：不限制寬度，鋪滿整個畫面寬度 */
  /* 高度隨螢幕寬度等比縮放：寬螢幕自動變高（有氣勢），窄螢幕自動變矮（避免變正方形把狗裁爆）；
     最矮不低於 360px、最高不超過 520px */
  height: clamp(360px, 40vw, 520px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.grooming-hero-inner {
  color: #fff;
  text-align: center; /* 讓內容與按鈕置中 */
}

.grooming-hero-inner p {
  color: #ffffff;
  font-size: 1.25rem; /* 放大副標題 */
  text-shadow: 0 1px 5px rgba(0,0,0,0.5); /* 增加陰影確保在背景圖上更易讀 */
  margin-bottom: 20px;
}

.grooming-hero-inner h1 {
  font-size: 3rem; /* 放大主標題 */
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

/* 首頁專用：刻意覆蓋 index.css 共用的 .section-title（改成置中＋加字距） */
.section-title {
  text-align: center;
  letter-spacing: 0.4em;
  text-indent: 0.4em;   /* 抵銷最後一個字的右側間距，確保視覺完全置中 */
  font-size: 1.85rem;   /* 放大中文標題（原本繼承 index.css 的 1.5rem） */
  font-weight: 700;
  margin-bottom: 30px;
  color: #2c3e50;
}

/* 標題後面的大字英文浮水印（ghost text）：只有掛了 data-en 的標題才出現 */
.section-title[data-en] {
  position: relative;
}
.section-title[data-en]::before {
  content: attr(data-en);          /* 直接把 data-en 的值印出來當底字 */
  position: absolute;
  left: 50%;
  top: 50%;
  /* Y 從 -50%(正中) 改成 -68%，把英文往上推，露在中文標題上方 */
  transform: translate(-50%, -68%);
  font-family: 'Playfair Display', Georgia, serif; /* 優雅高對比襯線字 */
  font-size: clamp(4rem, 13vw, 6.5rem); /* 加大；手機自動縮小避免超出畫面 */
  font-weight: 800;
  letter-spacing: 0.05em;
  text-indent: 0;                  /* 不要被標題的 text-indent 影響 */
  text-transform: uppercase;
  color: rgba(107, 174, 138, 0.2); /* 提高不透明度，浮水印更明顯 */
  white-space: nowrap;
  z-index: -1;                     /* 沉到中文標題後面 */
  pointer-events: none;
}

/* 進場動畫：捲到畫面前是隱形＋往下偏移，加上 is-visible 後淡入上滑 */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
  will-change: opacity, transform;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 全寬背景色帶：外層 .band 滿版上色，內層 .container 仍置中 */
.band {
  width: 100%;
  padding: 50px 0;   /* 區塊上下間距改由 band 控制 */
}
.band > section {
  /* 只歸零上下間距（交給 band 的 padding），保留左右 auto 讓 container 維持置中 */
  margin-top: 0;
  margin-bottom: 0;
}
.band-white { background: #ffffff; }   /* 白 */
.band-cream { background: #f3f0e8; }   /* 暖米（--muted） */
/* 滿版綠色帶：綠色漸層降低不透明度，讓底圖狗狗照透出來、又不影響文字閱讀 */
.band-promo {
  background: linear-gradient(135deg, rgba(190, 230, 190, 0.8), rgba(108, 136, 108, 0.78)),
              url('/grooming-img/dog3.jpg');
  background-size: cover;
  background-position: center;
  padding: 64px 0; /* 滿版綠帶上下多留白，更舒展 */
}

.features-section, .services-section {
  margin-top: 50px;
}

/* 首頁服務區塊改成寬版：覆蓋共用 .container 的 1100px 上限，讓三張卡更寬 */
.services-section.container {
  max-width: 1140px;
}
/* 三張卡片強制等高：grid 預設就會把同一列拉成一樣高 */
.services-section .grid {
  align-items: stretch;
}
.feature-item {
  text-align: center;
}
/* 圖示徽章：圓形淡綠底＋主色圖示，讓「我們的堅持」這區更有份量 */
.feature-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eef5ef;       /* 淡綠底 */
  color: var(--primary);     /* 主色圖示 */
  font-size: 1.9rem;
}
.feature-item h4 {
  margin-top: 10px;
  font-size: 1.3rem;        /* 放大標題（全程透明公開等） */
  font-weight: 800;          /* 從 index.css 整合過來 */
  color: var(--foreground);  /* 從 index.css 整合過來 */
}
.feature-item p {
  font-size: 1.05rem; /* 放大說明文字 */
  color: #666;
}
.service-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column; /* 圖片在上、文字在下，垂直排列 */
  /* 全站 home.css 有個同名 .service-card 用 margin:auto !important 把卡片擠窄，
     這裡用 !important 壓回 0，讓卡片正常撐滿 grid 格子 */
  margin: 0 !important;
}

/* 服務卡上方的圖片：填滿寬度、固定高度，object-fit 讓圖片不變形 */
.service-card-img {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;         /* 圖片填滿框框、超出的裁掉、不變形 */
  object-position: center;   /* 以中心為基準裁切 */
  background-color: #f0f0f0; /* 圖片載入前/載入中的底色 */
}

/* 文字區撐滿剩餘高度，讓三張卡底部對齊、整體等高 */
.service-card .card-body {
  padding: 20px 24px 22px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  text-align: center; /* 標題、價格、時長一律置中對齊 */
}
/* 標題預留固定高度：不管一行還是兩行，三張卡標題區都一樣高 */
.service-card .service-title-link {
  font-size: 1.3rem;
  margin-bottom: 8px;
  min-height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.service-card .price {
  font-size: 1.3rem;
}
.service-card .desc {
  margin-top: 10px;
}

/* 美容服務流程：當作「熱門服務項目」的副標，夾在標題與服務卡之間 */
.process-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 桌機四步驟並排 */
  gap: 20px;
  margin-top: 1.25rem;
  margin-bottom: 36px; /* 與下方服務卡保持區隔 */
}
.process-step {
  text-align: center;
  padding: 4px 10px;
  position: relative; /* 讓箭頭可以用絕對定位放在右邊 */
  /* 不用卡片外觀（背景/陰影/圓角），避免看起來像可以點的按鈕 */
}
/* 步驟之間的「→」箭頭：最後一步不加 */
.process-step:not(:last-child)::after {
  content: '➜';               /* 用比較粗的箭頭符號 */
  position: absolute;
  top: 22px;                 /* 對齊縮小後圓形圖示的中心高度 */
  right: -12px;              /* 落在格子之間的空隙上 */
  transform: translateY(-50%);
  font-size: 1.2rem;
  font-weight: 900;          /* 加粗 */
  color: var(--primary);
  opacity: 0.6;
}
/* 綠色圓形圖示（縮小、低調） */
.process-icon {
  width: 36px;
  height: 36px;
  margin: 0 auto 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 0.95rem;
}
.process-num {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--primary);
  margin-bottom: 2px;
}
.process-step h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 3px;
}
.process-step p {
  font-size: 0.78rem;
  color: #888;
  line-height: 1.45;
}
/* 手機版：四步驟改成兩欄 */
@media (max-width: 768px) {
  .process-grid {
    grid-template-columns: 1fr 1fr;
  }
  /* 兩欄時箭頭會指向空白，隱藏掉 */
  .process-step:not(:last-child)::after {
    display: none;
  }
}

/* 精選好評區塊 */
.testimonials-section {
  margin-top: 50px;
}
.testimonial-card {
  padding: 25px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}
.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.testimonial-stars {
  color: #ddd;          /* 未亮的星星灰色 */
  font-size: 1.1rem;
  margin-bottom: 12px;
}
.testimonial-stars .star-filled {
  color: #f1c40f;       /* 亮起的星星金黃色 */
}
.testimonial-text {
  flex-grow: 1;         /* 撐滿讓三張卡片底部對齊 */
  font-size: 0.95rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 15px;
}
.testimonial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #eee;
  padding-top: 12px;
  font-size: 0.85rem;
}
.testimonial-user {
  font-weight: bold;
  color: #333;
}
.testimonial-groomer {
  background: #f0f4ff;
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 4px;
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
  /* 壓掉全域 home.css 洩進來的 display:flex（會把標題縮成文字寬、綠線貼字）。
     改回 block，標題就跟其他區塊一樣滿版、綠線在最左 */
  display: block;
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

/* 宣傳區塊樣式：綠色已搬到外層 .band-promo，這裡只負責文字排版與淡入動畫 */
.promo-section {
  color: #166534;
  text-align: center;
  padding: 0 20px;

  /* 初始狀態：透明且往下偏移（只有內容淡入，綠色帶固定不動）*/
  opacity: 0;
  transform: translateY(40px);
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
  margin-bottom: 22px; /* 滿版後拉開間距，不要擠在一起 */
  letter-spacing: 1px;
}

.promo-content h2 {
  font-size: 1.8rem; /* 縮小標題字體 */
  margin-bottom: 26px;
  text-shadow: 0 1px 4px rgba(255,255,255,0.8); /* 淺色背景使用亮色陰影增加立體感 */
}

.promo-content p {
  font-size: 1rem; /* 縮小描述字體 */
  margin-bottom: 32px;
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