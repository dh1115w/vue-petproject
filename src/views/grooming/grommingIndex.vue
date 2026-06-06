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
            <h3>
              <router-link to="/grooming/services" style="color: inherit; text-decoration: none;">基礎洗澡</router-link>
            </h3>
            <p class="price">NT$ 500 起</p>
            <p class="duration">⏱ 時長：60 分鐘</p>
            <p class="desc">包含剪指甲、清耳朵、擠肛門腺、溫和洗毛精清潔。</p>
          </div>
        </div>
        <div class="card service-card">
          <div class="card-body">
            <h3>
              <router-link to="/grooming/services" style="color: inherit; text-decoration: none;">精緻造型剪毛</router-link>
            </h3>
            <p class="price">NT$ 1,200 起</p>
            <p class="duration">⏱ 時長：120 分鐘</p>
            <p class="desc">職人手剪、客製化造型溝通、全身毛髮蓬鬆打理。</p>
          </div>
        </div>
        <div class="card service-card">
          <div class="card-body">
            <h3>
              <router-link to="/grooming/services" style="color: inherit; text-decoration: none;">草本舒緩藥浴</router-link>
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

    <footer>
      <p>&copy; 2026 毛孩萌沙龍. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'IndexPage',
  components: { NavBar }
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
</style>