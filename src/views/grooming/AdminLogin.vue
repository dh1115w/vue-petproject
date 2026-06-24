<template>
  <div>
    <NavBar />

    <main class="container page-content">
      <header class="page-header">
        <h2 class="section-title">管理員登入</h2>
        <p class="section-subtitle">後台管理系統僅限管理員使用</p>
      </header>

      <section class="login-form-section card">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>帳號</label>
            <input v-model="account" type="text" required placeholder="請輸入管理員帳號" />
          </div>

          <div class="form-group">
            <label>密碼</label>
            <input v-model="password" type="password" required placeholder="請輸入密碼" />
          </div>

          <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>

          <div style="text-align: right;">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '登入中...' : '登入' }}
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<script>
import NavBar from './NavBar.vue'
import adminAxios from '@/plugins/grooming/adminAxios.js'
import useAdminStore from '@/stores/grooming/admin.js'

export default {
  name: 'AdminLoginPage',
  components: { NavBar },
  data() {
    return {
      account: '',
      password: '',
      errorMessage: '',
      isLoading: false
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = '';
      this.isLoading = true;
      try {
        const response = await adminAxios.post('/api/admin/login', {
          account: this.account,
          password: this.password
        });
        const adminStore = useAdminStore();
        adminStore.setToken(response.data.token);
        adminStore.setAdminInfo(response.data.adminInfo);
        // 登入成功後，導回原本想去的頁面（如果有），沒有就導去後台首頁
        const redirectPath = this.$route.query.redirect || '/grooming/StaffDashboard';
        this.$router.push(redirectPath);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || '帳號或密碼錯誤';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
@import '@/css/grooming/index.css';

.login-form-section {
  max-width: 420px;
  margin: 0 auto;
  padding: 30px;
}

.login-error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 10px;
}
</style>
