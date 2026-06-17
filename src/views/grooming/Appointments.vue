<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <h2 class="section-title">我的美容預約紀錄</h2>

      <!-- 預約紀錄卡片 -->
      <div class="card mt-20">
        <div class="card-header-flex">
          <h3 class="m-0">最新美容預約進度 (Appointments)</h3>
          <div class="filter-group-row">
            <!-- 新增跳轉回預約頁面的按鈕 -->
            <router-link to="/grooming/booking" class="mini-page-btn" style="text-decoration: none; border-color: var(--primary-color); color: var(--primary-color); margin-right: 10px;">
              🐾 新增預約
            </router-link>

            <label class="filter-label">篩選狀態：</label>
            <select v-model="filterStatus" class="status-select">
              <option value="all">顯示全部</option>
              <option value="0">已收到預約</option>
              <option value="1">服務已完成</option>
              <option value="2">預約已取消</option>
              <option value="3">美容進行中</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoading" class="loading-indicator">
          載入中，請稍候...
        </div>
        <div v-else-if="error" class="error-message">
          載入預約紀錄失敗：{{ error }}
        </div>
        <div v-else>
          <table class="custom-dashboard-table">
            <thead>
              <tr><th>預約編號</th><th>預約毛孩</th><th>選擇項目</th><th>預約時間 (apt_date)</th><th>指定美容師</th><th>目前狀態 (status)</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-if="paginatedAppointments.length === 0">
                <td colspan="7" class="no-data-message">目前沒有符合條件的預約紀錄。</td> <!-- colspan 更新為 7 -->
              </tr>
              <tr v-for="apt in paginatedAppointments" :key="apt.id">
                <td>{{ apt.id }}</td>
                <td><strong>{{ apt.petName }}</strong></td>
                <td>{{ apt.serviceName }} ({{ formatCurrency(apt.price) }})</td>
                <td>{{ apt.date }}</td>
                <td>{{ apt.groomer }}</td>
                <td>
                  <span class="badge" :class="statusMap[apt.status].class">
                    {{ statusMap[apt.status].label }} ({{ apt.status }})
                  </span>
                </td>
                <td>
                  <button 
                    v-if="apt.status === 0" 
                    @click="openCancelModal(apt)" 
                    class="mini-page-btn danger-border"
                  >取消</button>
                  <button 
                    v-if="apt.status === 0" 
                    @click="updateStatus(apt.id, 3)" 
                    class="mini-page-btn"
                    style="border-color: #f39c12; color: #f39c12; margin-left: 5px;"
                  >開始美容</button>
                  <button 
                    v-if="apt.status === 3" 
                    @click="updateStatus(apt.id, 1)" 
                    class="mini-page-btn"
                    style="border-color: #27ae60; color: #27ae60;"
                  >完成美容</button>

                  <button
                    v-if="canReview(apt)" 
                    @click="openReviewModal(apt)" 
                    class="mini-page-btn"
                    style="border-color: #f39c12; color: #f39c12;"
                  >評價服務</button>
                  <button 
                    v-else-if="apt.status === 1 && apt.isReviewed" 
                    @click="viewReview(apt)" 
                    class="mini-page-btn"
                    style="border-color: #9b59b6; color: #9b59b6;"
                  >查看評價</button>
                  <span 
                    v-else-if="isReviewExpired(apt)" 
                    class="badge badge-secondary"
                    style="opacity: 0.6; cursor: not-allowed;"
                  >評價已過期</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 預約分頁控制項 -->
          <div class="pet-pagination mt-20" v-if="totalAptPages > 1">
            <button 
              class="mini-page-btn" 
              :disabled="currentAptPage === 1" 
              @click="currentAptPage--"
            >上一頁</button>
            <span class="page-info">第 {{ currentAptPage }} / {{ totalAptPages }} 頁</span>
            <button 
              class="mini-page-btn" 
              :disabled="currentAptPage === totalAptPages" 
              @click="currentAptPage++"
            >下一頁</button>
          </div>
        </div>
      </div>

    </main>

    <!-- 評價預約彈窗 (Modal) -->
    <div v-if="isReviewModalOpen" class="modal-overlay" @click.self="closeReviewModal">
      <div class="card modal-content">
        <h3 class="modal-title">評價您的美容服務</h3>
        <div class="modal-body">
          <p class="text-center">毛孩：<strong>{{ appointmentToReview?.petName }}</strong></p>
          <p class="text-center">服務：<strong>{{ appointmentToReview?.serviceName }}</strong></p>
          <div class="modal-form-group">
            <label>評分 (1-5 星)</label>
            <select v-model="reviewRating" class="modal-select">
              <option v-for="n in 5" :key="n" :value="n">{{ n }} 星</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label>評價內容</label>
            <textarea v-model="reviewComment" rows="3" class="modal-textarea" placeholder="分享您的美容心得..."></textarea>
          </div>
        </div>
        <div class="modal-actions mt-20">
          <button type="button" @click="submitReview" class="btn btn-primary flex-1">送出評價</button>
          <button type="button" @click="closeReviewModal" class="btn btn-cancel flex-1">返回</button>
        </div>
      </div>
    </div>

    <!-- 取消預約確認彈窗 (Modal) -->
    <div v-if="isCancelModalOpen" class="modal-overlay" @click.self="closeCancelModal">
      <div class="card modal-content">
        <h3 class="modal-title">確認取消預約</h3>
        <p class="text-center">您確定要取消預約編號 <strong>{{ appointmentToCancel?.id }}</strong> 的美容服務嗎？</p>
        <p class="text-center">毛孩：<strong>{{ appointmentToCancel?.petName }}</strong></p>
        <p class="text-center">時間：<strong>{{ appointmentToCancel?.date }}</strong></p>
        <div class="modal-actions">
          <button type="button" @click="confirmCancel" class="btn btn-danger flex-1">確認取消</button>
          <button type="button" @click="closeCancelModal" class="btn btn-cancel flex-1">返回</button>
        </div>
      </div>
    </div>
    <!-- 修改資料彈窗 (Modal) -->
    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="isEditModalOpen = false">
      <div class="card modal-content">
        <h3 class="modal-title">編輯會員資料</h3>
        <form @submit.prevent="saveMemberInfo">
          <div class="modal-form-group">
            <label>姓名</label>
            <input type="text" v-model="tempMemberInfo.name" required>
          </div>
          <div class="modal-form-group">
            <label>聯絡電話</label>
            <input type="tel" v-model="tempMemberInfo.phone" required>
          </div>
          <div class="modal-form-group">
            <label>電子信箱</label>
            <input type="email" v-model="tempMemberInfo.email" required>
          </div>
          <div class="modal-form-group">
            <label>通訊地址</label>
            <input type="text" v-model="tempMemberInfo.address" required>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary flex-1">儲存修改</button>
            <button type="button" @click="isEditModalOpen = false" class="btn btn-cancel flex-1">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 編輯毛孩彈窗 (Modal) -->
    <div v-if="isEditPetModalOpen" class="modal-overlay" @click.self="isEditPetModalOpen = false">
      <div class="card modal-content">
        <h3 class="modal-title">✏️ 編輯毛孩資訊</h3>
        <form @submit.prevent="updatePet">
          <div class="grid grid-2 p-0 gap-10">
            <div class="modal-form-group">
              <label>毛孩姓名</label>
              <input type="text" v-model="editingPet.name" required>
            </div>
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model.number="editingPet.gender" required class="modal-select">
                <option :value="1">小男生</option>
                <option :value="0">小女生</option>
              </select>
            </div>
          </div>
          <div class="grid grid-3 p-0 gap-10">
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="editingPet.breed" required></div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="editingPet.age" required></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="editingPet.weight" required></div>
          </div>
          <div class="modal-form-group">
            <label>醫療與個性備註</label>
            <textarea v-model="editingPet.notes" rows="2" class="modal-textarea"></textarea>
          </div>
          <div class="modal-actions mt-20">
            <button type="submit" class="btn btn-primary flex-1">儲存變更</button>
            <button type="button" @click="isEditPetModalOpen = false" class="btn btn-cancel flex-1">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增毛孩彈窗 (Modal) -->
    <div v-if="isAddPetModalOpen" class="modal-overlay" @click.self="isAddPetModalOpen = false">
      <div class="card modal-content">
        <h3 class="modal-title">🐾 新增毛孩資訊</h3>
        <form @submit.prevent="saveNewPet">
          <div class="grid grid-2 p-0 gap-10">
            <div class="modal-form-group">
              <label>毛孩姓名</label>
              <input type="text" v-model="newPet.name" placeholder="例如：巧克力" required>
            </div>
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model.number="newPet.gender" required class="modal-select">
                <option :value="1">小男生</option>
                <option :value="0">小女生</option>
              </select>
            </div>
          </div>
          <div class="grid grid-3 p-0 gap-10">
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="newPet.breed" required></div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="newPet.age" required></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="newPet.weight" required></div>
          </div>
          <div class="modal-form-group">
            <label>醫療與個性備註</label>
            <textarea v-model="newPet.notes" rows="2" class="modal-textarea" placeholder="是否有過敏或害怕的事情？"></textarea>
          </div>
          <div class="modal-form-group checkbox-row">
            <input type="checkbox" v-model="newPet.isNeutered" id="isNeutered" class="auto-width">
            <label for="isNeutered" class="m-0">是否已結紮？</label>
          </div>
          <div class="modal-actions mt-20">
            <button type="submit" class="btn btn-primary flex-1">確認新增</button>
            <button type="button" @click="isAddPetModalOpen = false" class="btn btn-cancel flex-1">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'; // 假設 NavBar 路徑正確
import { getAppointments, cancelAppointment, submitGroomingReview, updateAppointmentStatus } from './groomingApi';

export default {
  name: 'Appointments',
  components: { NavBar },
  data() {
    return {
      appointments: [], // 將預約資料初始化為空陣列
      statusMap: {
        0: { label: '已收到預約', class: 'badge-info' },
        1: { label: '服務已完成', class: 'badge-success' },
        2: { label: '預約已取消', class: 'badge-secondary' },
        3: { label: '美容進行中', class: 'badge-warning' }
      },
      filterStatus: 'all',
      currentAptPage: 1,
      aptPageSize: 5,
      isLoading: false,
      error: null, // 已修正：這裡原本漏了逗點
      isCancelModalOpen: false, // 控制取消預約彈窗顯示
      appointmentToCancel: null, // 儲存要取消的預約
      isReviewModalOpen: false, // 控制評價彈窗
      appointmentToReview: null, // 儲存要評價的預約
      reviewRating: 5,
      reviewComment: '',
      sortKey: 'date', // 預設排序欄位
      sortOrder: 'desc' // 預設降冪排序 (最新的在前)
    }
  },
  computed: {
    filteredAppointments() {
      let result = [...this.appointments];
      
      // 1. 根據狀態篩選
      if (this.filterStatus !== 'all') {
        result = result.filter(apt => apt.status === parseInt(this.filterStatus));
      }

      // 2. 進行排序
      const key = this.sortKey;
      const order = this.sortOrder === 'asc' ? 1 : -1;

      result.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        // 日期排序特殊處理
        if (key === 'date') { aVal = new Date(aVal); bVal = new Date(bVal); }
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });

      return result;
    },
    totalAptPages() {
      return Math.ceil(this.filteredAppointments.length / this.aptPageSize);
    },
    paginatedAppointments() {
      const start = (this.currentAptPage - 1) * this.aptPageSize;
      const end = start + this.aptPageSize;
      return this.filteredAppointments.slice(start, end);
    }
  },
  watch: {
    totalAptPages(newVal) {
      if (this.currentAptPage > newVal && newVal > 0) {
        this.currentAptPage = newVal;
      } else if (newVal === 0) { // 如果沒有預約了，回到第一頁
        this.currentAptPage = 1;
      }
    },
    // 當篩選條件改變時，回到預約表格的第一頁
    filterStatus() {
      this.currentAptPage = 1;
      this.fetchAppointments(); // 篩選條件改變時重新載入資料
    }
  },
  created() {
    this.fetchAppointments(); // 組件創建時載入預約資料
  },
  methods: {
    async fetchAppointments() {
      this.isLoading = true; // 開始載入，設定載入狀態為 true
      this.error = null; // 清除之前的錯誤訊息
      try {
        const params = {};
        if (this.filterStatus !== 'all') params.status = this.filterStatus;

        const response = await getAppointments(params);
        let remoteData = response.data;

        // 檢查路由 state 中是否有剛產生的預約
        if (window.history.state && window.history.state.newAppointment) {
          const newApt = window.history.state.newAppointment;
          // 檢查是否已經存在於遠端資料中（避免重複顯示）
          const isDuplicate = remoteData.some(apt => apt.date === newApt.date && apt.petName === newApt.petName);
          if (!isDuplicate) {
            remoteData = [newApt, ...remoteData];
          }
        }

        this.appointments = remoteData; 
      } catch (err) {
        console.error('Error fetching appointments:', err);
        this.error = '無法載入預約紀錄，請稍後再試。'; // 設定錯誤訊息
      } finally {
        this.isLoading = false; // 載入完成，設定載入狀態為 false
      }
    },
    formatCurrency(value) {
      // 格式化金額顯示，例如將 1200 顯示為 $1,200
      if (typeof value !== 'number') return value; // 如果不是數字，直接返回
      return `$${value.toLocaleString()}`;
    },
    changeSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    openCancelModal(appointment) {
      this.appointmentToCancel = appointment;
      this.isCancelModalOpen = true;
    },
    closeCancelModal() {
      this.isCancelModalOpen = false;
      this.appointmentToCancel = null;
    },
    async confirmCancel() {
      if (!this.appointmentToCancel) return;

      try {
        await cancelAppointment(this.appointmentToCancel.id);
        alert(`預約編號 ${this.appointmentToCancel.id} 已成功取消！`);
        this.fetchAppointments(); // 重新載入列表以確保資料最新
      } catch (error) {
        console.error('取消預約失敗:', error);
        alert('取消預約失敗，請稍後再試。');
      } finally {
        this.closeCancelModal();
      }
    },
    async updateStatus(id, newStatus) {
      try {
        const actionName = newStatus === 3 ? '開始美容' : '完成美容';
        await updateAppointmentStatus(id, newStatus);
        alert(`預約編號 ${id} 已切換至 ${actionName}！`);
        this.fetchAppointments(); // 重新載入列表以確保畫面同步
      } catch (error) {
        console.error('更新狀態失敗:', error);
        alert('狀態更新失敗，請稍後再試。');
      }
    },
    openReviewModal(appointment) {
      this.appointmentToReview = appointment;
      this.isReviewModalOpen = true;
    },
    closeReviewModal() {
      this.isReviewModalOpen = false;
      this.appointmentToReview = null;
      this.reviewComment = '';
      this.reviewRating = 5;
    },
    async submitReview() {
      try {
        const targetApt = this.appointments.find(a => a.id === this.appointmentToReview.id);
        if (targetApt) {
          // 建立評價數據物件
          const reviewData = {
            appointmentId: targetApt.id,
            groomerName: targetApt.groomer, // 關鍵：關聯美容師
            rating: this.reviewRating,
            comment: this.reviewComment,
            date: new Date().toISOString()
          };
          
          await submitGroomingReview(reviewData);
          
          targetApt.isReviewed = true;
          targetApt.reviewRating = this.reviewRating; // 暫存資料供查看
          targetApt.reviewComment = this.reviewComment;
        }
        
        alert('感謝您的評價！我們會繼續努力。');
        this.closeReviewModal();
      } catch (error) {
        alert('評價提交失敗，請重試。');
      }
    },
    canReview(apt) {
      // 1. 狀態必須是「已完成」且「尚未評價」
      if (apt.status !== 1 || apt.isReviewed) return false;

      // 2. 計算時間差（毫秒轉天數）
      const aptDate = new Date(apt.date);
      const now = new Date();
      const diffInDays = (now - aptDate) / (1000 * 60 * 60 * 24);

      // 3. 限制在 0 到 7 天內（避免日期異常且符合 7 天限制）
      return diffInDays >= 0 && diffInDays <= 7;
    },
    isReviewExpired(apt) {
      // 1. 狀態必須是「已完成」且「尚未評價」
      if (apt.status !== 1 || apt.isReviewed) return false;

      const aptDate = new Date(apt.date);
      const now = new Date();
      const diffInDays = (now - aptDate) / (1000 * 60 * 60 * 24);
      return diffInDays > 7;
    },
    viewReview(appointment) {
      // 實作查看評價的邏輯，這裡先用 alert 示範
      alert(`您的評價內容：\n評分：${appointment.reviewRating} 星\n評語：${appointment.reviewComment || '無'}`);
    }
  }
}
</script>

<style>
@import '@/css/grooming/appointments.css';

/* 新增的 loading 和 error 樣式 */
.loading-indicator, .error-message, .no-data-message {
  text-align: center;
  padding: 20px;
  font-size: 1rem;
  color: #666;
}
.error-message {
  color: #d32f2f; /* 紅色用於錯誤訊息 */
  font-weight: bold;
}
.no-data-message {
  color: #888;
  font-style: italic;
}

/* 輔助類別 */
.mt-20 { margin-top: 20px; }
.mt-25 { margin-top: 25px; }
.m-0 { margin: 0; }
.mb-5 { margin-bottom: 5px; }
.p-0 { padding: 0; }
.gap-10 { gap: 10px; }
.flex-1 { flex: 1; }
.auto-width { width: auto !important; }


/* 毛孩卡片優化 */
.card-header-flex {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 15px;
}

/* 表格篩選器 */
.filter-group-row { display: flex; align-items: center; gap: 10px; }

.filter-label { font-size: 0.9rem; color: #666; }
.status-select { 
  padding: 5px 10px; 
  border-radius: 6px; 
  border: 1px solid #ddd; 
  font-size: 0.85rem; 
  cursor: pointer; 
  outline: none; 
}

/* 分頁樣式 */
.pet-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.mini-page-btn {
  padding: 4px 10px;
  border: 1px solid var(--primary-color);
  background: #fff;
  color: var(--primary-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}
.mini-page-btn:disabled {
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}
</style>
