<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title" data-en="OUR TEAM">專業美容團隊</h2>
        <p class="section-subtitle">我們擁有最專業的美容師與頂級設備，給毛孩最細心的呵護</p>
      </header>

      <!-- E：品牌理念短文＋照片（左右兩欄） -->
      <section class="team-intro">
        <div class="team-intro-text-side">
          <h2 class="block-heading block-heading-left">以疼愛毛孩的心出發</h2>
          <p class="team-intro-text">
            我們相信，每一次美容都是一段被細心對待的時光。由專業美容師一對一純手吹完成，
            不關籠、不催趕，只為讓每隻毛孩在安心放鬆的環境裡，變得更漂亮、更健康。
          </p>
        </div>
        <div class="team-intro-img-side">
          <img src="/grooming-img/pet-blanket.jpg" alt="毛孩在店內舒適放鬆" class="team-intro-img" />
        </div>
      </section>

      <!-- F：團隊數據帶（數字先寫死，之後要接後端再改） -->
      <section class="team-stats">
        <div class="stat-item">
          <span class="stat-num">6</span>
          <span class="stat-label">位專業美容師</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">8</span>
          <span class="stat-label">年平均資歷</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">3000+</span>
          <span class="stat-label">服務過的毛孩</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">98%</span>
          <span class="stat-label">顧客好評率</span>
        </div>
      </section>

      <!-- 貓咪／犬類分頁切換按鈕（移到卡片正上方，篩選的就是下面的卡片） -->
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
/* 標題裝飾英文字用的優雅襯線字（和首頁同一支字型） */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');

/* === 標題裝飾英文字（外觀複製自首頁，只針對有 data-en 的標題，不影響其他頁面） === */
.section-title[data-en] {
  position: relative;
  text-align: center;
  letter-spacing: 0.4em;
  text-indent: 0.4em;   /* 抵銷最後一個字的右側間距，確保視覺完全置中 */
  font-size: 1.85rem;
  font-weight: 700;
  color: #2c3e50;
}
.section-title[data-en]::before {
  content: attr(data-en);          /* 直接把 data-en 的值印出來當底字 */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -68%); /* 往上推，露在中文標題上方 */
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(4rem, 13vw, 6.5rem); /* 手機自動縮小避免超出畫面 */
  font-weight: 800;
  letter-spacing: 0.05em;
  text-indent: 0;
  text-transform: uppercase;
  color: rgba(107, 174, 138, 0.2); /* 淺綠浮水印 */
  white-space: nowrap;
  z-index: -1;                     /* 沉到中文標題後面 */
  pointer-events: none;
}

/* === 區塊小標題（理念／環境 共用，置中、無左側色條） === */
.block-heading {
  position: relative;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--foreground);
  margin: 0 auto 24px;
  padding-bottom: 14px;
}
/* 標題下方的短綠線點綴 */
.block-heading::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: var(--primary-color);
}

/* === E：品牌理念短文＋照片（左右兩欄） === */
.team-intro {
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto 72px;
}
.team-intro-text-side {
  flex: 1;
  text-align: left;
}
.team-intro-img-side {
  flex: 1;
}
.team-intro-img {
  display: block;
  width: 100%;
  height: 300px;
  object-fit: cover;   /* 維持比例填滿、裁掉多餘 */
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.team-intro-text {
  font-size: 1.1rem;
  line-height: 2;
  color: #555;
  margin: 0;
}
/* 兩欄版的標題改成靠左（含底下短綠線一起靠左） */
.block-heading-left {
  text-align: left;
}
.block-heading-left::after {
  left: 0;
  transform: none;
}

/* === F：團隊數據帶 === */
.team-stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;        /* 窄螢幕自動換行 */
  gap: 24px 0;
  max-width: 960px;
  margin: 0 auto 84px;
  padding: 44px 20px;
  /* 淡綠漸層底＋細邊框，比純色更有質感 */
  background: linear-gradient(135deg, #f3f8f4, #eef5ef);
  border: 1px solid #e6efe7;
  border-radius: 16px;
}
.stat-item {
  text-align: center;
  padding: 0 40px;        /* 左右內距撐開間距 */
}
/* 第二個之後加細分隔線，讓數字之間有分隔感 */
.stat-item:not(:first-child) {
  border-left: 1px solid #d9e6db;
}
.stat-num {
  display: block;
  font-size: 2.6rem;
  font-weight: 800;
  color: var(--primary-color);
  line-height: 1.1;
}
.stat-label {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 65px;
}

/* 貓咪／犬類分頁按鈕（樣式對齊 Services.vue 的篩選按鈕） */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  margin-bottom: 40px;  /* 移到卡片上方後，跟卡片保持間距 */
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

/* 美容師卡片網格與 Services.vue 統一 */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px 40px;
  max-width: 1280px;
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
  margin-top: auto; /* 自動吃掉上方剩餘空間，把按鈕推到卡片最底部，整排對齊 */
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
  /* 數據帶換行時拿掉分隔線，避免位置怪 */
  .stat-item:not(:first-child) {
    border-left: none;
  }
  /* 理念區兩欄在手機改成上下排 */
  .team-intro {
    flex-direction: column;
  }
}
</style>