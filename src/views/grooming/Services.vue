<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">全方位美容服務</h2>
        <p class="section-subtitle">我們提供多樣化的美容護理，讓您的毛孩煥然一新</p>
      </header>

      <div class="service-grid">
        <div
          v-for="service in services"
          :key="service.title"
          class="card service-detail-card"
          :class="{ 'highlight-border': service.highlight }"
        >
          <div class="service-image-wrapper">
            <img :src="service.image" :alt="service.title" class="service-img" />
          </div>
          <div class="service-card-content">
            <h3>{{ service.title }}</h3>
            <table class="price-table">
              <thead>
                <tr><th>體型</th><th>價格</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in service.prices" :key="item.type">
                  <td>{{ item.type }}</td>
                  <td>NT$ {{ item.price }}</td>
                </tr>
              </tbody>
            </table>
            <ul class="feature-list">
              <li v-for="feature in service.features" :key="feature"><span class="check-icon">✓</span> {{ feature }}</li>
            </ul>
            <router-link
              to="/grooming/booking"
              class="btn"
              :class="service.highlight ? 'btn-primary' : 'btn-outline'"
            >
              {{ service.buttonText }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- 常見問題 FAQ 區塊 -->
      <section class="faq-section">
        <h2 class="section-title">常見問題 FAQ</h2>
        <div class="faq-grid">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-card">
            <div class="faq-question">
              <span class="q-icon">Q</span>
              <h4>{{ faq.question }}</h4>
            </div>
            <p class="faq-answer">{{ faq.answer }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 毛孩萌沙龍. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'ServicesPage',
  components: { NavBar },
  data() {
    return {
      services: [
        {
          title: '基礎洗澡 (Basic Bath)',
          image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=300&fit=crop',
          prices: [
            { type: '小型犬 (5kg以下)', price: 500 },
            { type: '中型犬 (5-15kg)', price: 700 },
            { type: '大型犬 (15kg以上)', price: 900 }
          ],
          features: [
            '溫和低敏洗毛精兩道清洗',
            '基礎修剪 (腳底毛、腹毛、肛門毛)',
            '清耳道、剪指甲、修腳圓',
            '擠肛門腺、專業吹整毛髮'
          ],
          buttonText: '預約洗澡',
          highlight: false
        },
        {
          title: '精緻造型剪毛 (Full Grooming)',
          image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&fit=crop',
          prices: [
            { type: '小型犬 (5kg以下)', price: 1200 },
            { type: '中型犬 (5-15kg)', price: 1800 },
            { type: '大型犬 (15kg以上)', price: 2500 }
          ],
          features: [
            '包含所有「基礎洗澡」內容',
            '職人手剪全身造型、打薄修飾',
            '客製化造型溝通 (如圓頭、貴賓裝)',
            '蓬鬆毛髮結構處理'
          ],
          buttonText: '預約造型',
          highlight: false
        },
        {
          title: '草本舒緩藥浴 (Medicated Bath)',
          image: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=500&h=300&fit=crop',
          prices: [
            { type: '小型犬 (5kg以下)', price: 800 },
            { type: '中型犬 (5-15kg)', price: 1100 },
            { type: '大型犬 (15kg以上)', price: 1500 }
          ],
          features: [
            '針對皮膚過敏、止癢、異味處理',
            '天然植物萃取藥劑，不傷毛質',
            '恆溫微氣泡抗菌處理',
            '舒緩紅腫、改善皮膚防禦力'
          ],
          buttonText: '預約藥浴',
          highlight: false
        },
        {
          title: '深層芳療泥浴 (Mud Spa)',
          image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&h=300&fit=crop',
          prices: [
            { type: '小型犬 (5kg以下)', price: 1000 },
            { type: '中型犬 (5-15kg)', price: 1400 },
            { type: '大型犬 (15kg以上)', price: 1800 }
          ],
          features: [
            '死海礦物泥深層吸附皮脂髒污',
            '改善乾澀、除臭效果持久',
            '舒壓按摩與熱敷',
            '讓毛髮重現光澤與彈性'
          ],
          buttonText: '預約 SPA',
          highlight: false
        },
        {
          title: '貓咪舒壓洗護 (Cat Relaxation Wash)',
          image: 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=500&h=300&fit=crop',
          prices: [
            { type: '短毛貓 (如美短、英短)', price: 800 },
            { type: '長毛貓 (如波斯、緬因)', price: 1200 }
          ],
          features: [
            '專屬貓房獨立洗護，減少環境壓力',
            '低噪音低風速吹乾設備',
            '專業深層去油洗劑',
            '包含修剪指甲、清耳、剪腳底毛'
          ],
          buttonText: '預約貓咪洗澡',
          highlight: false
        },
        {
          title: '貓咪廢毛梳理 (Cat De-shedding)',
          image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=300&fit=crop',
          prices: [
            { type: '短毛貓 (廢毛處理)', price: 600 },
            { type: '長毛貓 (拆結、深層梳理)', price: 1000 }
          ],
          features: [
            '深層去除底層廢毛，減少毛球症',
            '專業不鏽鋼排梳技巧，不傷皮膚',
            '增進皮膚血液循環與油脂平衡',
            '毛髮滑順、防止居家毛髮紛飛'
          ],
          buttonText: '預約梳毛',
          highlight: false
        }
      ],
      faqs: [
        {
          question: '預約後可以取消或更改時間嗎？',
          answer: '可以的，請於預約日前一天至「會員中心」取消或撥打電話通知我們，以便安排其他毛孩遞補。'
        },
        {
          question: '美容大約需要多久時間？',
          answer: '「基礎洗澡」約 1.5 小時，「精緻造型剪毛」約 2-3 小時，實際時間視毛孩體型與毛況而定。'
        },
        {
          question: '第一次預約美容需要注意什麼？',
          answer: '建議毛孩美容前 2 小時不要餵食。如有心臟病、過敏史或攻擊性行為，請務必提前告知。'
        },
        {
          question: '可以指定特定的美容師嗎？',
          answer: '可以的，您在線上預約流程中可以自由選擇心儀的美容師。若無指定則由當日系統自動調度。'
        }
      ]
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/index.css';

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-subtitle {
  color: #666;
  margin-top: 10px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 改為三欄佈局 */
  gap: 60px 40px; /* 調整上下間距以適應帶圖片的長卡片 */
  max-width: 1200px; /* 增加總寬度以容納三張卡片 */
  margin: 60px auto 80px; /* 調整與上方標題及下方頁尾的距離，保持適度留白 */
  padding: 0 20px; /* 增加左右內距，防止小螢幕時卡片貼邊 */
}

.service-detail-card {
  padding: 0; /* 移除原本的 padding，讓圖片貼邊 */
  overflow: hidden; /* 確保內容不會超出卡片圓角 */
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* 加入輕微陰影增加層次感 */

  /* 進場動畫設定 */
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
}

/* 讓四個服務卡片依序出現 (Staggered Animation) */
.service-detail-card:nth-child(1) { animation-delay: 0.1s; }
.service-detail-card:nth-child(2) { animation-delay: 0.3s; }
.service-detail-card:nth-child(3) { animation-delay: 0.5s; }
.service-detail-card:nth-child(4) { animation-delay: 0.7s; }
.service-detail-card:nth-child(5) { animation-delay: 0.9s; }
.service-detail-card:nth-child(6) { animation-delay: 1.1s; }

/* 定義進場動畫：由下而上淡入 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.service-image-wrapper {
  width: 100%;
  height: 200px; /* 固定高度，確保卡片整齊 */
  overflow: hidden;
}

.service-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 圖片不變形填滿容器 */
}

.service-card-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-grow: 1;
}

.service-detail-card h3 {
  margin-bottom: 12px;
  color: #333;
  font-size: 1.1rem; /* 稍微縮小標題 */
}

.highlight-border {
  border: 2px solid var(--primary-color);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.btn-outline {
  border: 1px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  text-align: center;
  padding: 8px;
  border-radius: 6px;
}

.btn-outline:hover {
  background: var(--primary-color);
  color: #fff;
}

.btn {
  margin-top: auto; /* 將按鈕推至卡片底部 */
  width: fit-content;
  min-width: 140px; /* 縮小按鈕最小寬度 */
  padding: 8px 25px;
}

.price-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  font-size: 0.85rem; /* 縮小文字 */
}

.price-table th {
  background-color: #fcfcfc;
  color: #888;
  font-weight: normal;
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.price-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f5f5f5;
}

.price-table td:last-child {
  color: var(--primary-color);
  font-weight: bold;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0; /* 減少列表與按鈕間的距離 */
  color: #555;
  line-height: 1.8;
  font-size: 0.85rem; /* 縮小列表文字 */
  text-align: left; /* 保持清單文字靠左，但在置中的容器內 */
}

.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.check-icon {
  color: #2ecc71;
  margin-right: 8px;
  font-weight: bold;
}

/* FAQ 區塊樣式 */
.faq-section {
  margin-top: 100px;
  margin-bottom: 80px;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 860px;
  margin: 40px auto 0;
  padding: 0 20px;
}

.faq-card {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-left: 4px solid var(--primary-color);
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
}

.faq-card:nth-child(1) { animation-delay: 0.2s; }
.faq-card:nth-child(2) { animation-delay: 0.4s; }
.faq-card:nth-child(3) { animation-delay: 0.6s; }
.faq-card:nth-child(4) { animation-delay: 0.8s; }

.faq-question {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.q-icon {
  background: var(--primary-color);
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.faq-question h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.faq-answer {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  padding-left: 36px;
}
</style>