<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <h2 class="section-title">會員中心儀表板</h2>

      <!-- 頂部氛圍橫幅 -->
      <div class="member-hero-banner">
        <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&h=300&fit=crop" alt="Salon Banner" />
        <div class="hero-overlay">
          <h3>歡迎回來，{{ memberInfo.name }} 🐾</h3>
          <p>今天也是呵護毛孩的好日子，讓我們一起守護他們的笑容。</p>
        </div>
      </div>

      <div class="grid grid-3" style="align-items: start;">
        <div class="card member-profile-card">
          <div class="profile-avatar">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Avatar" />
          </div>
          <h3 style="text-align: center; margin-bottom: 15px;">{{ memberInfo.name }} <span class="badge badge-success" style="font-size: 0.75rem; vertical-align: middle;">驗證會員</span></h3>
          <div class="info-list">
            <div class="info-list-item"><span style="color:#747d8c;">登入帳號 (account)</span><strong>{{ memberInfo.account }}</strong></div>
            <div class="info-list-item"><span style="color:#747d8c;">聯絡電話 (phone)</span><strong>{{ memberInfo.phone }}</strong></div>
            <div class="info-list-item"><span style="color:#747d8c;">電子信箱 (email)</span><strong>{{ memberInfo.email }}</strong></div>
            <div class="info-list-item"><span style="color:#747d8c;">通訊地址 (address)</span><strong style="max-width: 150px; text-align: right; word-break: break-all;">{{ memberInfo.address }}</strong></div>
            <div class="info-list-item"><span style="color:#747d8c;">註冊日期 (createDate)</span><strong>{{ memberInfo.createDate }}</strong></div>
          </div>
          <button @click="openEditModal" class="btn btn-primary btn-block" style="margin-top: 20px; font-size: 0.9rem; padding: 8px;">修改會員資料</button>
        </div>

        <div class="card col-span-2">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="color: var(--text-color);">我的毛孩們 (Pet)</h3>
            <button @click="openAddPetModal" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">+ 新增毛孩</button>
          </div>

          <div v-for="pet in paginatedPets" :key="pet.name" class="pet-mini-card">
            <div style="flex-grow: 1;">
              <h4 style="margin-bottom: 4px;">🐾 {{ pet.name }} 
                <span class="role-badge" :style="{ background: pet.gender === 1 ? '#e1f5fe' : '#fce4ec', color: pet.gender === 1 ? '#0288d1' : '#c2185b' }">
                  {{ pet.gender === 1 ? '小男生' : '小女生' }}
                </span>
              </h4>
              <p style="font-size: 0.85rem; color:#666;">品種：{{ pet.breed }} | 年齡：{{ pet.age }} 歲 | 體重：{{ pet.weight }} kg</p>
              <p style="font-size: 0.85rem; color: var(--primary-color); margin-top: 3px;">✂ 醫療與個性備註：{{ pet.notes }}</p>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;">
              <span v-if="pet.isNeutered" class="badge badge-success" style="margin-bottom: 5px;">已結紮</span>
              <div style="display: flex; gap: 8px;">
                <button @click="openEditPetModal(pet)" class="edit-pet-btn" title="編輯毛孩">✏️</button>
                <button @click="deletePet(pet.name)" class="delete-pet-btn" title="刪除毛孩">🗑️</button>
              </div>
            </div>
          </div>

          <!-- 毛孩分頁控制項 -->
          <div class="pet-pagination" v-if="totalPetPages > 1">
            <button 
              class="mini-page-btn" 
              :disabled="currentPetPage === 1" 
              @click="currentPetPage--"
            >上一頁</button>
            <span class="page-info">第 {{ currentPetPage }} / {{ totalPetPages }} 頁</span>
            <button 
              class="mini-page-btn" 
              :disabled="currentPetPage === totalPetPages" 
              @click="currentPetPage++"
            >下一頁</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0;">最新美容預約進度 (Appointments)</h3>
          <div class="filter-group" style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.9rem; color: #666;">篩選狀態：</label>
            <select v-model="filterStatus" style="padding: 5px 10px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.85rem; cursor: pointer; outline: none;">
              <option value="all">顯示全部</option>
              <option value="0">已收到預約</option>
              <option value="1">服務已完成</option>
              <option value="2">預約已取消</option>
              <option value="3">美容進行中</option>
            </select>
          </div>
        </div>

        <table class="custom-dashboard-table">
          <thead>
            <tr><th>預約編號</th><th>預約毛孩</th><th>選擇項目</th><th>預約時間 (apt_date)</th><th>指定美容師</th><th>目前狀態 (status)</th></tr>
          </thead>
          <tbody>
            <tr v-for="apt in paginatedAppointments" :key="apt.id">
              <td>{{ apt.id }}</td>
              <td><strong>{{ apt.petName }}</strong></td>
              <td>{{ apt.serviceName }} ({{ apt.price }})</td>
              <td>{{ apt.date }}</td>
              <td>{{ apt.groomer }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(apt.status)">
                  {{ getStatusLabel(apt.status) }} ({{ apt.status }})
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 預約分頁控制項 -->
        <div class="pet-pagination" v-if="totalAptPages > 1" style="margin-top: 20px;">
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

      <div class="card" style="margin-top: 25px;">
        <h3>最近帳號安全登入日誌 (LoginLog)</h3>
        <p style="font-size: 0.85rem; color:#747d8c; margin-bottom: 5px;">此表格將即時與後台的 `lastLoginTime`、`lastLoginIp` 等欄位連動連線</p>
        <table class="custom-dashboard-table">
          <thead>
            <tr><th>日誌編號 (logId)</th><th>登入時間 (lastLoginTime)</th><th>登出時間 (lastLogoutTime)</th><th>登入來源 IP (lastLoginIp)</th><th>驗證狀態 (lastStatus)</th></tr>
          </thead>
          <tbody>
            <tr><td>#8829</td><td>2026-05-31 14:20:11</td><td>2026-05-31 15:30:00</td><td><code>192.168.1.50</code></td><td><span class="badge badge-success">成功 (1)</span></td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <footer>
      <p>&copy; 2026 毛孩萌沙龍. All Rights Reserved.</p>
    </footer>

    <!-- 修改資料彈窗 (Modal) -->
    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="isEditModalOpen = false">
      <div class="card modal-content">
        <h3 style="margin-bottom: 20px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">編輯會員資料</h3>
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
          <div style="display: flex; gap: 10px; margin-top: 25px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">儲存修改</button>
            <button type="button" @click="isEditModalOpen = false" class="btn" style="flex: 1; background: #eee; color: #666;">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 編輯毛孩彈窗 (Modal) -->
    <div v-if="isEditPetModalOpen" class="modal-overlay" @click.self="isEditPetModalOpen = false">
      <div class="card modal-content">
        <h3 style="margin-bottom: 20px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">✏️ 編輯毛孩資訊</h3>
        <form @submit.prevent="updatePet">
          <div class="grid grid-2" style="padding:0; gap:10px;">
            <div class="modal-form-group">
              <label>毛孩姓名</label>
              <input type="text" v-model="editingPet.name" required>
            </div>
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model.number="editingPet.gender" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                <option :value="1">小男生</option>
                <option :value="0">小女生</option>
              </select>
            </div>
          </div>
          <div class="grid grid-3" style="padding:0; gap:10px;">
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="editingPet.breed" required></div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="editingPet.age" required></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="editingPet.weight" required></div>
          </div>
          <div class="modal-form-group">
            <label>醫療與個性備註</label>
            <textarea v-model="editingPet.notes" rows="2" style="width:100%; border:1px solid #ddd; border-radius:6px; padding:10px;"></textarea>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">儲存變更</button>
            <button type="button" @click="isEditPetModalOpen = false" class="btn" style="flex: 1; background: #eee; color: #666;">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增毛孩彈窗 (Modal) -->
    <div v-if="isAddPetModalOpen" class="modal-overlay" @click.self="isAddPetModalOpen = false">
      <div class="card modal-content">
        <h3 style="margin-bottom: 20px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">🐾 新增毛孩資訊</h3>
        <form @submit.prevent="saveNewPet">
          <div class="grid grid-2" style="padding:0; gap:10px;">
            <div class="modal-form-group">
              <label>毛孩姓名</label>
              <input type="text" v-model="newPet.name" placeholder="例如：巧克力" required>
            </div>
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model.number="newPet.gender" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                <option :value="1">小男生</option>
                <option :value="0">小女生</option>
              </select>
            </div>
          </div>
          <div class="grid grid-3" style="padding:0; gap:10px;">
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="newPet.breed" required></div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="newPet.age" required></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="newPet.weight" required></div>
          </div>
          <div class="modal-form-group">
            <label>醫療與個性備註</label>
            <textarea v-model="newPet.notes" rows="2" style="width:100%; border:1px solid #ddd; border-radius:6px; padding:10px;" placeholder="是否有過敏或害怕的事情？"></textarea>
          </div>
          <div class="modal-form-group" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" v-model="newPet.isNeutered" id="isNeutered" style="width: auto;">
            <label for="isNeutered" style="margin-bottom: 0;">是否已結紮？</label>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">確認新增</button>
            <button type="button" @click="isAddPetModalOpen = false" class="btn" style="flex: 1; background: #eee; color: #666;">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'MemberPage',
  components: { NavBar },
  data() {
    return {
      memberInfo: {
        name: '王大明',
        account: 'taming888',
        phone: '0912-345-678',
        email: 'taming@example.com',
        address: '台南市大內區1號',
        createDate: '2026-01-15'
      },
      myPets: [
        {
          name: '巧克力',
          gender: 1,
          breed: '貴賓狗',
          age: 3,
          weight: 5.20,
          notes: '無過敏，剪耳後毛容易緊張，需溫柔安撫。',
          isNeutered: true
        },
        {
          name: 'Mimi',
          gender: 0,
          breed: '波斯貓',
          age: 2,
          weight: 4.10,
          notes: '不喜歡碰尾巴，洗澡時需要Emily美容師協助。',
          isNeutered: true
        }
      ],
      appointments: [
        { id: '#APT-0024', petName: '巧克力', serviceName: '精緻造型剪毛', price: '$1,200', date: '2026-06-05 13:00', groomer: 'Andy', status: 0 },
        { id: '#APT-0012', petName: 'Mimi', serviceName: '草本舒緩藥浴', price: '$800', date: '2026-05-20 10:00', groomer: 'Emily', status: 1 },
        { id: '#APT-0005', petName: '巧克力', serviceName: '基礎洗澡', price: '$500', date: '2026-04-15 15:30', groomer: 'Jason', status: 2 },
        { id: '#APT-0030', petName: 'Mimi', serviceName: '貓咪舒壓洗護', price: '$800', date: '2026-06-12 11:00', groomer: 'Sophie', status: 3 }
      ],
      // 會員編輯相關
      isEditModalOpen: false,
      tempMemberInfo: {},
      filterStatus: 'all',
      // 預約分頁相關
      currentAptPage: 1,
      aptPageSize: 5,
      // 毛孩分頁相關
      currentPetPage: 1,
      petPageSize: 2,
      // 新增毛孩相關
      isAddPetModalOpen: false,
      newPet: {
        name: '',
        gender: 1,
        breed: '',
        age: null,
        weight: null,
        notes: '',
        isNeutered: false
      },
      // 編輯毛孩相關
      isEditPetModalOpen: false,
      editingPet: {},
      editingPetIndex: null
    }
  },
  computed: {
    totalPetPages() {
      return Math.ceil(this.myPets.length / this.petPageSize);
    },
    filteredAppointments() {
      if (this.filterStatus === 'all') return this.appointments;
      return this.appointments.filter(apt => apt.status === parseInt(this.filterStatus));
    },
    totalAptPages() {
      return Math.ceil(this.filteredAppointments.length / this.aptPageSize);
    },
    paginatedAppointments() {
      const start = (this.currentAptPage - 1) * this.aptPageSize;
      const end = start + this.aptPageSize;
      return this.filteredAppointments.slice(start, end);
    },
    paginatedPets() {
      const start = (this.currentPetPage - 1) * this.petPageSize;
      const end = start + this.petPageSize;
      return this.myPets.slice(start, end);
    }
  },
  watch: {
    totalPetPages(newVal) {
      if (this.currentPetPage > newVal && newVal > 0) {
        this.currentPetPage = newVal;
      }
    },
    totalAptPages(newVal) {
      if (this.currentAptPage > newVal && newVal > 0) {
        this.currentAptPage = newVal;
      }
    },
    // 當篩選條件改變時，回到預約表格的第一頁
    filterStatus() {
      this.currentAptPage = 1;
    }
  },
  methods: {
    openEditModal() {
      this.tempMemberInfo = { ...this.memberInfo };
      this.isEditModalOpen = true;
    },
    saveMemberInfo() {
      this.memberInfo = { ...this.tempMemberInfo };
      this.isEditModalOpen = false;
      alert('會員資料更新成功！');
    },
    openAddPetModal() {
      // 重置新毛孩表單
      this.newPet = { name: '', gender: 1, breed: '', age: null, weight: null, notes: '', isNeutered: false };
      this.isAddPetModalOpen = true;
    },
    saveNewPet() {
      this.myPets.push({ ...this.newPet });
      this.isAddPetModalOpen = false;
      alert(`已成功加入毛孩：${this.newPet.name}！`);
    },
    openEditPetModal(pet) {
      this.editingPetIndex = this.myPets.findIndex(p => p === pet);
      this.editingPet = { ...pet }; // 淺拷貝以避免即時修改原始數據
      this.isEditPetModalOpen = true;
    },
    updatePet() {
      this.myPets[this.editingPetIndex] = { ...this.editingPet };
      this.isEditPetModalOpen = false;
      alert('毛孩資料已更新！');
    },
    getStatusLabel(status) {
      const labels = {
        0: '已收到預約',
        1: '服務已完成',
        2: '預約已取消',
        3: '美容進行中'
      };
      return labels[status] || '未知狀態';
    },
    getStatusBadgeClass(status) {
      const classes = {
        0: 'badge-info',    // 藍色
        1: 'badge-success', // 綠色
        2: 'badge-secondary', // 灰色
        3: 'badge-warning'  // 黃色
      };
      return classes[status] || '';
    },
    deletePet(name) {
      if (confirm(`確定要刪除毛孩「${name}」的資料嗎？`)) {
        this.myPets = this.myPets.filter(p => p.name !== name);
      }
    }
  }
}
</script>

<style>
@import '@/css/grooming/member.css';

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}
.member-hero-banner {
  width: 100%;
  height: 180px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.member-hero-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.65);
}
.hero-overlay {
  position: absolute;
  top: 50%;
  left: 40px;
  transform: translateY(-50%);
  color: #fff;
}
.hero-overlay h3 {
  font-size: 1.6rem;
  margin-bottom: 8px;
}
.hero-overlay p {
  font-size: 0.95rem;
  opacity: 0.9;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0f4ff;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.modal-content {
  width: 95%; max-width: 500px; padding: 25px;
  background: #fff; border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}
.modal-form-group {
  margin-bottom: 15px;
}
.modal-form-group label {
  display: block; margin-bottom: 5px;
  font-weight: bold; font-size: 0.9rem; color: #555;
}
.modal-form-group input {
  width: 100%; padding: 10px;
  border: 1px solid #ddd; border-radius: 6px;
  font-size: 0.95rem;
}
.edit-pet-btn,
.delete-pet-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #747d8c;
  transition: color 0.2s;
}
.edit-pet-btn:hover {
  color: var(--primary-color);
}
.delete-pet-btn:hover {
  color: #ff4757;
}

/* 毛孩列表分頁樣式 */
.pet-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
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
