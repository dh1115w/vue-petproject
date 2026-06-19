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

          <div v-for="pet in paginatedPets" :key="pet.id" class="pet-mini-card">
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
                <button @click="deletePet(pet)" class="delete-pet-btn" title="刪除毛孩">🗑️</button>
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

      <!-- 登入紀錄卡片：顯示這個會員最近的登入/登出紀錄 -->
      <div class="card login-log-card" style="margin-top: 25px;">
        <h3>登入紀錄 (LoginLog)</h3>
        <table class="custom-dashboard-table">
          <thead>
            <tr>
              <th>登入時間</th>
              <th>登出時間</th>
              <th>來源 IP</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <!-- 一筆一列，用 index 當 key（後端沒回 id，用順序即可） -->
            <tr v-for="(log, index) in loginLogs" :key="index">
              <td>{{ log.loginTime }}</td>
              <!-- logoutTime 是 null 代表還沒登出 → 顯示「使用中」 -->
              <td>{{ log.logoutTime || '使用中' }}</td>
              <td><code>{{ log.ip }}</code></td>
              <td>
                <span v-if="log.online" class="badge badge-success">🟢 上線</span>
                <span v-else class="badge badge-info">⚪ 離線</span>
              </td>
            </tr>
            <!-- 完全沒有紀錄時顯示一列提示 -->
            <tr v-if="loginLogs.length === 0">
              <td colspan="4" style="text-align: center;">目前沒有登入紀錄</td>
            </tr>
          </tbody>
        </table>
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
              <input type="text" v-model="editingPet.name">
            </div>
            <div class="modal-form-group">
              <label>生日</label>
              <input type="date" v-model="editingPet.birthday">
            </div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model="editingPet.gender" class="modal-select">
                <option value="male">公</option>
                <option value="female">母</option>
              </select>
            </div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="editingPet.age"></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="editingPet.weight"></div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group"><label>物種</label><input type="text" v-model="editingPet.species"></div>
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="editingPet.breed"></div>
            <div class="modal-form-group">
              <label>體型</label>
              <select v-model="editingPet.size" class="modal-select">
                <option value="big">大</option>
                <option value="mid">中</option>
                <option value="small">小</option>
              </select>
            </div>
          </div>
          <div class="modal-form-group">
            <label>是否結紮</label>
            <select v-model="editingPet.neutered" class="modal-select">
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
              <input type="text" v-model="newPet.name" placeholder="例如：巧克力">
            </div>
            <div class="modal-form-group">
              <label>生日</label>
              <input type="date" v-model="newPet.birthday">
            </div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group">
              <label>性別</label>
              <select v-model="newPet.gender" class="modal-select">
                <option value="male">公</option>
                <option value="female">母</option>
              </select>
            </div>
            <div class="modal-form-group"><label>年齡</label><input type="number" v-model.number="newPet.age"></div>
            <div class="modal-form-group"><label>體重(kg)</label><input type="number" step="0.1" v-model.number="newPet.weight"></div>
          </div>
          <div class="grid grid-3 modal-grid">
            <div class="modal-form-group"><label>物種</label><input type="text" v-model="newPet.species" placeholder="例：狗、貓"></div>
            <div class="modal-form-group"><label>品種</label><input type="text" v-model="newPet.breed"></div>
            <div class="modal-form-group">
              <label>體型</label>
              <select v-model="newPet.size" class="modal-select">
                <option value="big">大</option>
                <option value="mid">中</option>
                <option value="small">小</option>
              </select>
            </div>
          </div>
          <div class="modal-form-group">
            <label>是否結紮</label>
            <select v-model="newPet.neutered" class="modal-select">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user.js'
import Swal from 'sweetalert2'
import api from '@/plugins/axios.js'   // 共用 axios：會自動帶 token、指向後端網址

const router = useRouter()
const userStore = useUserStore()

// ===== 1. 會員資料 / 寵物清單 =====
// 都是登入時 LoginView 寫進 store 的假資料
// pets 是陣列，對它 push / splice 就會直接更新畫面
const memberInfo = userStore.memberInfo
const pets = userStore.pets


// ===== 2. 體型代碼轉成中文 =====
function sizeLabel(size) {
  if (size === 'big') return '大型'
  if (size === 'mid') return '中型'
  if (size === 'small') return '小型'
  return size
}


// ===== 3. 分頁 =====
// 先簡單做：全部寵物顯示在同一頁
// totalPetPages 維持 1，模板裡的分頁按鈕就會自動隱藏
const currentPetPage = ref(1)
const totalPetPages = ref(1)
const paginatedPets = pets


// ===== 4. 新增寵物 =====
const isAddPetModalOpen = ref(false)
const newPet = ref(emptyPet())

// 產生一隻欄位都空白的寵物（給表單當預設值）
function emptyPet() {
  return {
    name: '',
    birthday: '',
    age: null,
    gender: 'male',
    weight: null,
    species: '',
    breed: '',
    size: 'mid',
    neutered: 'unNeutered',
    health: '',
    personality: ''
  }
}

// 打開「新增寵物」彈窗
function openAddPetModal() {
  newPet.value = emptyPet()   // 先把表單清空
  isAddPetModalOpen.value = true
}

// 共用：檢查一隻寵物資料是否合格，不合格就跳 Swal 並回傳 false
function checkPet(pet) {
  // 姓名必填
  if (pet.name.trim() === '') {
    Swal.fire({ icon: 'warning', title: '請輸入毛孩姓名' })
    return false
  }
  // 年齡要大於 0
  if (Number(pet.age) <= 0) {
    Swal.fire({ icon: 'warning', title: '年齡需大於 0' })
    return false
  }
  // 體重要大於 0
  if (Number(pet.weight) <= 0) {
    Swal.fire({ icon: 'warning', title: '體重需大於 0' })
    return false
  }
  // 生日有填才驗，且不能選未來
  if (pet.birthday !== '') {
    const today = new Date()
    const birth = new Date(pet.birthday)
    if (birth > today) {
      Swal.fire({ icon: 'warning', title: '生日不能選未來的日期' })
      return false
    }
  }
  // 體型要跟體重對應（小<10、中10~25、大>25）
  const w = Number(pet.weight)
  let expectedSize = ''
  if (w < 10) {
    expectedSize = 'small'
  } else if (w <= 25) {
    expectedSize = 'mid'
  } else {
    expectedSize = 'big'
  }
  if (pet.size !== expectedSize) {
    Swal.fire({ icon: 'warning', title: '體型與體重不符（小型<10、中型10~25、大型>25 公斤）' })
    return false
  }
  return true   // 全部通過
}

// 確認新增：先驗證 → 打後端新增 → 成功才把「後端回傳的寵物（含 id）」加進清單
async function saveNewPet() {
  if (!checkPet(newPet.value)) return
  try {
    // 對後端 POST /api/member/secure/pet，body 就是這隻寵物的資料
    // token 由 axios 自動帶上，後端從 token 認出飼主是誰
    const response = await api.post('/api/member/secure/pet', newPet.value)

    // ⚠️ 加進清單的是 response.data（後端回的，帶有資料庫產生的 id）
    //    不是 newPet.value（那份沒有 id），這樣之後編輯/刪除才有 id 可用
    pets.push(response.data)

    isAddPetModalOpen.value = false
    Swal.fire({ icon: 'success', title: '新增成功', timer: 1000, showConfirmButton: false })
  } catch (error) {
    // 後端驗證不過或超過 5 隻時會回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '新增失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '新增失敗', text: msg })
  }
}


// ===== 5. 編輯寵物 =====
const isEditPetModalOpen = ref(false)
const editingPet = ref(emptyPet())   // 彈窗裡綁定的資料（先放一份複本，按取消才不會動到原本的）
let editTarget = null                // 記住正在編輯的是哪一隻

// 打開「編輯寵物」彈窗
function openEditPetModal(pet) {
  editTarget = pet
  editingPet.value = Object.assign({}, pet)   // 複製一份出來編輯
  isEditPetModalOpen.value = true
}

// 儲存變更：先驗證 → 打後端更新 → 成功才把「後端回傳的最新資料」寫回原本那隻
async function updatePet() {
  if (!checkPet(editingPet.value)) return
  try {
    // 對後端 PUT /api/member/secure/pet/{id}，網址帶這隻的 id，body 是新資料
    const response = await api.put('/api/member/secure/pet/' + editingPet.value.id, editingPet.value)

    // 用後端回傳的最新資料，覆蓋清單裡原本那隻（editTarget 記著是哪一隻）
    Object.assign(editTarget, response.data)

    isEditPetModalOpen.value = false
    Swal.fire({ icon: 'success', title: '更新成功', timer: 1000, showConfirmButton: false })
  } catch (error) {
    // 後端驗證不過、或「不是你的寵物」時會回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '更新失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '更新失敗', text: msg })
  }
}


// ===== 6. 刪除寵物 =====
// 收整隻 pet：pet.id 給後端用、pet.name 給確認訊息用
async function deletePet(pet) {
  // 先跳確認視窗，等使用者按「刪除」或「取消」
  const result = await Swal.fire({
    icon: 'warning',
    title: '確定要刪除「' + pet.name + '」嗎？',
    showCancelButton: true,   // 顯示「取消」按鈕
    confirmButtonText: '刪除',
    cancelButtonText: '取消'
  })
  // 按「取消」就直接結束，不刪
  if (!result.isConfirmed) return

  try {
    // 對後端 DELETE /api/member/secure/pet/{id}，網址帶這隻的 id
    await api.delete('/api/member/secure/pet/' + pet.id)

    // 後端刪成功 → 找到這隻在清單的位置（用 id 比對），把它移除
    const index = pets.findIndex(function (p) {
      return p.id === pet.id
    })
    if (index !== -1) pets.splice(index, 1)

    Swal.fire({ icon: 'success', title: '刪除成功', timer: 1000, showConfirmButton: false })
  } catch (error) {
    // 「不是你的寵物」「查無此寵物」時後端會回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '刪除失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '刪除失敗', text: msg })
  }
}


// ===== 7. 前往修改會員資料頁 =====
function goToUpdateProfile() {
  router.push('/member/updateprofile')
}


// ===== 8. 登入紀錄 =====
// loginLogs：存後端回傳的登入紀錄陣列（已照新到舊排好）
// 每筆欄位：loginTime / logoutTime(可能 null) / ip / online(true=上線)
const loginLogs = ref([])

// 向後端拿這個會員的登入紀錄
async function loadLoginLogs() {
  try {
    // GET /api/member/secure/login-logs，token 由 axios 自動帶上
    // 後端從 token 認出是哪個會員，只回傳他自己的紀錄
    const response = await api.get('/api/member/secure/login-logs')
    loginLogs.value = response.data
  } catch (error) {
    // 拿不到資料就用 Swal 提示
    const msg = error.response?.data?.message || '無法載入登入紀錄，請稍後再試'
    Swal.fire({ icon: 'error', title: '載入失敗', text: msg })
  }
}

// 頁面一載入就去拿登入紀錄
onMounted(loadLoginLogs)
</script>

<style>
@import '@/css/grooming/member.css';
</style>
