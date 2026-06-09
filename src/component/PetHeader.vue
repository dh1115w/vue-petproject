<template>
  <header class="site-header">
    <div class="header-inner">

      <RouterLink to="/" class="brand">PetCare</RouterLink>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">首頁</RouterLink>

        <!-- 美容選單 -->
        <div class="nav-dropdown">
          <RouterLink to="/grooming" class="nav-link">美容</RouterLink>
          <div class="dropdown-menu">
            <RouterLink to="/grooming/services" class="dropdown-item">服務項目</RouterLink>
            <RouterLink to="/grooming/staff" class="dropdown-item">美容師團隊</RouterLink>
            <RouterLink to="/grooming/booking" class="dropdown-item">線上預約</RouterLink>
            <RouterLink to="/grooming/reviews" class="dropdown-item">評價專區</RouterLink>
          </div>
        </div>

        <div class="nav-dropdown">
          <RouterLink to="/medical" class="nav-link">醫療</RouterLink>
          <div class="dropdown-menu">
            <RouterLink to="/medical/healthtracking" class="dropdown-item">健康狀態追蹤</RouterLink>
            <RouterLink to="/medical/clinicsearch" class="dropdown-item">搜尋附近動物醫院</RouterLink>
            <RouterLink to="/medical/medicalrecords" class="dropdown-item">病歷紀錄</RouterLink>
            <RouterLink to="/medical/calendarpage" class="dropdown-item">行事曆提醒</RouterLink>
            <RouterLink to="/medical/taxiservice" class="dropdown-item">寵物接送服務</RouterLink>
          </div>
        </div>

        <!-- 沒登入：顯示登入/註冊 -->
        <div class="nav-dropdown" v-if="!userStore.token">
          <RouterLink to="/member/login" class="nav-link">登入/註冊</RouterLink>
        </div>

        <!-- 已登入：顯示圓形頭像 + 名字 -->
        <div class="nav-dropdown" v-else>
          <div class="user-avatar">{{ userStore.account }}</div>
          <div class="dropdown-menu">
            <RouterLink to="/grooming/member" class="dropdown-item">會員專區</RouterLink>
            <RouterLink to="/member/updateprofile" class="dropdown-item">修改個人資料</RouterLink>
            <a href="#" class="dropdown-item" @click.prevent="handleLogout">登出</a>
          </div>
        </div>
      </nav>

    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()      // 清空 token、account、email
  router.push('/')        // 回首頁
}
</script>

<style scoped>
.site-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e6;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: #2a2522;
  text-decoration: none;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-link {
  font-size: 0.78rem;
  letter-spacing: 2px;
  color: #888882;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #2a2522;
}

.nav-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

/* 已登入的圓形頭像 */
.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #2a2522;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  text-transform: uppercase;
  overflow: hidden;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 12px;
  background-color: #ffffff;
  border: 1px solid #e8e8e6;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  min-width: 130px;
  z-index: 200;
}

/* 透明橋接區，避免滑鼠移到選單途中下拉收合 */
.dropdown-menu::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  height: 12px;
}

.nav-dropdown:hover .dropdown-menu {
  display: block;
}

/* 最右邊的下拉選單改靠右對齊，避免往右超出瀏覽器被裁切 */
.nav-dropdown:last-child .dropdown-menu {
  left: auto;
  right: 0;
  transform: none;
}

.dropdown-item {
  display: block;
  padding: 9px 18px;
  font-size: 0.78rem;
  letter-spacing: 2px;
  color: #888882;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.dropdown-item:hover,
.dropdown-item.router-link-active {
  color: #2a2522;
}
</style>
