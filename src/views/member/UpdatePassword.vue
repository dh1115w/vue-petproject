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
            <label>帳號或電子信箱</label>
            <input type="text" v-model="accountOrEmail" placeholder="請輸入註冊時的帳號或 email" />
          </div>
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

const router = useRouter()

// 使用者輸入的帳號或 email
const accountOrEmail = ref('')

// 新密碼、確認新密碼
const newPassword = ref('')
const confirmPassword = ref('')

// 舊密碼（修改密碼前要先確認是本人）
const oldPassword = ref('')

// 按「確認修改」會執行這個（現在改成一頁就完成，不再寄驗證碼）
function updatePassword() {
  // 防呆 1：帳號或 email 要填
  if (accountOrEmail.value === '') {
    Swal.fire({ icon: 'warning', title: '請先輸入帳號或電子信箱' })
    return
  }
  // 防呆 2：舊密碼要填
  if (oldPassword.value === '') {
    Swal.fire({ icon: 'warning', title: '請輸入舊密碼' })
    return
  }
  // 防呆 3：新密碼與確認密碼都要填
  if (newPassword.value === '' || confirmPassword.value === '') {
    Swal.fire({ icon: 'warning', title: '請填寫新密碼與確認密碼' })
    return
  }
  // 防呆 4：新密碼長度需 8～80 字（跟註冊頁同規則）
  if (newPassword.value.length < 8 || newPassword.value.length > 80) {
    Swal.fire({ icon: 'warning', title: '密碼長度需為 8～80 個字' })
    return
  }
  // 防呆 5：新密碼只能英數與 ! @ # $ % ^ & * ( ) _ -
  if (!/^[A-Za-z0-9!@#$%^&*()_-]+$/.test(newPassword.value)) {
    Swal.fire({ icon: 'warning', title: '密碼含有不允許的符號' })
    return
  }
  // 防呆 6：新密碼兩次要一致
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({ icon: 'error', title: '兩次輸入的密碼不一致' })
    return
  }

  // ===== 之後接後端時，把這段換成 axios 請後端更新密碼 =====
  // 例如：axios.post('/api/member/update-password', {
  //   accountOrEmail: accountOrEmail.value,
  //   oldPassword: oldPassword.value,
  //   newPassword: newPassword.value
  // })
  // 後端負責：先比對舊密碼是否正確，再把密碼換成新的
  // 現在沒有後端，先假裝成功
  Swal.fire({
    icon: 'success',
    title: '密碼修改成功',
    timer: 1500,
    showConfirmButton: false
  })
  router.push('/grooming/member')
}

// 返回會員專區（返回／取消都用這個）
function toMember() {
  router.push('/grooming/member')
}
</script>

<style></style>
