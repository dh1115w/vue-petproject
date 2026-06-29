<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">專業美容團隊</h2>
        <p class="section-subtitle">我們擁有最專業的美容師與頂級設備，給毛孩最細心的呵護</p>

        <!-- 貓咪／犬類分頁切換按鈕 -->
        <div class="category-filter">
          <button
            v-for="tab in ['all', 'dog', 'cat']"
            :key="tab"
            @click="filterType = tab"
            :class="['filter-btn', { active: filterType === tab }]"
          >
            {{ tab === 'all' ? '全部' : tab === 'dog' ? '犬類美容師' : '貓咪美容師' }}
          </button>
        </div>
      </header>

      <!-- 環境特色區塊 -->
      <section class="env-highlights">
        <div class="highlight-item">全透明開放式美容室</div>
        <div class="highlight-item">日系恆溫氣泡抗菌浴缸</div>
        <div class="highlight-item">毛孩專屬獨立安靜等候區</div>
      </section>

      <!-- 美容師網格佈局 -->
      <div class="staff-grid">
        <div v-for="staff in filteredStaffList()" :key="staff.id" class="card staff-card">
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

          <!-- 點了打開詳細介紹彈窗 -->
          <button class="btn-detail" @click="openDetail(staff)">看更多介紹</button>
        </div>
      </div>
    </main>

    <!-- 美容師詳細介紹彈窗 Modal：selectedStaff 有資料時才顯示 -->
    <div v-if="selectedStaff" class="staff-modal-overlay" @click="closeDetail">
      <!-- @click.stop：點彈窗內部不要關掉（只有點外面的灰底才關） -->
      <div class="staff-modal" @click.stop>
        <button class="modal-close" @click="closeDetail">×</button>

        <!-- 上半部：頭貼 + 姓名 + 在店狀態 + 評分 -->
        <div class="modal-header">
          <div class="modal-avatar-wrapper">
            <img :src="selectedStaff.image" :alt="selectedStaff.name" class="modal-img" />
          </div>
          <h3 class="modal-name">{{ selectedStaff.name }}</h3>
          <div class="duty-status-badge" :class="selectedStaff.isOnDuty ? 'on-duty' : 'off-duty'">
            {{ selectedStaff.isOnDuty ? '● 今日在店' : '○ 今日休假' }}
          </div>
          <div class="staff-rating" v-if="selectedStaff.rating">
            <div class="stars">
              <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= Math.round(selectedStaff.rating) }">★</span>
            </div>
            <span class="rating-text">{{ selectedStaff.rating }}</span>
          </div>
        </div>

        <!-- 下半部：一欄欄的詳細資料 -->
        <div class="modal-body">
          <div class="info-row">
            <span class="info-label">專長</span>
            <span class="info-value">{{ selectedStaff.specialty || '尚未填寫' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">可服務物種</span>
            <span class="info-value">{{ speciesText(selectedStaff.serviceSpecies) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">資歷</span>
            <span class="info-value">{{ selectedStaff.experience || '尚未填寫' }}</span>
          </div>
          <div class="info-block">
            <span class="info-label">個人簡介</span>
            <p class="info-bio">{{ selectedStaff.desc || '這位美容師還沒有填寫簡介。' }}</p>
          </div>
        </div>
      </div>
    </div>


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
      staffList: [],
      filterType: 'all',  // 目前選的分頁：all=全部、dog=犬類、cat=貓咪
      selectedStaff: null // 詳細介紹彈窗目前顯示哪位美容師（null=不顯示彈窗）
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
    },
    // 依照目前選的分頁，回傳要顯示的美容師清單（前端自己篩選，不用再跟後端要資料）
    filteredStaffList() {
      // 「全部」分頁：直接回傳整份清單
      if (this.filterType === 'all') {
        return this.staffList;
      }
      // 篩選規則：serviceSpecies 是 null（皆可）就一定顯示；
      // 否則看字串裡有沒有包含目前選的物種（dog 或 cat）
      return this.staffList.filter(staff => {
        if (!staff.serviceSpecies) {
          return true; // null 代表皆可，兩個分頁都看得到
        }
        return staff.serviceSpecies.includes(this.filterType);
      });
    },
    // 點「看更多介紹」：把這位美容師存起來，彈窗就會跟著顯示
    openDetail(staff) {
      this.selectedStaff = staff;
    },
    // 關閉彈窗：清空 selectedStaff，彈窗就消失
    closeDetail() {
      this.selectedStaff = null;
    },
    // 把後端的物種代碼轉成看得懂的中文
    speciesText(serviceSpecies) {
      if (!serviceSpecies) {
        return '貓咪、犬類皆可'; // null 代表不限
      }
      const canDog = serviceSpecies.includes('dog');
      const canCat = serviceSpecies.includes('cat');
      if (canDog && canCat) {
        return '貓咪、犬類皆可';
      }
      if (canDog) {
        return '犬類';
      }
      if (canCat) {
        return '貓咪';
      }
      return serviceSpecies; // 萬一是沒看過的值，原樣顯示
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

/* 貓咪／犬類分頁按鈕（樣式對齊 Services.vue 的篩選按鈕） */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
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

/* 「看更多介紹」按鈕 */
.btn-detail {
  margin-top: 15px;
  padding: 8px 24px;
  border: 1px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-detail:hover {
  background: var(--primary-color);
  color: #fff;
}

/* 彈窗的半透明灰底（蓋住整個畫面） */
.staff-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* 蓋在所有東西上面 */
  padding: 20px;
}

/* 白色彈窗本體 */
.staff-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto; /* 內容太長時可以捲動 */
  padding: 30px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* 右上角關閉的 × */
.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  border: none;
  background: transparent;
  font-size: 1.8rem;
  line-height: 1;
  color: #999;
  cursor: pointer;
}

.modal-close:hover {
  color: #333;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.modal-avatar-wrapper {
  width: 110px;
  height: 110px;
  background: #f0f4ff;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #eee;
  margin-bottom: 15px;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-name {
  margin: 0 0 10px;
  color: #333;
  font-size: 1.3rem;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 一行行的資料（左標題、右內容） */
.info-row {
  display: flex;
  gap: 12px;
}

.info-label {
  flex-shrink: 0;
  width: 80px;
  color: #999;
  font-size: 0.9rem;
}

.info-value {
  color: #333;
  font-weight: bold;
  font-size: 0.95rem;
}

/* 個人簡介（標題在上，內文在下） */
.info-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-bio {
  margin: 0;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.7;
}

/* 響應式調整：在手機版（螢幕寬度小於 768px）時變回直排 */
@media (max-width: 768px) {
  .env-highlights {
    flex-direction: column;
    align-items: center;
  }
}
</style>