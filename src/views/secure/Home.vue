<template>
  <div class="home-page">

    <!-- Hero Section：左邊文字、右邊放寵物照片 -->
    <section class="hero">
      <div class="hero-text">
        <p class="hero-eyebrow">Professional Pet Care Platform</p>
        <h1 class="hero-heading">專為您的毛孩<br>打造的一站式服務</h1>
        <p class="hero-desc">從日常美容到專業醫療，我們用心呵護每一位寵物家人。</p>
        <RouterLink v-if="!userStore.token" to="/member/login" class="hero-cta">立即開始</RouterLink>
      </div>

      <!-- Hero 影片：自動播放並無限循環 -->
      <!-- 當 videoError 為 false 時顯示影片，若發生錯誤則觸發 @error 將其設為 true -->
      <video 
        v-if="!videoError"
        class="hero-photo" 
        autoplay 
        muted 
        loop 
        playsinline
        @error="videoError = true"
      >
    <source src="@/images/home-video.mp4" type="video/mp4" />
        您的瀏覽器不支援 HTML5 影片播放
      </video>
      <!-- 當影片無法讀取時，顯示指定的備用圖片 -->
      <img v-else src="@/images/home-image.png" alt="Hero Fallback" class="hero-photo" />
    </section>

    <!-- Services Section -->
    <section class="services">
      <div class="services-header">
        <p class="section-label">Our Services</p>
        <h2 class="services-title">我們的服務項目</h2>
      </div>

      <div class="service-grid">
        <a href="#" class="service-card" @click.prevent="goWithLogin('/grooming/member')">
          <span class="card-label">Membership</span>
          <h3 class="card-title">會員專區</h3>
          <p class="card-desc">管理您的帳號與所有寵物資料</p>
          <span class="card-arrow">了解更多   →</span>
        </a>

       

        <a href="#" class="service-card" @click.prevent>
          <span class="card-label">Grooming</span>
          <h3 class="card-title">寵物美容</h3>
          <p class="card-desc">專業造型師為您的毛孩打造完美造型</p>
          <span class="card-arrow">了解更多   →</span>
        </a>

        <a href="#" class="service-card" @click.prevent>
          <span class="card-label">Medical</span>
          <h3 class="card-title">寵物醫療</h3>
          <p class="card-desc">專業獸醫師提供完整健康照護</p>
          <span class="card-arrow">了解更多   →</span>
        </a>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import useUserStore from '@/stores/user.js'
import '@/css/home.css'

// 用於追蹤影片是否發生錯誤
const videoError = ref(false)

const router = useRouter()
const userStore = useUserStore()

// path = 登入後要前往的路徑（由各卡片傳入，所以可共用）
function goWithLogin(path) {
  if (userStore.token) {
    // 已登入：正常前往
    router.push(path)
  } else {
    // 沒登入：跳出警告
    Swal.fire({
      icon: 'warning',
      title: '請先登入會員',
      showCancelButton: true,
      confirmButtonText: '登入',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/member/login')   // 按「登入」→ 登入頁
      } else {
        router.push('/')               // 按「取消」→ 首頁
      }
    })
  }
}
</script>

<style></style>
