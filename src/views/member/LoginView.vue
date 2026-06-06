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

const router = useRouter()
const account = ref('')
const password = ref('')

function handleLogin() {
  console.log('帳號:', account.value, '密碼:', password.value)
}
function toMember(){
  router.push("/member/member");
}
</script>

<style></style>
