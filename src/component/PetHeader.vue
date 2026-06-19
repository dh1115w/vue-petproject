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
            <RouterLink to="/grooming/appointments" class="dropdown-item">預約紀錄</RouterLink>
            <RouterLink to="/grooming/reviews" class="dropdown-item">評價專區</RouterLink>
            <RouterLink to="/grooming/StaffDashboard" class="dropdown-item">員工後台</RouterLink>
          </div>
        </div>
        <!-- 醫療選單 -->
        <div class="nav-dropdown">
          <RouterLink to="/medical" class="nav-link">醫療</RouterLink>
          <div class="dropdown-menu">
            <RouterLink to="/medical/healthtracking" class="dropdown-item"
              >健康狀態追蹤</RouterLink
            >
            <RouterLink to="/medical/medicalrecords" class="dropdown-item"
              >病歷紀錄</RouterLink
            >
            <RouterLink to="/medical/calendarpage" class="dropdown-item"
              >行事曆提醒</RouterLink
            >
            <RouterLink to="/medical/clinicsearch" class="dropdown-item"
              >附近診所搜尋</RouterLink
            >
            <RouterLink to="/medical/taxiservice" class="dropdown-item"
              >寵物接送服務</RouterLink
            >
          </div>
        </div>

        <!-- 沒登入：顯示登入/註冊 -->
        <div class="nav-dropdown" v-if="!userStore.token">
          <RouterLink to="/member/login" class="nav-link">登入/註冊</RouterLink>
        </div>

        <!-- 已登入：顯示圓形頭像 + 名字 -->
        <div class="nav-dropdown" v-else>
          <!-- slice(0, 4)：只取帳號前四個字，避免太長超出圓形頭像 -->
          <div class="user-avatar">{{ userStore.memberInfo.account.slice(0, 4) }}</div>
          <div class="dropdown-menu">
            <RouterLink to="/grooming/member" class="dropdown-item"
              >會員專區</RouterLink
            >
            <RouterLink to="/member/updateprofile" class="dropdown-item"
              >修改個人資料</RouterLink
            >
            <a href="#" class="dropdown-item" @click.prevent="handleLogout"
              >登出</a
            >

            <div class="dropdown-divider"></div>

            <!-- 切換預設寵物：點哪隻，哪隻就變成全站的預設寵物 -->
            <p class="dropdown-title">切換預設寵物</p>
            <a
              v-for="pet in userStore.pets"
              :key="pet.id"
              href="#"
              class="dropdown-item"
              @click.prevent="choosePet(pet.id)"
            >
              {{ pet.name }}
              <!-- 目前選到的那隻，後面打勾 -->
              <span v-if="pet.id === userStore.selectPetId">✓</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import useUserStore from "@/stores/user.js";
import Swal from "sweetalert2";
import api from "@/plugins/axios.js"; // 共用 axios：會自動帶 token

const router = useRouter();
const userStore = useUserStore();

// 登出：先呼叫後端把這次登入標記成已登出，再清掉前端 store
async function handleLogout() {
  try {
    // 先打後端 /api/member/secure/logout（token 由 axios 自動帶上）
    // 後端才會更新這次登入紀錄的 logoutTime 和狀態
    await api.post("/api/member/secure/logout");
  } catch (error) {
    // 後端登出失敗也提示一下，但仍會往下清掉前端登入狀態
    const msg = error.response?.data?.message || "登出時發生錯誤";
    Swal.fire({ icon: "error", title: "登出失敗", text: msg });
  }
  userStore.logout(); // 清空 token及個人資訊
  router.push("/"); // 回首頁
}

// 切換「預設寵物」：把點到的那隻寵物 id 存進 store
// 存進去之後，整個專案（美容、醫療…）只要讀 userStore.selectPetId 就知道是哪一隻
function choosePet(id) {
  userStore.setSelectPetId(id);
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #2a2522;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
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
  content: "";
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

/* 「切換預設寵物」小標題 */
.dropdown-title {
  padding: 6px 18px;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: #b0b0aa;
}

/* 寵物清單和下面選單之間的分隔線 */
.dropdown-divider {
  height: 1px;
  background-color: #e8e8e6;
  margin: 6px 0;
}
</style>
