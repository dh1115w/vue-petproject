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

      <div class="grid grid-3 member-grid">
        <div class="card member-profile-card">
          <div class="profile-avatar">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Avatar" />
          </div>
          <h3 class="profile-name">{{ memberInfo.name }} <span class="badge badge-success profile-badge">驗證會員</span></h3>
          <div class="info-list">
            <div class="info-list-item"><span>登入帳號 (account)</span><strong>{{ memberInfo.account }}</strong></div>
            <div class="info-list-item"><span>聯絡電話 (phone)</span><strong>{{ memberInfo.phone }}</strong></div>
            <div class="info-list-item"><span>電子信箱 (email)</span><strong>{{ memberInfo.email }}</strong></div>
            <div class="info-list-item"><span>通訊地址 (address)</span><strong class="info-address">{{ memberInfo.address }}</strong></div>
            <div class="info-list-item"><span>註冊日期 (createDate)</span><strong>{{ memberInfo.createDate }}</strong></div>
          </div>
          <button @click="goToUpdateProfile" class="btn btn-primary btn-block btn-edit-profile">修改會員資料</button>
        </div>

        <div class="card col-span-2">
          <div class="pet-section-header">
            <h3>我的毛孩們 (Pet)</h3>
            <button @click="openAddPetModal" class="btn btn-primary btn-add-pet-sm">+ 新增毛孩</button>
          </div>

          <div v-for="pet in paginatedPets" :key="pet.name" class="pet-mini-card">
            <div class="pet-info">
              <h4 class="pet-name">🐾 {{ pet.name }}
                <span class="role-badge" :class="pet.gender === 'male' ? 'role-badge--male' : 'role-badge--female'">
                  {{ pet.gender === 'male' ? '小男生' : '小女生' }}
                </span>
              </h4>
              <p class="pet-meta">物種：{{ pet.species }} | 品種：{{ pet.breed }} | 體型：{{ sizeLabel(pet.size) }}</p>
              <p class="pet-meta">生日：{{ pet.birthday }} | 年齡：{{ pet.age }} 歲 | 體重：{{ pet.weight }} kg</p>
              <p class="pet-note pet-note--first">🩺 健康狀況：{{ pet.health }}</p>
              <p class="pet-note">✨ 個性描述：{{ pet.personality }}</p>
            </div>
            <div class="pet-actions">
              <span v-if="pet.neutered === 'isNeutered'" class="badge badge-success pet-neutered-badge">已結紮</span>
              <div class="pet-action-btns">
                <button @click="openEditPetModal(pet)" class="edit-pet-btn" title="編輯毛孩">✏️</button>
                <button @click="deletePet(pet.name)" class="delete-pet-btn" title="刪除毛孩">🗑️</button>
              </div>
            </div>
          </div>

          <!-- 毛孩分頁控制項 -->
          <div class="pet-pagination" v-if="totalPetPages > 1">
            <button class="mini-page-btn" :disabled="currentPetPage === 1" @click="currentPetPage--">上一頁</button>
            <span class="page-info">第 {{ currentPetPage }} / {{ totalPetPages }} 頁</span>
            <button class="mini-page-btn" :disabled="currentPetPage === totalPetPages" @click="currentPetPage++">下一頁</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 編輯毛孩彈窗 (Modal) -->
    <div v-if="isEditPetModalOpen" class="modal-overlay" @click.self="isEditPetModalOpen = false">
      <div class="card modal-content">
        <h3 class="modal-title">✏️ 編輯毛孩資訊</h3>
        <form @submit.prevent="updatePet">
          <div class="grid grid-2 modal-grid">
            <div class="modal-form-group">
              <label>毛孩姓名</label>
              <input type="text" v-model="editingPet.name" required>
            </div>
            <div class="modal-form-group">
              <label>生日</label>
              <input type="date" v-model="editingPet.birthday">
            </div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model="editingPet.gender" required class="modal-select">
                <option value="male">公</option>
                <option value="female">母</option>
              </select>
            </div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="editingPet.age" required></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="editingPet.weight" required></div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group"><label>物種</label><input type="text" v-model="editingPet.species" required></div>
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="editingPet.breed" required></div>
            <div class="modal-form-group">
              <label>體型</label>
              <select v-model="editingPet.size" required class="modal-select">
                <option value="big">大</option>
                <option value="mid">中</option>
                <option value="small">小</option>
              </select>
            </div>
          </div>
          <div class="modal-form-group">
            <label>是否結紮</label>
            <select v-model="editingPet.neutered" required class="modal-select">
              <option value="isNeutered">是</option>
              <option value="unNeutered">否</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label>健康狀況</label>
            <input type="text" v-model="editingPet.health">
          </div>
          <div class="modal-form-group">
            <label>個性描述</label>
            <textarea v-model="editingPet.personality" rows="2" class="modal-textarea"></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">儲存變更</button>
            <button type="button" @click="isEditPetModalOpen = false" class="btn btn-cancel">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增毛孩彈窗 (Modal) -->
    <div v-if="isAddPetModalOpen" class="modal-overlay" @click.self="isAddPetModalOpen = false">
      <div class="card modal-content">
        <h3 class="modal-title">🐾 新增毛孩資訊</h3>
        <form @submit.prevent="saveNewPet">
          <div class="grid grid-2 modal-grid">
            <div class="modal-form-group">
              <label>毛孩姓名</label>
              <input type="text" v-model="newPet.name" placeholder="例如：巧克力" required>
            </div>
            <div class="modal-form-group">
              <label>生日</label>
              <input type="date" v-model="newPet.birthday">
            </div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model="newPet.gender" required class="modal-select">
                <option value="male">公</option>
                <option value="female">母</option>
              </select>
            </div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="newPet.age" required></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="newPet.weight" required></div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group"><label>物種</label><input type="text" v-model="newPet.species" placeholder="例：狗、貓" required></div>
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="newPet.breed" required></div>
            <div class="modal-form-group">
              <label>體型</label>
              <select v-model="newPet.size" required class="modal-select">
                <option value="big">大</option>
                <option value="mid">中</option>
                <option value="small">小</option>
              </select>
            </div>
          </div>
          <div class="modal-form-group">
            <label>是否結紮</label>
            <select v-model="newPet.neutered" required class="modal-select">
              <option value="isNeutered">是</option>
              <option value="unNeutered">否</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label>健康狀況</label>
            <input type="text" v-model="newPet.health" placeholder="請描述健康狀況">
          </div>
          <div class="modal-form-group">
            <label>個性描述</label>
            <textarea v-model="newPet.personality" rows="2" class="modal-textarea" placeholder="請描述寵物個性"></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">確認新增</button>
            <button type="button" @click="isAddPetModalOpen = false" class="btn btn-cancel">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()

const memberInfo = reactive({
  name: '',
  account: '',
  phone: '',
  email: '',
  address: '',
  createDate: ''
})

const myPets = ref([])

const currentPetPage = ref(1)
const petPageSize = ref(2)
const isAddPetModalOpen = ref(false)
const newPet = reactive({ name: '', birthday: '', age: null, gender: 'male', weight: null, species: '', breed: '', size: 'mid', neutered: 'unNeutered', health: '', personality: '' })
const isEditPetModalOpen = ref(false)
const editingPet = reactive({})
const editingPetIndex = ref(null)

const totalPetPages = computed(() => Math.ceil(myPets.value.length / petPageSize.value))
const paginatedPets = computed(() => {
  const start = (currentPetPage.value - 1) * petPageSize.value
  return myPets.value.slice(start, start + petPageSize.value)
})

watch(totalPetPages, (newVal) => {
  if (currentPetPage.value > newVal && newVal > 0) currentPetPage.value = newVal
})

function goToUpdateProfile() {
  router.push('/member/updateprofile')
}
function openAddPetModal() {
  Object.assign(newPet, { name: '', birthday: '', age: null, gender: 'male', weight: null, species: '', breed: '', size: 'mid', neutered: 'unNeutered', health: '', personality: '' })
  isAddPetModalOpen.value = true
}
function saveNewPet() {
  myPets.value.push({ ...newPet })
  isAddPetModalOpen.value = false
  alert(`已成功加入毛孩：${newPet.name}！`)
}
function openEditPetModal(pet) {
  editingPetIndex.value = myPets.value.findIndex(p => p === pet)
  Object.assign(editingPet, pet)
  isEditPetModalOpen.value = true
}
function updatePet() {
  myPets.value[editingPetIndex.value] = { ...editingPet }
  isEditPetModalOpen.value = false
  alert('毛孩資料已更新！')
}
function deletePet(name) {
  if (confirm(`確定要刪除毛孩「${name}」的資料嗎？`)) {
    myPets.value = myPets.value.filter(p => p.name !== name)
  }
}
function sizeLabel(size) {
  const labels = { big: '大', mid: '中', small: '小' }
  return labels[size] || size
}
</script>

<style>
@import '@/css/grooming/member.css';
</style>
