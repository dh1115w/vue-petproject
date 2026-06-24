<template>
  <div class="create-account-page">

    <div class="page-header">
      <RouterLink to="/" class="back-link">← 返回首頁</RouterLink>
    </div>

    <div class="form-container">
      <div class="form-header">
        <p class="form-eyebrow">Member Registration</p>
        <h1 class="form-title">創建帳號</h1>
      </div>

      <form @submit.prevent="handleRegister" class="form-body">

        <!-- 個人資料 -->
        <div class="section-block">
          <p class="section-label">Personal Information</p>

          <div class="form-group">
            <label>姓名（必填，最多 45 字）</label>
            <input type="text" v-model="name" placeholder="請輸入姓名" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>生日（必填）</label>
              <input type="date" v-model="birthday" />
            </div>
            <div class="form-group">
              <label>身分證字號（必填，1 個英文字母＋9 個數字）</label>
              <input type="text" v-model="idNumber" placeholder="例：A123456789" />
            </div>
          </div>

          <div class="form-group">
            <label>性別（必填）</label>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" value="male" v-model="gender" />男</label>
              <label class="radio-label"><input type="radio" value="female" v-model="gender" />女</label>
            </div>
          </div>

          <div class="form-group">
            <label>住址（必填，最多 250 字）</label>
            <input type="text" v-model="address" placeholder="請輸入住址" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>電話（必填，09 開頭共 10 碼）</label>
              <input type="tel" v-model="phone" placeholder="例：0912345678" />
            </div>
            <div class="form-group">
              <label>電子信箱（必填，例：name@example.com）</label>
              <input type="email" v-model="email" placeholder="請輸入電子信箱" />
            </div>
          </div>

          <!-- 信箱驗證碼：寄送按鈕 + 驗證碼輸入框（註冊一定要先驗證信箱沒填錯）-->
          <div class="form-group">
            <label>信箱驗證碼（必填，請按「寄送驗證碼」後到信箱收 6 位數字）</label>
            <input type="text" v-model="emailCode" placeholder="請輸入信箱收到的 6 位數驗證碼" maxlength="6" />
            <!-- 寄送按鈕：冷卻中（codeCooldown > 0）就鎖住，並顯示剩餘秒數 -->
            <button type="button" class="btn-secondary" @click="sendRegisterCode" :disabled="codeCooldown > 0" style="margin-top: 8px;">
              {{ codeCooldown > 0 ? codeCooldown + ' 秒後可重寄' : '寄送驗證碼' }}
            </button>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>帳號（必填，4～30 字，限英文與數字）</label>
              <input type="text" v-model="account" placeholder="請設定帳號" />
            </div>
            <div class="form-group">
              <label>密碼（必填，8～80 字，限英數與@#$%^&*()_-）</label>
              <!-- :type 動態綁定：showPassword 為 true 顯示 text（看得到），false 顯示 password（圓點） -->
              <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="請設定密碼" />
              <!-- 勾選框：v-model 綁 showPassword，打勾就把開關變 true -->
              <label class="radio-label"><input type="checkbox" v-model="showPassword" />顯示密碼</label>
            </div>
          </div>

          <div class="form-group">
            <label>確認密碼（必填）</label>
            <input type="password" v-model="confirmPassword" placeholder="請再次輸入密碼" />
            <p v-if="confirmPassword && password !== confirmPassword" class="field-error">
              兩次輸入的密碼不一致
            </p>
          </div>
        </div>

        <!-- 寵物資料 -->
        <div class="section-block">
          <p class="section-label">Pet Information</p>
          <p class="section-note">寵物為選填；若要登記寵物，標示「必填」的欄位請務必填寫。</p>

          <div v-for="(pet, index) in pets" :key="index" class="pet-card">
            <div class="pet-card-header">
              <span class="pet-card-label">Pet {{ index + 1 }}</span>
              <button type="button" class="btn-remove" @click="removePet(index)">刪除</button>
            </div>
            <div class="pet-card-body">
              <div class="form-group">
                <label>姓名（必填，最多 50 字）</label>
                <input type="text" v-model="pet.name" placeholder="寵物名字" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>生日（選填，不能晚於今天）</label>
                  <input type="date" v-model="pet.birthday" />
                </div>
                <div class="form-group">
                  <label>年齡（必填，需大於 0）</label>
                  <input type="number" v-model="pet.age" placeholder="歲" />
                </div>
              </div>

              <div class="form-group">
                <label>性別（必填）</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" :name="'petGender' + index" value="male" v-model="pet.gender" />公</label>
                  <label class="radio-label"><input type="radio" :name="'petGender' + index" value="female" v-model="pet.gender" />母</label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>體重 kg（必填，需大於 0）</label>
                  <!-- step="0.01"：允許小數（到小數點後兩位），對應資料庫 DECIMAL(6,2) -->
                  <input type="number" step="0.01" v-model="pet.weight" placeholder="kg" />
                </div>
                <div class="form-group">
                  <label>物種（選填）</label>
                  <input type="text" v-model="pet.species" placeholder="例：狗、貓" />
                </div>
              </div>

              <div class="form-group">
                <label>品種（選填）</label>
                <input type="text" v-model="pet.breed" placeholder="請輸入品種" />
              </div>

              <div class="form-group">
                <label>體型（選填；小型：10 公斤以下／中型：10–25／大型：25 以上）</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" :name="'petSize' + index" value="big" v-model="pet.size" />大</label>
                  <label class="radio-label"><input type="radio" :name="'petSize' + index" value="mid" v-model="pet.size" />中</label>
                  <label class="radio-label"><input type="radio" :name="'petSize' + index" value="small" v-model="pet.size" />小</label>
                </div>
              </div>

              <div class="form-group">
                <label>是否結紮（必填）</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" :name="'petNeutered' + index" value="isNeutered" v-model="pet.neutered" />是</label>
                  <label class="radio-label"><input type="radio" :name="'petNeutered' + index" value="unNeutered" v-model="pet.neutered" />否</label>
                </div>
              </div>

              <div class="form-group">
                <label>健康狀況（選填）</label>
                <input type="text" v-model="pet.health" placeholder="請描述健康狀況" />
              </div>

              <div class="form-group">
                <label>個性描述（選填）</label>
                <textarea v-model="pet.personality" placeholder="請描述寵物個性"></textarea>
              </div>
            </div>
          </div>

          <button type="button" class="btn-add-pet" @click="addPet" :disabled="pets.length >= 5">
            + 新增寵物（最多 5 隻）
          </button>
        </div>

        <!-- 送出 -->
        <div class="form-footer">
          <button type="submit" class="btn-primary">創建帳號</button>
          <button type="button" class="btn-secondary" @click="toMember">取消</button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import '@/css/member/create-account.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '@/plugins/axios.js'   // 共用 axios：指向後端網址

const router = useRouter()
const name = ref('')
const birthday = ref('')
const idNumber = ref('')
const gender = ref('')
const address = ref('')
const phone = ref('')
const email = ref('')
// 信箱驗證碼：使用者按「寄送驗證碼」後，到信箱收到的 6 位數字
const emailCode = ref('')
// 寄送按鈕的「冷卻秒數」：大於 0 時按鈕鎖住並倒數，避免使用者狂寄信
const codeCooldown = ref(0)
const account = ref('')
const password = ref('')
const confirmPassword = ref('')
// 密碼是否顯示成明碼：false=圓點（預設）、true=看得到文字
const showPassword = ref(false)
const pets = ref([
  { name: '', birthday: '', age: '', gender: '', weight: '', size: '', species: '', breed: '', neutered: '', health: '', personality: '' }
])

function addPet() {
  // 寵物少於 5 隻時，才新增一隻（最多 5 隻）
  if (pets.value.length < 5) {
    pets.value.push({ name: '', birthday: '', age: '', gender: '', weight: '', size: '', species: '', breed: '', neutered: '', health: '', personality: '' })
  }
}

function removePet(index) {
  pets.value.splice(index, 1)
}

// ===== 寄送「註冊」驗證碼：請後端寄一組 6 位數驗證碼到使用者填的信箱 =====
// async：裡面要 await 等後端回應
async function sendRegisterCode() {
  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // email 格式
  const emailValue = email.value.trim()          // 去掉前後空白

  // 先在前端做基本檢查（後端也會再檢查一次，這裡是給使用者即時提示）
  if (emailValue === '') {
    Swal.fire({ icon: 'warning', title: '請先輸入電子信箱' })
    return
  }
  if (!emailRule.test(emailValue)) {
    Swal.fire({ icon: 'warning', title: '電子信箱格式錯誤' })
    return
  }

  try {
    // 對後端 POST /api/member/send-register-code，只送使用者填的信箱
    await api.post('/api/member/send-register-code', {
      email: emailValue
    })
    Swal.fire({ icon: 'success', title: '驗證碼已寄出', text: '請至信箱查看 6 位數驗證碼，並在 10 分鐘內填入' })

    // 寄出成功 → 按鈕進入 60 秒冷卻，倒數完才能再寄
    codeCooldown.value = 60
    // setInterval：每隔 1000 毫秒（= 1 秒）執行一次裡面的程式
    const timer = setInterval(() => {
      codeCooldown.value = codeCooldown.value - 1   // 秒數減 1
      if (codeCooldown.value <= 0) {
        clearInterval(timer)   // 倒數到 0 就停掉計時器，不再繼續
      }
    }, 1000)

  } catch (error) {
    // 格式錯／信箱已被使用／寄信失敗時，後端回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '寄送失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '寄送失敗', text: msg })
  }
}

// ===== 創建帳號：先驗證個人資料，全部通過才送出 =====
// async：裡面要「等」後端回應（await），函式前面要加 async
async function handleRegister() {
  // 規則用的正規表達式
  const idRule = /^[A-Za-z][12][0-9]{8}$/    // 身分證：1 英文 + (1或2) + 8 數字
  const phoneRule = /^09[0-9]{8}$/           // 電話：09 開頭共 10 碼
  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // email 格式
  const accountRule = /^[A-Za-z0-9]+$/       // 帳號：只能英數
  const passwordRule = /^[A-Za-z0-9!@#$%^&*()_-]+$/ // 密碼：英數+常用符號

  // 把文字欄位前後空白去掉
  const nameValue = name.value.trim()
  const idValue = idNumber.value.trim()
  const addressValue = address.value.trim()
  const phoneValue = phone.value.trim()
  const emailValue = email.value.trim()
  const emailCodeValue = emailCode.value.trim()
  const accountValue = account.value.trim()
  const passwordValue = password.value.trim()

  // 姓名：必填、≤45 字
  if (nameValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入姓名' })
    return
  }
  if (nameValue.length > 45) {
    Swal.fire({ icon: 'warning', title: '姓名不能超過 45 個字' })
    return
  }
  // 生日：必填
  if (birthday.value === '') {
    Swal.fire({ icon: 'warning', title: '請選擇生日' })
    return
  }
  // 生日：不能選未來的日期
  const today = new Date()                 // 今天的日期
  const birth = new Date(birthday.value)   // 使用者選的生日（文字轉成日期）
  if (birth > today) {
    Swal.fire({ icon: 'warning', title: '生日不能選未來的日期' })
    return
  }
  // 生日：年齡要在合理範圍（0～120 歲）
  const age = today.getFullYear() - birth.getFullYear()  // 用年份相減算約略年齡
  if (age < 0 || age > 120) {
    Swal.fire({ icon: 'warning', title: '生日年份不合理，請重新確認' })
    return
  }
  // 身分證：必填、格式
  if (idValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入身分證字號' })
    return
  }
  if (!idRule.test(idValue)) {
    Swal.fire({ icon: 'warning', title: '身分證格式錯誤（1 個英文字母，第一個數字為 1 或 2，共 10 碼）' })
    return
  }
  // 性別：必選
  if (gender.value === '') {
    Swal.fire({ icon: 'warning', title: '請選擇性別' })
    return
  }
  // 住址：必填、≤250 字
  if (addressValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入住址' })
    return
  }
  if (addressValue.length > 250) {
    Swal.fire({ icon: 'warning', title: '住址不能超過 250 個字' })
    return
  }
  // 電話：必填、格式
  if (phoneValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入電話' })
    return
  }
  if (!phoneRule.test(phoneValue)) {
    Swal.fire({ icon: 'warning', title: '電話格式錯誤（需 09 開頭共 10 碼）' })
    return
  }
  // 信箱：必填、格式、≤50 字
  if (emailValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入電子信箱' })
    return
  }
  if (!emailRule.test(emailValue)) {
    Swal.fire({ icon: 'warning', title: '電子信箱格式錯誤' })
    return
  }
  if (emailValue.length > 50) {
    Swal.fire({ icon: 'warning', title: '電子信箱不能超過 50 個字' })
    return
  }
  // 信箱驗證碼：必填、需為 6 位數字
  if (emailCodeValue === '') {
    Swal.fire({ icon: 'warning', title: '請先按「寄送驗證碼」，並填入信箱收到的驗證碼' })
    return
  }
  if (!/^[0-9]{6}$/.test(emailCodeValue)) {
    Swal.fire({ icon: 'warning', title: '驗證碼格式錯誤（需為 6 位數字）' })
    return
  }
  // 帳號：必填、4～30 字、僅英數
  if (accountValue === '') {
    Swal.fire({ icon: 'warning', title: '請設定帳號' })
    return
  }
  if (accountValue.length < 4 || accountValue.length > 30) {
    Swal.fire({ icon: 'warning', title: '帳號長度需為 4～30 個字' })
    return
  }
  if (!accountRule.test(accountValue)) {
    Swal.fire({ icon: 'warning', title: '帳號只能使用英文字母和數字' })
    return
  }
  // 密碼：必填、8～80 字、英數+常用符號
  if (passwordValue === '') {
    Swal.fire({ icon: 'warning', title: '請設定密碼' })
    return
  }
  if (passwordValue.length < 8 || passwordValue.length > 80) {
    Swal.fire({ icon: 'warning', title: '密碼長度需為 8～80 個字' })
    return
  }
  if (!passwordRule.test(passwordValue)) {
    Swal.fire({ icon: 'warning', title: '密碼含有不允許的符號' })
    return
  }
  // 確認密碼：要跟密碼一致
  if (confirmPassword.value !== password.value) {
    Swal.fire({ icon: 'warning', title: '兩次輸入的密碼不一致' })
    return
  }

  // ===== 寵物驗證：有填才驗，整張卡空白就跳過 =====
  for (let i = 0; i < pets.value.length; i++) {
    const pet = pets.value[i]       // 拿出第 i 隻寵物
    const petNo = i + 1             // 給人看的編號（第 1 隻、第 2 隻…）

    // 判斷這張卡是不是「完全空白」（每一格都沒填）
    const isEmpty =
      pet.name === '' && pet.birthday === '' && pet.age === '' &&
      pet.gender === '' && pet.weight === '' && pet.size === '' &&
      pet.species === '' && pet.breed === '' && pet.neutered === '' &&
      pet.health === '' && pet.personality === ''

    // 完全空白 → 跳過這隻，不驗證
    if (isEmpty) {
      continue
    }

    // 有填東西 → 必填欄位（資料庫 NOT NULL）要補齊
    if (pet.name === '') {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：請輸入姓名' })
      return
    }
    if (pet.age === '') {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：請輸入年齡' })
      return
    }
    if (pet.gender === '') {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：請選擇性別' })
      return
    }
    if (pet.weight === '') {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：請輸入體重' })
      return
    }
    if (pet.neutered === '') {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：請選擇是否結紮' })
      return
    }

    // 年齡：要大於 0（Number 把文字轉成數字再比）
    if (Number(pet.age) <= 0) {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：年齡需大於 0' })
      return
    }
    // 體重：要大於 0
    if (Number(pet.weight) <= 0) {
      Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：體重需大於 0' })
      return
    }
    // 生日：有填才驗，且不能選未來（today 在上面個人資料已經定義過）
    if (pet.birthday !== '') {
      const petBirth = new Date(pet.birthday)
      if (petBirth > today) {
        Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：生日不能選未來的日期' })
        return
      }
    }
    // 體型：有選才驗，要跟體重對應（小<10、中10~25、大>25）
    if (pet.size !== '') {
      const w = Number(pet.weight)   // 體重轉成數字
      let expectedSize = ''          // 依體重算出「應該是」哪個體型
      if (w < 10) {
        expectedSize = 'small'
      } else if (w <= 25) {
        expectedSize = 'mid'
      } else {
        expectedSize = 'big'
      }
      if (pet.size !== expectedSize) {
        Swal.fire({ icon: 'warning', title: '第 ' + petNo + ' 隻寵物：體型與體重不符（小型<10、中型10~25、大型>25 公斤）' })
        return
      }
    }
  }

  // ===== 全部通過（個人資料 + 寵物）=====
  // 只送「有填的」寵物：完全空白的卡片不送給後端
  const petsToSend = []
  for (let i = 0; i < pets.value.length; i++) {
    const pet = pets.value[i]
    const isEmpty =
      pet.name === '' && pet.birthday === '' && pet.age === '' &&
      pet.gender === '' && pet.weight === '' && pet.size === '' &&
      pet.species === '' && pet.breed === '' && pet.neutered === '' &&
      pet.health === '' && pet.personality === ''
    if (!isEmpty) {
      petsToSend.push(pet)   // 有填東西才放進要送出的清單
    }
  }

  // ===== 送出註冊：POST /api/member/register =====
  try {
    // body 的 key 要對應後端 MemberRegisterDto 的欄位名稱
    await api.post('/api/member/register', {
      name: nameValue,
      birthday: birthday.value,
      idNumber: idValue,
      gender: gender.value,
      address: addressValue,
      phone: phoneValue,
      email: emailValue,
      emailCode: emailCodeValue,
      account: accountValue,
      password: passwordValue,
      pets: petsToSend
    })

    // 註冊成功：註冊不會自動登入，導去登入頁讓使用者登入
    Swal.fire({ icon: 'success', title: '註冊成功', text: '請使用新帳號登入', timer: 1500, showConfirmButton: false })
    router.push('/member/login')

  } catch (error) {
    // 註冊失敗：後端會回 HTTP 400 + { message: '此帳號已被使用' } 之類
    const msg = error.response?.data?.message || '註冊失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '註冊失敗', text: msg })
  }
}

function toMember() {
  router.push('/grooming/member')
}
</script>

<style></style>
