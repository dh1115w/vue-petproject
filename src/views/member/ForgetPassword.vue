<template>
  <div class="fp-page">

    <div class="fp-header-bar">
      <RouterLink to="/member/login" class="fp-back-link">← 返回登入</RouterLink>
    </div>

    <div class="fp-card">
      <div class="fp-card-header">
        <p class="fp-eyebrow">Reset Password</p>
        <h1 class="fp-title">忘記密碼</h1>
      </div>

      <!-- ===== 第一步：輸入帳號或 email ===== -->
      <!-- step 等於 1 的時候才顯示這一段 -->
      <div v-if="step === 1" class="fp-body">
        <div class="fp-section">
          <div class="fp-group">
            <label>帳號或電子信箱</label>
            <input type="text" v-model="accountOrEmail" placeholder="請輸入註冊時的帳號或 email" />
          </div>
        </div>

        <div class="fp-footer">
          <button type="button" class="fp-btn-primary" @click="sendCode">寄送驗證碼</button>
          <button type="button" class="fp-btn-secondary" @click="toLogin">取消</button>
        </div>
      </div>

      <!-- ===== 第二步：輸入驗證碼 ===== -->
      <!-- step 等於 2 的時候才顯示這一段 -->
      <div v-if="step === 2" class="fp-body">
        <div class="fp-section">
          <div class="fp-group">
            <label>驗證碼</label>
            <input type="text" v-model="inputCode" placeholder="請輸入信箱收到的 6 位數驗證碼" />
          </div>
        </div>

        <div class="fp-footer">
          <button type="button" class="fp-btn-primary" @click="verifyCode">驗證</button>
          <button type="button" class="fp-btn-secondary" @click="toLogin">取消</button>
        </div>
      </div>

      <!-- ===== 第三步：設定新密碼 ===== -->
      <!-- step 等於 3 的時候才顯示這一段 -->
      <div v-if="step === 3" class="fp-body">
        <div class="fp-section">
          <div class="fp-group">
            <label>新密碼</label>
            <input type="password" v-model="newPassword" placeholder="請輸入新密碼" />
          </div>
          <div class="fp-group">
            <label>確認新密碼</label>
            <input type="password" v-model="confirmPassword" placeholder="請再次輸入新密碼" />
            <!-- 兩次不一致時才顯示這行提示 -->
            <p v-if="confirmPassword && newPassword !== confirmPassword" class="fp-error">
              兩次輸入的密碼不一致
            </p>
          </div>
        </div>

        <div class="fp-footer">
          <button type="button" class="fp-btn-primary" @click="resetPassword">確認修改</button>
          <button type="button" class="fp-btn-secondary" @click="toLogin">取消</button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import '@/css/member/forget-password.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '@/plugins/axios.js'   // 共用 axios：會自動帶 token、指向後端網址

const router = useRouter()

// 目前在第幾步：1=輸入帳號/email、2=輸入驗證碼、3=設定新密碼
const step = ref(1)

// 使用者輸入的帳號或 email
const accountOrEmail = ref('')

// 使用者在第二步輸入的驗證碼
const inputCode = ref('')

// 第三步：新密碼、確認新密碼
const newPassword = ref('')
const confirmPassword = ref('')

// 第一步：按「寄送驗證碼」會執行這個
// async：裡面要 await 等後端回應
async function sendCode() {
  // 防呆：沒填就不要送
  if (accountOrEmail.value === '') {
    Swal.fire({ icon: 'warning', title: '請先輸入帳號或電子信箱' })
    return
  }

  // 格式驗證：要嘛是合法帳號(4～30 字英數)，要嘛是 email 格式，兩者都不是才擋
  const value = accountOrEmail.value.trim()
  const isAccount = /^[A-Za-z0-9]{4,30}$/.test(value)        // 帳號：4～30 字英數
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)   // email 格式
  if (!isAccount && !isEmail) {
    Swal.fire({ icon: 'warning', title: '請輸入正確的帳號（4～30 字英數）或電子信箱' })
    return
  }

  // ===== 呼叫後端：找出這位會員、產生驗證碼、寄到他的 email =====
  try {
    // 後端 POST /api/member/send-reset-code，body 只要 { accountOrEmail }
    await api.post('/api/member/send-reset-code', { accountOrEmail: value })

    Swal.fire({ icon: 'success', title: '驗證碼已寄出', text: '請至信箱查看 6 位數驗證碼' })
    step.value = 2   // 進到第二步：輸入驗證碼

  } catch (error) {
    // 查無帳號/email、或寄信失敗時，後端回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '寄送失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '寄送失敗', text: msg })
  }
}

// 第二步：按「驗證」會執行這個
// async：裡面要 await 等後端回應
async function verifyCode() {
  // 防呆：沒填就不要驗
  if (inputCode.value === '') {
    Swal.fire({ icon: 'warning', title: '請輸入驗證碼' })
    return
  }

  // 格式驗證：驗證碼必須是 6 位純數字
  if (!/^[0-9]{6}$/.test(inputCode.value.trim())) {
    Swal.fire({ icon: 'warning', title: '驗證碼為 6 位數字' })
    return
  }

  // ===== 呼叫後端比對驗證碼（要連同帳號/email 一起送，後端才知道是比對誰的碼）=====
  try {
    // 後端 POST /api/member/verify-reset-code，body 是 { accountOrEmail, code }
    await api.post('/api/member/verify-reset-code', {
      accountOrEmail: accountOrEmail.value.trim(),
      code: inputCode.value.trim()
    })

    step.value = 3   // 驗證碼正確 → 進到第三步：設定新密碼

  } catch (error) {
    // 碼錯/過期/不符時，後端回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '驗證碼錯誤，請再確認一次'
    Swal.fire({ icon: 'error', title: '驗證失敗', text: msg })
  }
}

// 第三步：按「確認修改」會執行這個
// async：裡面要 await 等後端回應
async function resetPassword() {
  // 防呆 1：兩個欄位都要填
  if (newPassword.value === '' || confirmPassword.value === '') {
    Swal.fire({ icon: 'warning', title: '請填寫新密碼與確認密碼' })
    return
  }
  // 防呆 2：密碼長度需 8～80 字（跟註冊頁同規則）
  if (newPassword.value.length < 8 || newPassword.value.length > 80) {
    Swal.fire({ icon: 'warning', title: '密碼長度需為 8～80 個字' })
    return
  }
  // 防呆 3：密碼只能英數與 ! @ # $ % ^ & * ( ) _ -
  if (!/^[A-Za-z0-9!@#$%^&*()_-]+$/.test(newPassword.value)) {
    Swal.fire({ icon: 'warning', title: '密碼含有不允許的符號' })
    return
  }
  // 防呆 4：兩次要一致
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({ icon: 'error', title: '兩次輸入的密碼不一致' })
    return
  }

  // ===== 呼叫後端更新密碼（後端會再驗一次碼，確認沒過期、是本人）=====
  try {
    // 後端 POST /api/member/reset-password，body 是 { accountOrEmail, code, newPassword }
    await api.post('/api/member/reset-password', {
      accountOrEmail: accountOrEmail.value.trim(),
      code: inputCode.value.trim(),
      newPassword: newPassword.value
    })

    Swal.fire({
      icon: 'success',
      title: '密碼修改成功',
      text: '請用新密碼重新登入',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/member/login')   // 回登入頁

  } catch (error) {
    // 碼錯/過期、新密碼格式錯、查無會員時，後端回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '密碼重設失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '重設失敗', text: msg })
  }
}

function toLogin() {
  router.push('/member/login')
}
</script>

<style></style>
