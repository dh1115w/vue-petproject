<template>
  <div class="member-view-page">

    <div class="page-header">
      <RouterLink to="/" class="back-link">← 返回首頁</RouterLink>
    </div>

    <div class="member-card">
      <div class="member-card-header">
        <p class="member-eyebrow">Account</p>
        <h1 class="member-title">會員專區</h1>
      </div>

      <nav class="member-nav">
        <RouterLink to="/member/login" class="nav-item">
          <span class="nav-label">登入會員</span>
          <span class="nav-arrow">→</span>
        </RouterLink>
        <RouterLink to="/member/createaccount" class="nav-item">
          <span class="nav-label">註冊帳號</span>
          <span class="nav-arrow">→</span>
        </RouterLink>
        <RouterLink to="/member/updateprofile" class="nav-item">
          <span class="nav-label">修改個人資料</span>
          <span class="nav-arrow">→</span>
        </RouterLink>
      </nav>
    </div>

  </div>
</template>

<script setup>
import '@/css/member/member-view.css'
</script>

<style></style>
