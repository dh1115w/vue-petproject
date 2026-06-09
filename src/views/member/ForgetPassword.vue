<template>
  <div class="create-account-page">

    <div class="page-header">
      <RouterLink to="/member/login" class="back-link">← 返回登入</RouterLink>
    </div>

    <div class="form-container">
      <div class="form-header">
        <p class="form-eyebrow">Reset Password</p>
        <h1 class="form-title">忘記密碼</h1>
      </div>

      <!-- ===== 第一步：輸入帳號或 email ===== -->
      <!-- step 等於 1 的時候才顯示這一段 -->
      <div v-if="step === 1" class="form-body">
        <div class="section-block">
          <div class="form-group">
            <label>帳號或電子信箱</label>
            <input type="text" v-model="accountOrEmail" placeholder="請輸入註冊時的帳號或 email" />
          </div>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-primary" @click="sendCode">寄送驗證碼</button>
          <button type="button" class="btn-secondary" @click="toLogin">取消</button>
        </div>
      </div>

      <!-- 第二步、第三步之後再加 -->

    </div>

  </div>
</template>

<script setup>
import '@/css/member/create-account.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

// 目前在第幾步：1=輸入帳號/email、2=輸入驗證碼、3=設定新密碼
const step = ref(1)

// 使用者輸入的帳號或 email
const accountOrEmail = ref('')

// 第一步：按「寄送驗證碼」會執行這個
function sendCode() {
  // 防呆：沒填就不要送
  if (accountOrEmail.value === '') {
    Swal.fire({ icon: 'warning', title: '請先輸入帳號或電子信箱' })
    return
  }

  // ===== 之後接後端時，把這段換成 axios 呼叫後端寄驗證碼 =====
  // 例如：axios.post('/api/member/send-reset-code', { accountOrEmail: accountOrEmail.value })
  // 後端負責：找出這個帳號/email、產生驗證碼、寄到信箱
  // 現在沒有後端，先假裝寄成功，直接跳到第二步
  Swal.fire({
    icon: 'success',
    title: '驗證碼已寄出',
    text: '請到信箱查收（目前是模擬，尚未真的寄信）',
    timer: 1500,
    showConfirmButton: false
  })
  step.value = 2
}

function toLogin() {
  router.push('/member/login')
}
</script>

<style></style>
