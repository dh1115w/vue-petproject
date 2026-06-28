<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">毛孩家長真實好評</h2>
        <p class="section-subtitle">分享您的美容體驗，幫助我們做得更好</p>
      </header>

      <!-- 提交評價表單 -->
      <section v-if="isLoggedIn && hasCompletedService" class="review-form-section card">
        <h3>📝 分享您的美容體驗</h3>
        <p class="text-center mb-20">您目前以 <strong>{{ currentUserName }}</strong> 的身份登入。</p>
        <form @submit.prevent="submitReview">
          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label>選擇預約紀錄</label>
              <select v-model="newReview.appointmentId" required @change="syncGroomer">
                <option value="">-- 請選擇欲評價的服務 --</option>
                <option 
                  v-for="apt in unreviewedAppointments" 
                  :key="apt.id" 
                  :value="apt.id"
                >{{ apt.date }} - {{ apt.serviceName }} ({{ apt.groomer }})</option>
              </select>
            </div>
          </div>

          <!-- 評分要填4個項目，後端的評價表是這樣設計的：整體/服務品質/環境/價格 各自獨立評分 -->
          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label>整體評分</label>
              <div class="star-rating-input">
                <span v-for="star in 5" :key="star" @click="newReview.overallRating = star" :class="{ 'active': star <= newReview.overallRating }">★</span>
              </div>
            </div>
            <div class="form-group">
              <label>服務品質評分</label>
              <div class="star-rating-input">
                <span v-for="star in 5" :key="star" @click="newReview.serviceRating = star" :class="{ 'active': star <= newReview.serviceRating }">★</span>
              </div>
            </div>
            <div class="form-group">
              <label>環境評分</label>
              <div class="star-rating-input">
                <span v-for="star in 5" :key="star" @click="newReview.envRating = star" :class="{ 'active': star <= newReview.envRating }">★</span>
              </div>
            </div>
            <div class="form-group">
              <label>價格評分</label>
              <div class="star-rating-input">
                <span v-for="star in 5" :key="star" @click="newReview.priceRating = star" :class="{ 'active': star <= newReview.priceRating }">★</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>您的評論心得</label>
            <textarea v-model="newReview.comment" placeholder="寫下您對這次服務的感想..." required></textarea>
          </div>

          <div class="form-group">
            <label>上傳毛孩帥照/美照</label>
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="file-input" />
            
            <!-- 圖片預覽區域 -->
            <div v-if="newReview.image" class="image-preview-container">
              <img :src="newReview.image" class="preview-thumbnail" />
              <button type="button" class="remove-img-btn" @click="removeImage" title="移除圖片">✕</button>
            </div>
          </div>

          <div style="text-align: right;">
            <button type="submit" class="btn btn-primary">送出評價</button>
          </div>
        </form>
      </section>
      <section v-else-if="!isLoggedIn" class="review-form-section card text-center">
        <h3>您尚未登入</h3>
        <p class="mb-20">請登入會員後再分享您的美容體驗。</p>
        <button type="button" class="btn btn-primary" @click="$router.push('/member/login')">
          <i class="fas fa-sign-in-alt"></i> 前往登入
        </button>
      </section>
      <section v-else class="review-form-section card text-center">
        <h3>尚無可評價的服務</h3>
        <p class="mb-20">您目前沒有已完成的美容紀錄。完成服務後，歡迎回來分享您的心得！</p>
        <button type="button" class="btn btn-outline" @click="$router.push('/grooming/booking')">
          <i class="fas fa-calendar-alt"></i> 立即預約美容
        </button>
      </section>

      <hr class="divider" />

      <!-- 排序與過濾工具列 -->
      <div class="list-tools">
        <div class="filter-group">
          <label>篩選美容師：</label>
          <select v-model="filterGroomer" class="sort-select">
            <option value="all">顯示全部</option>
            <option v-for="staff in staffNames" :key="staff" :value="staff">{{ staff }}</option>
          </select>
        </div>

        <div class="sort-group">
          <label>排序方式：</label>
          <select v-model="sortBy" class="sort-select">
            <option value="newest">最新發布</option>
            <option value="highest">星級最高</option>
          </select>
        </div>
      </div>

      <!-- 評價列表展示 -->
      <div class="reviews-grid">
        <div v-for="review in paginatedReviews" :key="review.id" class="card review-card">
          <div class="review-image-wrapper" v-if="review.image">
            <img 
              :src="review.image" 
              alt="Review photo" 
              class="review-img" 
              @click="openLightbox(review.image)"
            />
          </div>
          <div class="review-body">
            <div class="review-header">
              <span class="user-name">{{ review.userName }}</span>
              <span class="review-date">{{ review.date ? review.date.split('T')[0] : '' }}</span>
            </div>
            <div class="review-meta">
              <span class="groomer-tag">美容師：{{ review.groomerName }}</span>
              <div class="stars">
                <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= review.rating }">★</span>
              </div>
            </div>
            <p class="review-text">{{ review.comment }}</p>

            <!-- 評價細項分數：服務／環境／價格，各自獨立的星等 -->
            <div class="review-sub-ratings">
              <div class="sub-rating-row">
                <span class="sub-label">服務品質</span>
                <span class="sub-stars">
                  <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= review.serviceRating }">★</span>
                </span>
              </div>
              <div class="sub-rating-row">
                <span class="sub-label">環境</span>
                <span class="sub-stars">
                  <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= review.envRating }">★</span>
                </span>
              </div>
              <div class="sub-rating-row">
                <span class="sub-label">價格</span>
                <span class="sub-stars">
                  <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= review.priceRating }">★</span>
                </span>
              </div>
            </div>

            <!-- 店家回覆：有 replyText 才顯示 -->
            <div v-if="review.replyText" class="review-reply">
              <span class="reply-label">🏪 店家回覆</span>
              <p class="reply-text">{{ review.replyText }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 分頁控制項 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >上一頁</button>
        
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 頁</span>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >下一頁</button>
      </div>
    </main>

    <!-- 照片放大預覽燈箱 -->
    <div v-if="lightboxImage" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <img :src="lightboxImage" class="lightbox-full-img" />
        <button class="lightbox-close" @click="closeLightbox">
          <span class="close-icon">✕</span>
        </button>
      </div>
    </div>

  
  </div>
</template>

<script>
import NavBar from './NavBar.vue'
// 【合併前要還原】組員原本寫 '@/api/groomingApi'，但本專案沒有 src/api 資料夾，會導致整個專案編譯失敗。
// 暫時改成相對路徑 './groomingApi'（指向同資料夾的假資料檔），讓本機能跑。上傳 GitHub 前要改回 '@/api/groomingApi'。
import { getReviews, getAppointments, submitGroomingReview, getGroomers } from './groomingApi';
import useUserStore from '@/stores/user.js';

export default {
  name: 'ReviewsPage',
  components: { NavBar },
  data() {
    return {
      staffNames: [], // 美容師名單，改成 mounted() 時打 /api/groomers 抓真實資料，不再寫死
      sortBy: 'newest',
      filterGroomer: 'all',
      currentPage: 1,
      pageSize: 6, // 每頁顯示 6 筆評價（一排 3 個剛好排成兩排，不會有單一個落單）
      isLoggedIn: false, // 真正的登入狀態，created() 時從 user.js 共用資料源讀
      currentUserName: '', // 真正的會員姓名
      lightboxImage: null, // 儲存目前放大顯示的圖片
      newReview: {
        appointmentId: '',
        groomer: '',
        overallRating: 5,  // 整體評分
        serviceRating: 5,  // 服務品質評分
        envRating: 5,      // 環境評分
        priceRating: 5,    // 價格評分
        comment: '',
        image: null,
        imageFile: null
      },
      userAppointments: [],
      reviews: []
    }
  },
  async mounted() {
    await this.fetchReviews();
    await this.fetchGroomers();
    if (this.isLoggedIn) {
      await this.fetchUserAppointments();
    }
    // 檢查網址是否有傳遞 groomer 參數，如果有則自動選取該美容師
    if (this.$route.query.groomer) {
      this.newReview.groomer = this.$route.query.groomer;
    }
    // 從 Appointments.vue 的「評價服務」按鈕過來時，網址會帶 appointmentId，自動選定那一筆預約
    if (this.$route.query.appointmentId) {
      this.newReview.appointmentId = Number(this.$route.query.appointmentId);
      this.syncGroomer();
    }
  },
  created() {
    // 真正的登入狀態：user.js 共用資料源裡有 token 就代表已登入（跟 axios.js 判斷是否帶 token 的方式一樣）
    const userStore = useUserStore();
    this.isLoggedIn = !!userStore.token;
    this.currentUserName = userStore.memberInfo.name || '會員';
  },
  computed: {
    // 取得所有「已完成」且「尚未評價過」的預約清單
    unreviewedAppointments() {
      return this.userAppointments;
    },
    hasCompletedService() {
      return this.unreviewedAppointments.length > 0;
    },
    sortedReviews() {
      let result = [...this.reviews];

      // 1. 執行篩選
      if (this.filterGroomer !== 'all') {
        result = result.filter(r => r.groomerName === this.filterGroomer);
      }

      // 2. 執行排序
      return result.sort((a, b) => {
        if (this.sortBy === 'highest') {
          return b.rating - a.rating; // 由高到低
        }
        // 預設為最新發布 (newest)
        return this.parseApiDate(b.date) - this.parseApiDate(a.date);
      });
    },
    totalPages() {
      return Math.ceil(this.sortedReviews.length / this.pageSize);
    },
    paginatedReviews() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedReviews.slice(start, end);
    }
  },
  watch: {
    // 當排序方式改變時，回到第一頁
    sortBy: 'fetchReviews',
    // 當篩選條件改變時，回到第一頁
    filterGroomer: 'fetchReviews'
  },
  methods: {
    // 把後端日期字串（如 "2026-06-22 10:00"，空格分隔）轉成 Date 物件：
    // 換成 ISO 的 'T' 才能在 Safari/Firefox 正確解析；null/空字串回 Invalid Date（不丟錯）
    parseApiDate(dateStr) {
      return new Date((dateStr || '').replace(' ', 'T'));
    },
    async fetchReviews() {
      try {
        const response = await getReviews({
          groomer: this.filterGroomer,
          sort: this.sortBy
        });
        this.reviews = response.data;
        this.currentPage = 1;
      } catch (error) {
        console.error('獲取評論失敗:', error);
      }
    },
    // 抓真實的美容師名單，給篩選下拉選單用（取代原本寫死的 staffNames）
    async fetchGroomers() {
      try {
        const response = await getGroomers();
        this.staffNames = response.data.map(g => g.name);
      } catch (error) {
        console.error('獲取美容師名單失敗:', error);
      }
    },
    async fetchUserAppointments() {
      try {
        // 已串接真正後端 API：GET /api/secure/appointments?status=3（只查「已完成」的預約）
        // 後端有回傳 isReviewed，前端自己再篩掉已經評價過的，剩下的才是「能評價」的清單
        const response = await getAppointments({ status: 3 });
        this.userAppointments = response.data.filter(apt => !apt.isReviewed);
      } catch (error) {
        console.error('獲取可評價預約失敗:', error);
      }
    },
    // 當使用者選擇預約紀錄時，自動帶入該次預約的美容師名稱
    syncGroomer() {
      const apt = this.unreviewedAppointments.find(a => a.id === this.newReview.appointmentId);
      if (apt) {
        this.newReview.groomer = apt.groomer;
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // image 是給畫面預覽用的暫時網址；imageFile 才是真正要上傳到後端的檔案
        this.newReview.image = URL.createObjectURL(file);
        this.newReview.imageFile = file;
      }
    },
    removeImage() {
      this.newReview.image = null;
      this.newReview.imageFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''; // 清空檔案選擇器
      }
    },
    openLightbox(imageUrl) {
      this.lightboxImage = imageUrl;
      document.body.style.overflow = 'hidden'; // 禁止背景捲動
    },
    closeLightbox() {
      this.lightboxImage = null;
      document.body.style.overflow = ''; // 恢復背景捲動
    },
    async submitReview() {
      try {
        // 已串接真正後端 API：POST /api/secure/reviews（改用 multipart，才能一起把照片送上去）
        // 用 FormData 裝：文字欄位 + 照片檔（有選才放）。groomerName 不用送，後端會從預約紀錄查出來
        const formData = new FormData();
        formData.append('appointmentId', this.newReview.appointmentId);
        formData.append('overallRating', this.newReview.overallRating);
        formData.append('serviceRating', this.newReview.serviceRating);
        formData.append('envRating', this.newReview.envRating);
        formData.append('priceRating', this.newReview.priceRating);
        formData.append('comment', this.newReview.comment);
        formData.append('isAnonymous', false);
        // 有選照片才加進去（後端 image 是 required=false，可以不附）
        if (this.newReview.imageFile) {
          formData.append('image', this.newReview.imageFile);
        }

        await submitGroomingReview(formData);

        alert('感謝您的評價！');
        this.newReview = {
          appointmentId: '', groomer: '',
          overallRating: 5, serviceRating: 5, envRating: 5, priceRating: 5,
          comment: '', image: null, imageFile: null
        };
        await this.fetchReviews();
        await this.fetchUserAppointments();
      } catch (error) {
        // 後端可能回兩種格式：grooming 例外處理器回「純文字訊息」；Spring 預設錯誤回「物件」(含 message)。
        // 兩種都接住，盡量顯示看得懂的原因，避免印出 [object Object]。
        const data = error.response && error.response.data;
        let message = '提交評價失敗，請稍後再試。';
        if (typeof data === 'string' && data) {
          message = data;
        } else if (data && data.message) {
          message = data.message;
        }
        alert(message);
      }
    },
    changePage(page) {
      this.currentPage = page;
      window.scrollTo({ top: 600, behavior: 'smooth' }); // 切換分頁時平滑滾動到列表頂部
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/index.css';

.review-form-section {
  max-width: 800px;
  margin: 0 auto 40px;
  padding: 30px;
}

.review-form-section h3 {
  margin-bottom: 20px;
  color: var(--primary-color);
}

.star-rating-input {
  font-size: 1.5rem;
  cursor: pointer;
  color: #ddd;
}

.star-rating-input span.active {
  color: #f1c40f;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  margin-top: 10px;
  border: 2px solid #eee;
  padding: 5px;
  border-radius: 8px;
  background: #fff;
}

.preview-thumbnail {
  width: 120px;
  height: 120px;
  object-fit: cover;
  display: block;
  border-radius: 4px;
}

.remove-img-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.file-input {
  padding: 10px 0;
}

.divider {
  border: none;
  border-top: 1px dashed #ddd;
  margin: 50px 0;
}

.list-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group, .sort-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
}

.sort-select {
  padding: 8px 35px 8px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(100, 149, 237, 0.1);
}

/* 統一表單元件風格 (繼承自 Booking.vue) */
select, textarea, .file-input {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

select:focus, textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(100, 149, 237, 0.1);
  outline: none;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.review-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.review-image-wrapper {
  width: 100%;
  height: 200px;
}

.review-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: opacity 0.3s ease;
}

.review-img:hover {
  opacity: 0.9;
}

.review-body {
  padding: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #888;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.groomer-tag {
  background: #f0f4ff;
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
}

.stars {
  color: #ddd;
}

.star-filled {
  color: #f1c40f;
}

.review-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #555;
}

/* 評價細項分數：三行小星等（服務／環境／價格） */
.review-sub-ratings {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.sub-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.sub-label {
  width: 64px;
  font-size: 0.8rem;
  color: #888;
}

.sub-stars {
  color: #ddd;
  font-size: 0.9rem;
}

/* 店家回覆區塊：縮排＋左側色條，跟一般評論內容區隔開 */
.review-reply {
  margin-top: 15px;
  padding: 12px 15px;
  background: #f7f9fc;
  border-left: 3px solid var(--primary-color);
  border-radius: 6px;
}

.reply-label {
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 6px;
}

.reply-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* 燈箱樣式 */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  cursor: zoom-out;
  animation: fadeIn 0.3s ease;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.lightbox-full-img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 40px 0 60px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--primary-color);
  background: #fff;
  color: var(--primary-color);
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}
</style>