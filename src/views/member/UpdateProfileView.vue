<template>
  <div class="create-account-page">

    <div class="page-header">
      <RouterLink to="/grooming/member" class="back-link">← 返回會員專區</RouterLink>
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
import api from '@/plugins/axios.js'   // 共用 axios：會自動帶 token、指向後端網址

const router = useRouter()
const userStore = useUserStore()
const info = userStore.memberInfo   // 會員目前的資料（登入時存進 store 的）

// 身分證遮罩：只保留尾數 4 碼，前面用 * 蓋掉（例：A123456789 → ******6789）
function maskId(id) {
  if (!id) return ''                        // 沒有值就回空字串，避免出錯
  if (id.length <= 4) return id             // 太短就不遮，原樣顯示
  const last4 = id.slice(-4)                // 取最後 4 碼（負數從尾巴算）
  const stars = '*'.repeat(id.length - 4)   // 前面要幾個 *：總長度減掉 4
  return stars + last4
}

// 用 store 裡的現有資料當每個欄位的「初始值」，進頁面就會預先填好
const name = ref(info.name)
const birthday = ref(info.birthday)
// 身分證顯示遮罩後的版本（這欄不可改、也不會送後端，所以放遮罩值沒問題）
const idNumber = ref(maskId(info.idNumber))
const gender = ref(info.gender)
const address = ref(info.address)
const phone = ref(info.phone)
const email = ref(info.email)

// ===== 存檔：先驗證可修改的欄位，全部通過才送出 =====
// 生日、身分證、性別是鎖住的(disabled)，不能改，所以不驗證
// async：裡面要 await 等後端回應
async function handleSave() {
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

  // ===== 全部通過，送出更新 =====
  try {
    // 對後端 PUT /api/member/secure/updatemember
    // 只送可修改的 4 個欄位（對應後端 MemberUpdateDto），其餘後端不收
    const response = await api.put('/api/member/secure/updatemember', {
      name: nameValue,
      address: addressValue,
      phone: phoneValue,
      email: emailValue
    })

    // 後端回傳更新後的會員資料 → 塞回 store，會員中心才會立刻顯示新資料
    userStore.setMemberInfo(response.data)

    Swal.fire({ icon: 'success', title: '更新成功', timer: 1000, showConfirmButton: false })
    router.push('/grooming/member')   // 回會員中心看更新後的資料

  } catch (error) {
    // email / phone 撞到別人、或驗證不過時，後端回 HTTP 400 + { message: '...' }
    const msg = error.response?.data?.message || '更新失敗，請稍後再試'
    Swal.fire({ icon: 'error', title: '更新失敗', text: msg })
  }
}

function toMember() {
  router.push('/')
}
</script>

<style></style>
