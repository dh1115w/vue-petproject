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
          <!-- :type 動態綁定：showPassword 為 true 顯示 text（看得到），false 顯示 password（圓點） -->
          <input id="password" :type="showPassword ? 'text' : 'password'" name="password" v-model="password" placeholder="請輸入密碼" />
          <!-- 勾選框：v-model 綁 showPassword，打勾就把開關變 true -->
          <label><input type="checkbox" v-model="showPassword" />顯示密碼</label>
        </div>
        <div class="login-actions">
          <button type="submit" class="btn-primary">登入</button>
          <button type="button" class="btn-secondary" @click="toHome">取消</button>
        </div>
      </form>

      <div class="login-footer">
        還沒有帳號？<RouterLink to="/member/createaccount">立即註冊</RouterLink>
        ｜<RouterLink to="/member/forgetpassword">忘記密碼</RouterLink>
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
import api from '@/plugins/axios.js'   // 共用 axios：會自動帶 token、指向後端網址

const router = useRouter()
const userStore = useUserStore()
const account = ref('')
const password = ref('')
// 密碼是否顯示成明碼：false=圓點（預設）、true=看得到文字
const showPassword = ref(false)

// async：因為裡面要「等」後端回應（await），函式前面要加 async
async function handleLogin() {
  // ===== 前端驗證：通過後才比對帳密 =====
  // 規則用的正規表達式：帳號只能英數；密碼只能英數加常用符號
  const accountRule = /^[A-Za-z0-9]+$/
  const passwordRule = /^[A-Za-z0-9!@#$%^&*()_-]+$/

  // 把前後空白去掉，避免使用者只打空白也算有填
  const accountValue = account.value.trim()
  const passwordValue = password.value.trim()

  // 規則 1：帳號是空白
  if (accountValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入帳號' })
    return // 直接結束，不再往下跑
  }
  // 規則 2：帳號長度需 4～30 字
  if (accountValue.length < 4 || accountValue.length > 30) {
    Swal.fire({ icon: 'warning', title: '帳號長度需為 4～30 個字' })
    return
  }
  // 規則 3：帳號只能英文字母和數字
  if (!accountRule.test(accountValue)) {
    Swal.fire({ icon: 'warning', title: '帳號只能使用英文字母和數字' })
    return
  }
  // 規則 4：密碼是空白
  if (passwordValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入密碼' })
    return
  }
  // 規則 5：密碼長度需 8～80 字
  if (passwordValue.length < 8 || passwordValue.length > 80) {
    Swal.fire({ icon: 'warning', title: '密碼長度需為 8～80 個字' })
    return
  }
  // 規則 6：密碼只能英數與 ! @ # $ % ^ & * ( ) _ -
  if (!passwordRule.test(passwordValue)) {
    Swal.fire({ icon: 'warning', title: '密碼含有不允許的符號' })
    return
  }

  // ===== 通過驗證，呼叫後端登入 API =====
  // 用去過空白的值送出，跟上面驗證的標準一致
  try {
    // 對後端 POST /api/member/login，body 是 { account, password }
    // await：等後端回應回來，才往下跑
    const response = await api.post('/api/member/login', {
      account: accountValue,
      password: passwordValue
    })

    // 後端登入成功回傳：{ token, memberInfo, pets }
    // 後端欄位名稱已和前端一致，直接塞進 store，不用轉換
    userStore.setToken(response.data.token)
    userStore.setMemberInfo(response.data.memberInfo)
    userStore.setPets(response.data.pets)

    // 預設選第一隻寵物（這位會員有養寵物才設）
    if (response.data.pets && response.data.pets.length > 0) {
      userStore.setSelectPetId(response.data.pets[0].id)
    }

    Swal.fire({
      icon: 'success',
      title: '登入成功',
      timer: 1000,
      showConfirmButton: false })
    router.push('/')

  } catch (error) {
    // 登入失敗：後端會回 HTTP 400 + { message: '帳號或密碼錯誤' }
    // 有後端訊息就顯示後端的，沒有（例如連不到後端）就顯示預設句
    const msg = error.response?.data?.message || '帳號或密碼錯誤，或無法連線後端'
    Swal.fire({ icon: 'error', title: '登入失敗', text: msg })
  }
}
function toHome(){
  router.push("/");
}
</script>

<style></style>
