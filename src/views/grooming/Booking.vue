<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <h2 class="section-title">預約寵物美容</h2>
      <div class="grid grid-2" style="align-items: start; gap: 40px;">
        <div class="booking-info-side">
          <div class="card reminder-card">
            <h4>🐾 預約溫馨小叮嚀</h4>
            <ol class="reminder-list">
              <li>為了毛孩的安全，若有心臟病、癲癇或具攻擊性行為請務必於備註告知。</li>
              <li>預約時段將為您保留 15 分鐘，逾時將自動取消並釋出時段。</li>
              <li>若欲取消預約，請於前一日至會員中心或來電取消。</li>
            </ol>
          </div>

          <div class="booking-visual-gallery">
            <div class="gallery-item dog-item">
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=400&fit=crop" alt="Dog Grooming" />
            </div>
            <div class="gallery-item cat-item">
              <img src="https://images.unsplash.com/photo-1548546738-8509cb246ed3?w=500&h=400&fit=crop" alt="Cat Grooming" />
            </div>
          </div>

          <div class="card promise-card">
            <p>「每一位毛孩都是我們珍視的家人，我們承諾以最溫柔的耐心與專業，守護毛孩的笑容與健康。」</p>
          </div>
        </div>

        <form class="form-container" style="margin-top: 0;" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="petSelect">選擇您的毛孩 (pet_id)</label>
            <select id="petSelect" v-model="form.pet_id" required>
              <option value="">-- 請選擇毛孩 --</option>
              <option value="1">巧克力 (貴賓/3歲)</option>
              <option value="2">Mimi (波斯貓/2歲)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="serviceSelect">選擇服務項目 (service_id)</label>
            <select id="serviceSelect" v-model="form.service_id" required>
              <option value="">-- 請選擇服務 --</option>
              <option v-for="n in 6" :key="n" :value="n">{{ ['基礎洗澡','精緻造型剪毛','草本舒緩藥浴','深層芳療泥浴','貓咪舒壓洗護','貓咪廢毛梳理'][n-1] }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="groomerSelect">指定美容師 (groomer_id)</label>
            <select id="groomerSelect" v-model="form.groomer_id" required>
              <option value="">-- 請選擇美容師 --</option>
              <option v-for="(name, idx) in ['Andy', 'Emily', 'Jason', 'Sophie']" :key="idx" :value="idx+1">{{ name }}</option>
            </select>
          </div>
          <div class="form-group grid grid-2" style="padding:0; gap:15px; margin-top:0;">
            <div>
              <label for="aptDate">預約日期</label>
              <input type="date" id="aptDate" v-model="form.apt_date_date" required>
            </div>
            <div>
              <label for="timeSlot">可用時段</label>
              <select id="timeSlot" v-model="form.timeSlot" required>
                <option value="">-- 請選擇時段 --</option>
                <option value="09:00">09:00 - 11:00</option>
                <option value="13:00">13:00 - 15:00</option>
                <option value="15:30">15:30 - 17:30</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="notes">備註事項 (notes)</label>
            <textarea id="notes" rows="4" v-model="form.notes" placeholder="請註明毛孩是否有過敏史、近期手術或特殊排斥行為..."></textarea>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <button type="submit" class="btn btn-primary">🐾 送出預約</button>
          </div>
        </form>
      </div>
    </main>

    <footer>
      <p>&copy; 2026 毛孩萌沙龍. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'BookingPage',
  components: { NavBar },
  data() {
    return {
      form: {
        pet_id: '',
        service_id: '',
        groomer_id: '',
        apt_date_date: '',
        timeSlot: '',
        notes: ''
      }
    }
  },
  mounted() {
    // 檢查網址是否有傳遞 petId 參數，如果有則自動選取該毛孩
    if (this.$route.query.petId) {
      this.form.pet_id = this.$route.query.petId;
    }
  },
  methods: {
    handleSubmit() {
      const appointmentData = {
        pet_id: parseInt(this.form.pet_id),
        service_id: parseInt(this.form.service_id),
        groomer_id: parseInt(this.form.groomer_id),
        apt_date: `${this.form.apt_date_date} ${this.form.timeSlot}:00`,
        status: 0,
        notes: this.form.notes
      };
      console.log('Appointments object:', appointmentData);
      alert(`🎉 預約成功！\n預約時間: ${appointmentData.apt_date}`);
      this.form = { pet_id: '', service_id: '', groomer_id: '', apt_date_date: '', timeSlot: '', notes: '' };
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/booking.css';

.reminder-card {
  background: #f8f9fa; /* 改為極淺灰色，增加區隔感但不失統一風格 */
  border: 1px solid #f0f0f0;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* 與 Services.vue 統一的陰影 */
}

.reminder-card h4 {
  color: var(--primary-color); /* 改為主題色，移除橘色 */
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: bold;
}

.reminder-list {
  padding-left: 20px;
  margin: 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.8;
}

/* 視覺藝廊樣式：雙圖交錯 */
.booking-visual-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 25px;
}

.gallery-item {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: 180px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.cat-item {
  margin-top: 20px; /* 營造高低錯落感 */
}

/* 服務承諾樣式優化 */
.promise-card {
  margin-top: 25px;
  padding: 25px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
  border: none;
  border-left: 4px solid var(--primary-color);
  text-align: center;
}

.promise-card p {
  color: var(--primary-color);
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
  margin: 0;
}

.reminder-list li {
  margin-bottom: 10px;
}

.reminder-list li:last-child {
  margin-bottom: 0;
}

.btn {
  width: fit-content;
  min-width: 140px; /* 統一按鈕最小寬度 */
  padding: 10px 30px;
}

/* 下拉選單與輸入框質感優化 */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
  font-size: 0.95rem;
}

select, 
input[type="date"], 
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s ease;
  outline: none;
}

/* 針對 select 的特別處理：自定義箭頭 */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  padding-right: 40px;
}

select:focus, 
input[type="date"]:focus, 
textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(100, 149, 237, 0.1); /* 柔和的主題色光暈 */
  background-color: #fff;
}

textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
