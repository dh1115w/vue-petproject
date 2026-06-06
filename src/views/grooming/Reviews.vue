<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">毛孩家長真實好評</h2>
        <p class="section-subtitle">分享您的美容體驗，幫助我們做得更好</p>
      </header>

      <!-- 提交評價表單 -->
      <section class="review-form-section card">
        <h3>📝 分享您的美容體驗</h3>
        <form @submit.prevent="submitReview">
          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label>選擇服務美容師</label>
              <select v-model="newReview.groomer" required>
                <option value="">-- 請選擇美容師 --</option>
                <option v-for="staff in staffNames" :key="staff" :value="staff">{{ staff }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>給予星級評價</label>
              <div class="star-rating-input">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  @click="newReview.rating = star"
                  :class="{ 'active': star <= newReview.rating }"
                >★</span>
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
              <span class="review-date">{{ review.date }}</span>
            </div>
            <div class="review-meta">
              <span class="groomer-tag">美容師：{{ review.groomerName }}</span>
              <div class="stars">
                <span v-for="s in 5" :key="s" :class="{ 'star-filled': s <= review.rating }">★</span>
              </div>
            </div>
            <p class="review-text">{{ review.comment }}</p>
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

    <footer>
      <p>&copy; 2026 毛孩萌沙龍. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'ReviewsPage',
  components: { NavBar },
  data() {
    return {
      staffNames: ['Andy', 'Emily', 'Jason', 'Sophie'],
      sortBy: 'newest',
      filterGroomer: 'all',
      currentPage: 1,
      pageSize: 4, // 每頁顯示 4 筆評價
      lightboxImage: null, // 儲存目前放大顯示的圖片
      newReview: {
        groomer: '',
        rating: 5,
        comment: '',
        image: null
      },
      reviews: [
        {
          id: 1,
          userName: '豆豆媽',
          groomerName: 'Emily',
          rating: 5,
          comment: 'Emily 真的很專業，我們家貓咪平常很怕生，但這次竟然乖乖洗完，修剪得非常圓潤可愛！',
          image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
          date: '2024-05-15'
        },
        {
          id: 2,
          userName: '阿強',
          groomerName: 'Andy',
          rating: 4,
          comment: 'Andy 處理大型犬很有經驗，哈士奇洗完後毛髮非常蓬鬆，也沒什麼異味了。',
          image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
          date: '2024-05-10'
        }
      ]
    }
  },
  mounted() {
    // 檢查網址是否有傳遞 groomer 參數，如果有則自動選取該美容師
    if (this.$route.query.groomer) {
      this.newReview.groomer = this.$route.query.groomer;
    }
  },
  computed: {
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
        return new Date(b.date) - new Date(a.date);
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
    sortBy() {
      this.currentPage = 1;
    },
    // 當篩選條件改變時，回到第一頁
    filterGroomer() {
      this.currentPage = 1;
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // 這裡僅作展示用，實際應用需將檔案上傳至伺服器或轉為 Base64
        this.newReview.image = URL.createObjectURL(file);
      }
    },
    removeImage() {
      this.newReview.image = null;
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
    submitReview() {
      const reviewToAdd = {
        id: Date.now(),
        userName: '新用戶', // 實際應用應從會員登入資訊獲取
        groomerName: this.newReview.groomer,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        image: this.newReview.image || 'https://via.placeholder.com/400x300?text=No+Photo',
        date: new Date().toISOString().split('T')[0]
      };
      
      this.reviews.unshift(reviewToAdd);
      this.currentPage = 1; // 送出後回到第一頁看到自己的評價
      alert('感謝您的評價！');
      
      // 重置表單
      this.newReview = { groomer: '', rating: 5, comment: '', image: null };
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''; // 清空檔案選擇器
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