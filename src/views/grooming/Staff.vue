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
          <div class="duty-status-badge" :class="staff.isOnDuty ? 'on-duty' : 'off-duty'">
            {{ staff.isOnDuty ? '● 今日在店' : '○ 今日休假' }}
          </div>

          <div class="staff-rating" v-if="staff.rating">
            <div class="stars">
              <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= Math.round(staff.rating) }">★</span>
            </div>
            <span class="rating-text">{{ staff.rating }}</span>
          </div>
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
import { getGroomers } from './groomingApi'

export default {
  name: 'StaffPage',
  components: { NavBar },
  data() {
    return {
      staffList: []
    }
  },
  async mounted() {
    await this.fetchStaff();
  },
  methods: {
    async fetchStaff() {
      try {
        const response = await getGroomers();
        this.staffList = response.data;
      } catch (error) {
        console.error('獲取美容師團隊資料失敗:', error);
      }
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

.staff-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.stars {
  color: #ddd;
  font-size: 1.1rem;
}

.star-filled {
  color: #f1c40f;
}

.rating-text {
  font-weight: bold;
  color: #f39c12;
  font-size: 1rem;
}

.duty-status-badge {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
  font-weight: bold;
}

.on-duty {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.off-duty {
  background-color: #f5f5f5;
  color: #9e9e9e;
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