<template>
  <div class="create-account-page">

    <div class="page-header">
      <RouterLink to="/member/member" class="back-link">← 返回會員專區</RouterLink>
    </div>

    <div class="form-container">
      <div class="form-header">
        <p class="form-eyebrow">Member Profile</p>
        <h1 class="form-title">修改個人資料</h1>
      </div>

      <form @submit.prevent="handleSave" class="form-body">

        <!-- 個人資料 -->
        <div class="section-block">
          <p class="section-label">Personal Information</p>

          <div class="form-group">
            <label for="name">姓名（必填，最多 45 字）</label>
            <input id="name" type="text" v-model="name" placeholder="請輸入姓名" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthday">生日（不可修改）</label>
              <input id="birthday" type="date" v-model="birthday" disabled />
            </div>
            <div class="form-group">
              <label for="idNumber">身分證字號（不可修改）</label>
              <input id="idNumber" type="text" v-model="idNumber" disabled />
            </div>
          </div>

          <div class="form-group">
            <label>性別（不可修改）</label>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" value="male" v-model="gender" disabled />男</label>
              <label class="radio-label"><input type="radio" value="female" v-model="gender" disabled />女</label>
            </div>
          </div>

          <div class="form-group">
            <label for="address">住址（必填，最多 250 字）</label>
            <input id="address" type="text" v-model="address" placeholder="請輸入住址" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">電話（必填，09 開頭共 10 碼）</label>
              <input id="phone" type="tel" v-model="phone" placeholder="例：0912345678" />
            </div>
            <div class="form-group">
              <label for="email">電子信箱（必填，例：name@example.com）</label>
              <input id="email" type="email" v-model="email" placeholder="請輸入電子信箱" />
            </div>
          </div>
        </div>

        <!-- 送出 -->
        <div class="form-footer">
          <button type="submit" class="btn-primary">存檔</button>
          <button type="button" class="btn-secondary" @click="toMember">取消</button>
        </div>

      </form>

      <!-- 表單最下方：小字連結，導去修改密碼頁 -->
      <div class="password-link">
        <RouterLink to="/member/updatepassword">修改密碼</RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import '@/css/member/create-account.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import useUserStore from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()
const info = userStore.memberInfo   // 會員目前的資料（登入時存進 store 的）

// 用 store 裡的現有資料當每個欄位的「初始值」，進頁面就會預先填好
const name = ref(info.name)
const birthday = ref(info.birthday)
const idNumber = ref(info.idNumber)
const gender = ref(info.gender)
const address = ref(info.address)
const phone = ref(info.phone)
const email = ref(info.email)

// ===== 存檔：先驗證可修改的欄位，全部通過才送出 =====
// 生日、身分證、性別是鎖住的(disabled)，不能改，所以不驗證
function handleSave() {
  // 規則用的正規表達式
  const phoneRule = /^09[0-9]{8}$/           // 電話：09 開頭共 10 碼
  const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // email 格式

  // 把文字欄位前後空白去掉
  const nameValue = name.value.trim()
  const addressValue = address.value.trim()
  const phoneValue = phone.value.trim()
  const emailValue = email.value.trim()

  // 姓名：必填、≤45 字
  if (nameValue === '') {
    Swal.fire({ icon: 'warning', title: '請輸入姓名' })
    return
  }
  if (nameValue.length > 45) {
    Swal.fire({ icon: 'warning', title: '姓名不能超過 45 個字' })
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

  // ===== 全部通過 =====
  // TODO：接後端送出更新
  Swal.fire({ icon: 'success', title: '資料驗證通過', timer: 1000, showConfirmButton: false })
}

function toMember() {
  router.push('/member/member')
}
</script>

<style></style>
