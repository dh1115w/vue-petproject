<template>
  <div class="create-account-page">

    <div class="page-header">
      <RouterLink to="/member/member" class="back-link">← 返回會員專區</RouterLink>
    </div>

    <div class="form-container">
      <div class="form-header">
        <p class="form-eyebrow">Member Registration</p>
        <h1 class="form-title">創建帳號</h1>
      </div>

      <form @submit.prevent class="form-body">

        <!-- 個人資料 -->
        <div class="section-block">
          <p class="section-label">Personal Information</p>

          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="name" placeholder="請輸入姓名" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>生日</label>
              <input type="date" v-model="birthday" />
            </div>
            <div class="form-group">
              <label>身分證字號</label>
              <input type="text" v-model="idNumber" placeholder="請輸入身分證字號" />
            </div>
          </div>

          <div class="form-group">
            <label>性別</label>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" value="男" v-model="gender" />男</label>
              <label class="radio-label"><input type="radio" value="女" v-model="gender" />女</label>
            </div>
          </div>

          <div class="form-group">
            <label>住址</label>
            <input type="text" v-model="address" placeholder="請輸入住址" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>電話</label>
              <input type="tel" v-model="phone" placeholder="請輸入電話" />
            </div>
            <div class="form-group">
              <label>電子信箱</label>
              <input type="email" v-model="email" placeholder="請輸入電子信箱" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>帳號</label>
              <input type="text" v-model="account" placeholder="請設定帳號" />
            </div>
            <div class="form-group">
              <label>密碼</label>
              <input type="password" v-model="password" placeholder="請設定密碼" />
            </div>
          </div>

          <div class="form-group">
            <label>確認密碼</label>
            <input type="password" v-model="confirmPassword" placeholder="請再次輸入密碼" />
            <p v-if="confirmPassword && password !== confirmPassword" class="field-error">
              兩次輸入的密碼不一致
            </p>
          </div>
        </div>

        <!-- 寵物資料 -->
        <div class="section-block">
          <p class="section-label">Pet Information</p>

          <div v-for="(pet, index) in pets" :key="index" class="pet-card">
            <div class="pet-card-header">
              <span class="pet-card-label">Pet {{ index + 1 }}</span>
              <button type="button" class="btn-remove" @click="removePet(index)">刪除</button>
            </div>
            <div class="pet-card-body">
              <div class="form-group">
                <label>姓名</label>
                <input type="text" v-model="pet.name" placeholder="寵物名字" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>生日</label>
                  <input type="date" v-model="pet.birthday" />
                </div>
                <div class="form-group">
                  <label>年齡</label>
                  <input type="number" v-model="pet.age" placeholder="歲" />
                </div>
              </div>

              <div class="form-group">
                <label>性別</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" :name="'petGender' + index" value="male" v-model="pet.gender" />公</label>
                  <label class="radio-label"><input type="radio" :name="'petGender' + index" value="female" v-model="pet.gender" />母</label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>體重 (kg)</label>
                  <input type="number" v-model="pet.weight" placeholder="kg" />
                </div>
                <div class="form-group">
                  <label>物種</label>
                  <input type="text" v-model="pet.species" placeholder="例：狗、貓" />
                </div>
              </div>

              <div class="form-group">
                <label>品種</label>
                <input type="text" v-model="pet.breed" placeholder="請輸入品種" />
              </div>

              <div class="form-group">
                <label>體型</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" :name="'petSize' + index" value="big" v-model="pet.size" />大</label>
                  <label class="radio-label"><input type="radio" :name="'petSize' + index" value="mid" v-model="pet.size" />中</label>
                  <label class="radio-label"><input type="radio" :name="'petSize' + index" value="small" v-model="pet.size" />小</label>
                </div>
              </div>

              <div class="form-group">
                <label>是否結紮</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" :name="'petNeutered' + index" value="isNeutered" v-model="pet.neutered" />是</label>
                  <label class="radio-label"><input type="radio" :name="'petNeutered' + index" value="unNeutered" v-model="pet.neutered" />否</label>
                </div>
              </div>

              <div class="form-group">
                <label>健康狀況</label>
                <input type="text" v-model="pet.health" placeholder="請描述健康狀況" />
              </div>

              <div class="form-group">
                <label>個性描述</label>
                <textarea v-model="pet.personality" placeholder="請描述寵物個性"></textarea>
              </div>
            </div>
          </div>

          <button type="button" class="btn-add-pet" @click="addPet" :disabled="pets.length >= 5">
            + 新增寵物（最多 5 隻）
          </button>
        </div>

        <!-- 送出 -->
        <div class="form-footer">
          <button type="submit" class="btn-primary">創建帳號</button>
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
const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const pets = ref([
  { name: '', birthday: '', age: '', gender: '', weight: '', size: '', species: '', breed: '', neutered: '', health: '', personality: '' }
])

function addPet() {
  if (pets.value.length >= 5) return
  pets.value.push({ name: '', birthday: '', age: '', gender: '', weight: '', size: '', species: '', breed: '', neutered: '', health: '', personality: '' })
}

function removePet(index) {
  pets.value.splice(index, 1)
}

function toMember() {
  router.push('/member/member')
}
</script>

<style></style>
