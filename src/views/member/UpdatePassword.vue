<template>
  <div class="fp-page">

    <div class="fp-header-bar">
      <RouterLink to="/grooming/member" class="fp-back-link">← 返回會員專區</RouterLink>
    </div>

    <div class="fp-card">
      <div class="fp-card-header">
        <p class="fp-eyebrow">Update Password</p>
        <h1 class="fp-title">修改密碼</h1>
      </div>

      <!-- ===== 修改密碼表單 ===== -->
      <div class="fp-body">
        <div class="fp-section">
          <div class="fp-group">
            <label>舊密碼</label>
            <input type="password" v-model="oldPassword" placeholder="請輸入目前的密碼" />
          </div>
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
          <button type="button" class="fp-btn-primary" @click="updatePassword">確認修改</button>
          <button type="button" class="fp-btn-secondary" @click="toMember">取消</button>
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

// 新密碼、確認新密碼
const newPassword = ref('')
const confirmPassword = ref('')

// 舊密碼（修改密碼前要先確認是本人）
const oldPassword = ref('')

// 按「確認修改」會執行這個
// async：裡面要 await 等後端回應
async function updatePassword() {
  // 防呆 1：舊密碼要填
  if (oldPassword.value === '') {
    Swal.fire({ icon: 'warning', title: '請輸入舊密碼' })
    return
  }
  // 防呆 2：新密碼與確認密碼都要填
  if (newPassword.value === '' || confirmPassword.value === '') {
    Swal.fire({ icon: 'warning', title: '請填寫新密碼與確認密碼' })
    return
  }
  // 防呆 3：新密碼長度需 8～80 字（跟註冊頁同規則）
  if (newPassword.value.length < 8 || newPassword.value.length > 80) {
    Swal.fire({ icon: 'warning', title: '密碼長度需為 8～80 個字' })
    return
  }
  // 防呆 4：新密碼只能英數與 ! @ # $ % ^ & * ( ) _ -
  if (!/^[A-Za-z0-9!@#$%^&*()_-]+$/.test(newPassword.value)) {
    Swal.fire({ icon: 'warning', title: '密碼含有不允許的符號' })
    return
  }
  // 防呆 5：新密碼兩次要一致
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({ icon: 'error', title: '兩次輸入的密碼不一致' })
    return
  }

  // ===== 送出：POST /api/member/secure/update-password =====
  try {
    // 只送 oldPassword + newPassword；身分由 token 決定（axios 自動帶），不用送帳號/email
    await api.post('/api/member/secure/update-password', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })

    Swal.fire({ icon: 'success', title: '密碼修改成功', timer: 1500, showConfirmButton: false })
    router.push('/grooming/member')

  } catch (error) {
    // 舊密碼錯、新密碼與舊相同、格式不符時，後端回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '修改失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '修改失敗', text: msg })
  }
}

// 返回會員專區（返回／取消都用這個）
function toMember() {
  router.push('/grooming/member')
}
</script>

<style></style>
