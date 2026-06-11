<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">專業美容團隊</h2>
        <p class="section-subtitle">我們擁有最專業的美容師與頂級設備，給毛孩最細心的呵護</p>
      </header>

      <!-- 環境特色區塊 -->
      <section class="env-highlights">
        <div class="highlight-item">全透明開放式美容室</div>
        <div class="highlight-item">日系恆溫氣泡抗菌浴缸</div>
        <div class="highlight-item">毛孩專屬獨立安靜等候區</div>
      </section>

      <!-- 美容師網格佈局 -->
      <div class="staff-grid">
        <div v-for="staff in staffList" :key="staff.name" class="card staff-card">
          <div class="staff-avatar-wrapper">
            <img :src="staff.image" :alt="staff.name" class="staff-img" />
          </div>
          <h3>{{ staff.name }}</h3>
          <p class="staff-specialty">專長：{{ staff.specialty }}</p>
          <div class="staff-intro">
            <p class="staff-desc">{{ staff.desc }}</p>
            <p class="staff-experience">{{ staff.experience }}</p>
          </div>
        </div>
      </div>
    </main>


  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'StaffPage',
  components: { NavBar },
  data() {
    return {
      staffList: [
        { name: 'Andy', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop', specialty: '大型犬剪毛、造型設計', desc: '擁有10年資深美容經驗，擅長依據毛孩骨架設計最適合的職人造型。', experience: '曾榮獲全國寵物美容大賽優等獎，精通各類犬種標準賽級修剪。' },
        { name: 'Emily', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', specialty: '貓咪美容、草本藥浴', desc: '細心耐心的個性，專門處理高敏感貓咪，讓洗澡變成一種享受。', experience: '持有ISCC國際貓犬美容師認證，深耕貓咪行為學與草本皮毛調理。' },
        { name: 'Jason', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', specialty: '專業手剪、皮毛護理', desc: '專注於細節的手剪技巧，細心觀察每隻毛孩的皮膚狀況給予建議。', experience: '擁有豐富的皮毛生理學知識，致力於推廣「低壓力」的健康美容流程。' },
        { name: 'Sophie', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', specialty: '幼犬減壓美容', desc: '專門負責第一次美容的幼犬，用溫柔引導方式讓毛孩從此愛上美容。', experience: '擅長幼犬社交化美容，讓毛孩在幼年期建立對美容環境的信任與安全感。' }
      ]
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/index.css';

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

/* 三句特色文字的風格強化 */
.env-highlights {
  display: flex;
  flex-direction: row; /* 改為橫向排列 */
  justify-content: center; /* 水平置中 */
  flex-wrap: wrap; /* 內容過多時自動換行，避免擠壓 */
  gap: 20px;
  margin-bottom: 80px;
}

.highlight-item {
  font-size: 1.5rem; /* 字體加大 */
  font-weight: 800;  /* 加粗字體 */
  color: var(--primary-color);
  background: #f8f9fa; /* 與 Booking.vue 統一的淺灰色 */
  padding: 18px 45px;
  border-radius: 50px;
  border-left: 6px solid var(--primary-color); /* 增加主題色側邊條 */
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  width: fit-content;
  letter-spacing: 2px;
  
  /* 動態效果設定 */
  opacity: 0; /* 初始透明 */
  animation: fadeInUp 0.8s ease forwards; /* 執行進場動畫 */
}

/* 個別標籤的交錯延遲 (Staggered Animation) */
.highlight-item:nth-child(1) { animation-delay: 0.1s; }
.highlight-item:nth-child(2) { animation-delay: 0.3s; }
.highlight-item:nth-child(3) { animation-delay: 0.5s; }

/* 定義進場動畫：由下而上淡入 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px); /* 從下方 20px 的位置開始 */
  }
  to {
    opacity: 1;
    transform: translateY(0);    /* 回到原位 */
  }
}

/* 美容師卡片網格與 Services.vue 統一 */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px 40px;
  max-width: 900px;
  margin: 0 auto 100px;
  padding: 0 20px;
}

.staff-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.staff-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.staff-avatar-wrapper {
  width: 80px;
  height: 80px;
  background: #f0f4ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  overflow: hidden; /* 確保圖片不超出圓型範圍 */
  border: 2px solid #eee; /* 加上精緻的邊框 */
}

.staff-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持比例填滿 */
}

.staff-card h3 {
  margin-bottom: 10px;
  color: #333;
}

.staff-specialty {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 15px;
}

.staff-intro {
  margin-top: 10px;
}

.staff-desc {
  color: #000; /* 文字改為黑色 */
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 12px;
  font-weight: bold; /* 加上粗體 */
}

.staff-experience {
  color: #000; /* 文字改為黑色 */
  font-size: 0.95rem; /* 調整為與 staff-desc 一致的大小 */
  line-height: 1.6;   /* 同步行高確保視覺平衡 */
  font-weight: bold; /* 加上粗體 */
}

/* 響應式調整：在手機版（螢幕寬度小於 768px）時變回直排 */
@media (max-width: 768px) {
  .env-highlights {
    flex-direction: column;
    align-items: center;
  }
}
</style>