<template>
  <div class="login-page">
    <div class="login-card">

      <div class="login-header">
        <p class="login-eyebrow">Member Portal</p>
        <h1 class="login-title">登入</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="account">帳號</label>
          <input id="account" type="text" name="account" v-model="account" placeholder="請輸入帳號" />
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input id="password" type="password" name="password" v-model="password" placeholder="請輸入密碼" />
        </div>
        <div class="login-actions">
          <button type="submit" class="btn-primary">登入</button>
          <button type="button" class="btn-secondary" @click="toMember">取消</button>
        </div>
      </form>

      <div class="login-footer">
        還沒有帳號？<RouterLink to="/member/createaccount">立即註冊</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import '@/css/member/login.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import useUserStore from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()
const account = ref('')
const password = ref('')

// 沒有後端時，先寫死一組測試帳密（之後接後端再換成 axios 驗證）
const testAccount= 'test'
const testPassword = '1234'

function handleLogin() {
  if (account.value === testAccount && password.value === testPassword) {
    // 假裝這是後端登入成功後回傳的資料
    userStore.setToken('fake-token-12345')
    userStore.setAccount(account.value)
    userStore.setEmail('test@gmail.com')

    Swal.fire({ 
      icon: 'success', 
      title: '登入成功', 
      timer: 1500, 
      showConfirmButton: false })
    router.push('/')
  } else {
    Swal.fire({ icon: 'error', title: '登入失敗', text: '帳號或密碼錯誤' })
  }
}
function toMember(){
  router.push("/member/member");
}
</script>

<style></style>
