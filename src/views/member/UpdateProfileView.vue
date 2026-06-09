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

      <form @submit.prevent class="form-body">

        <!-- 個人資料 -->
        <div class="section-block">
          <p class="section-label">Personal Information</p>

          <div class="form-group">
            <label for="name">姓名</label>
            <input id="name" type="text" v-model="name" placeholder="請輸入姓名" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthday">生日</label>
              <input id="birthday" type="date" v-model="birthday" disabled />
            </div>
            <div class="form-group">
              <label for="idNumber">身分證字號</label>
              <input id="idNumber" type="text" v-model="idNumber" disabled />
            </div>
          </div>

          <div class="form-group">
            <label>性別</label>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" value="男" v-model="gender" disabled />男</label>
              <label class="radio-label"><input type="radio" value="女" v-model="gender" disabled />女</label>
            </div>
          </div>

          <div class="form-group">
            <label for="address">住址</label>
            <input id="address" type="text" v-model="address" placeholder="請輸入住址" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">電話</label>
              <input id="phone" type="tel" v-model="phone" placeholder="請輸入電話" />
            </div>
            <div class="form-group">
              <label for="email">電子信箱</label>
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
    </div>

  </div>
</template>

<script setup>
import '@/css/member/create-account.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const birthday = ref('')
const idNumber = ref('')
const gender = ref('')
const address = ref('')
const phone = ref('')
const email = ref('')

function toMember() {
  router.push('/member/member')
}
</script>

<style></style>
