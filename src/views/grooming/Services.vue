<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">全方位美容服務</h2>
        <p class="section-subtitle">我們提供多樣化的美容護理，讓您的毛孩煥然一新</p>
        
        <!-- 新增過濾切換按鈕 -->
        <div class="category-filter">
          <button 
            v-for="cat in ['all', 'dog', 'cat']" 
            :key="cat"
            @click="filterType = cat"
            :class="['filter-btn', { active: filterType === cat }]"
          >
            {{ cat === 'all' ? '全部' : cat === 'dog' ? '狗狗服務' : '貓咪服務' }}
          </button>
        </div>
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
              :to="{ path: '/grooming/booking', query: { serviceId: service.id } }"
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


  </div>
</template>

<script>
import NavBar from './NavBar.vue'
import { getAllServices } from './groomingApi'

export default {
  name: 'ServicesPage',
  components: { NavBar },
  data() {
    return {
      services: [],
      filterType: 'all',
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
  },
  watch: {
    // 當過濾條件改變時，重新獲取資料
    filterType: {
      handler: 'fetchServices',
      immediate: true
    }
  },
  methods: {
    async fetchServices() {
      try {
        const params = this.filterType === 'all' ? {} : { type: this.filterType };
        const response = await getAllServices(params);
        
        // 轉換後端 priceMap 到前端表格需要的格式
        this.services = response.data.map(service => ({
          ...service,
          // 如果後端沒給按鈕文字或高亮，設定預設值
          buttonText: service.buttonText || (this.filterType === 'cat' ? '預約貓咪服務' : '立即預約'),
          highlight: service.id === 2, // 模擬：精緻造型預設高亮
          prices: this.formatPriceMap(service.priceMap, service.allowedSpecies),
          // 把後端的服務描述(description)拆成一條條特色，餵給卡片上原本就有的 ✓ 清單顯示
          features: this.splitDescription(service.description)
        }));
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    },
    formatPriceMap(priceMap, allowedSpecies) {
      if (!priceMap) return [];
      
      // allowedSpecies 為 null（不限物種）時不能直接讀 .length，會報錯；
      // 先用 allowedSpecies && 擋掉 null，不限物種就當作不是「只限貓」，用犬類標籤
      const isCatOnly = allowedSpecies && allowedSpecies.length === 1 && allowedSpecies[0] === 'cat';
      const labels = isCatOnly
        ? { small: '短毛貓', mid: '長毛貓' }
        : { small: '小型犬 (5kg以下)', mid: '中型犬 (5-15kg)', big: '大型犬 (15kg以上)' };

      return Object.entries(priceMap).map(([key, price]) => ({
        type: labels[key] || key,
        price
      }));
    },
    // 把後台填的「服務描述」拆成一條一條的特色清單。
    // 後台請用「、」或換行（也支援逗號、句號）把每個特色隔開，
    // 例如：深層清潔、指甲修剪、耳朵清潔 → 會變成 3 條打勾項目。
    splitDescription(description) {
      // 沒有描述就回傳空陣列，卡片上不會顯示任何清單
      if (!description) return [];
      // 用頓號 / 換行 / 逗號 / 句號當分隔符號切開，去掉前後空白，再濾掉空字串
      return description
        .split(/[\n、，,。]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/index.css';

/* 新增過濾按鈕樣式 */
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