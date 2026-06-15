<template>
  <!-- Hero Section：全螢幕滿版影片背景 -->
  <section class="hero">
    <!-- 底層背景：當 videoError 為 false 時，自動、靜音、無限循環播放影片 -->
    <div class="hero-bg">
      <video
        v-if="!videoError"
        class="hero-video"
        autoplay
        muted
        loop
        playsinline
        @error="videoError = true"
      >
        <source src="/video/home.mp4" type="video/mp4" />
        您的瀏覽器不支援 HTML5 影片播放
      </video>

      <!-- 當影片無法讀取時，顯示指定的備用圖片 -->
      <img
        v-else
        src="@/images/home-image.png"
        alt="Hero Fallback"
        class="hero-video"
      />
    </div>

    <!-- 上層內容：浮動在影片上方的文字與按鈕 -->
    <div class="hero-content">
      <div class="hero-text">
        <p class="hero-eyebrow">Professional Pet Care Platform</p>
        <h1 class="hero-heading">專為您的毛孩<br />打造一站式服務</h1>
        <p class="hero-desc">
          從日常美容到專業醫療，我們用心呵護每一位寵物家人
        </p>
        <RouterLink v-if="!userStore.token" to="/member/login" class="hero-cta"
          >立即開始</RouterLink
        >
      </div>
    </div>
  </section>

  <section class="philosophy">
    <div class="philosophy-container">
      <h2 class="section-title">毛孩的幸福，源自於細膩的照護</h2>
      <div class="section-intro">
        <p>PetCare 打造跨領域的健康生態系</p>
        <p>將美容養護的舒適感，與健康醫療的專業精準完美結合</p>
      </div>

      <div class="philosophy-cards">
        <div class="phi-card">
          <h2>透明美容</h2>
          <p>專業職人細膩呵護，公開透明，讓變美過程成為毛孩的享受。</p>
        </div>
        <div class="phi-card">
          <h2>精準健康</h2>
          <p>醫療紀錄即時同步，數據化追蹤，隨時掌握毛孩健康指數。</p>
        </div>
        <div class="phi-card">
          <h2>安心陪伴</h2>
          <p>連結您與毛孩的每一刻，提供一站式專業服務，共度美好光陰。</p>
        </div>
      </div>
    </div>
  </section>

  <section class="services-section">
    <div class="services-container">
      <div class="section-header">
        <h2 class="section-title">陪伴，是給毛孩最溫柔的承諾</h2>
        <p class="service-intro">
          從日常陪伴到專業醫療，我們兼顧療癒美容與精準醫學，全方位守護毛孩幸福
        </p>
      </div>

      <div class="service-grid">
        <a
          class="service-card"
          @click.prevent="goWithLogin('/grooming/member')"
        >
          <span class="service-card-label">Membership</span>
          <h3 class="service-card-title">專屬照護空間</h3>
          <p class="service-card-desc">
            不僅是帳號管理，更是您與毛孩的溫馨筆記。支援多達五隻摯愛，隨心切換即可隨時紀錄點滴，守護每一份幸福時光。
          </p>
          <div class="service-card-tags">
            <span>#多寵溫馨陪伴</span> <span>#隨心紀錄</span>
            <span>#愛的專屬空間</span>
          </div>
          <span class="service-card-arrow">進入毛孩的小天地 →</span>
        </a>

        <a class="service-card" @click.prevent="goWithLogin('/grooming')">
          <span class="service-card-label">Grooming</span>
          <h3 class="service-card-title">療癒美容時光</h3>
          <p class="service-card-desc">
            如同家人般的細膩呵護，以日系溫感SPA與頂級草本洗劑，讓毛孩在舒適與放鬆中，重現純淨與優雅的迷人風采。
          </p>
          <div class="service-card-tags">
            <span>#溫感療癒</span> <span>#極致呵護</span>
            <span>#重現自信優雅</span>
          </div>
          <span class="service-card-arrow">預約溫柔洗護 →</span>
        </a>

        <a class="service-card" @click.prevent="goWithLogin('/medical')">
          <span class="service-card-label">Medical</span>
          <h3 class="service-card-title">安心健康守護</h3>
          <p class="service-card-desc">
            精準串聯日常健康數據與醫療紀錄，像最親密的守護者，時刻關注牠的細微變化，讓健康陪伴更加從容、安心。
          </p>
          <div class="service-card-tags">
            <span>#細膩觀察</span> <span>#健康數據守護</span>
            <span>#安心陪伴</span>
          </div>
          <span class="service-card-arrow">進入毛孩健康手帳 →</span>
        </a>
      </div>
    </div>
  </section>

  <section class="activities-section">
    <h2 class="section-title">PetCare 專屬活動</h2>

    <div class="activities-grid">
      <div class="activity-card">
        <div class="badge seasonal">SEASONAL</div>
        <h3>毛孩換季保養指南</h3>
        <p>
          換季掉毛與潮濕讓毛孩不適？預約洗護加購「皮膚健康檢測」，讓舒適與專業並行。
        </p>
        <button class="cta-link">立即預約檢測 →</button>
      </div>

      <div class="activity-card">
        <div class="badge challenge">CHALLENGE</div>
        <h3>健康數據挑戰賽</h3>
        <p>連續 30 天記錄毛孩體重與食量，完成挑戰即可獲得 PetCare 專屬好禮。</p>
        <button class="cta-link">開始挑戰 →</button>
      </div>

      <div class="activity-card">
        <div class="badge event">EVENT</div>
        <h3>獸醫師營養講座</h3>
        <p>
          週六午茶時光，由專業醫師親授毛孩營養照護秘訣，解答您心中的養育疑惑。
        </p>
        <button class="cta-link">報名參加 →</button>
      </div>

      <div class="activity-card">
        <div class="badge welcome">WELCOME</div>
        <h3>成為首位貴賓</h3>
        <p>
          加入 PetCare 會員，立即領取「首次服務體驗券」，享受我們的精緻照顧。
        </p>
        <button class="cta-link">領取優惠 →</button>
      </div>
    </div>
  </section>

  <section class="contact-section container">
    <h2 class="section-title">聯絡我們</h2>
    <div class="contact-grid">
      <a
        href="tel:0912345678"
        target="_blank"
        rel="noopener noreferrer"
        class="contact-item contact-link"
      >
        <div class="contact-icon icon-phone">
          <i class="fas fa-phone-alt"></i>
        </div>
        <p class="contact-info">0912-345-678</p>
      </a>
      <a
        href="https://line.me/R/ti/p/@PETCARE"
        class="contact-item contact-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="contact-icon icon-line"><i class="fab fa-line"></i></div>
        <p class="contact-info">@PETCARE</p>
      </a>
      <a
        href="https://www.facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        class="contact-item contact-link"
      >
        <div class="contact-icon icon-facebook">
          <i class="fab fa-facebook-f"></i>
        </div>
        <p class="contact-info">PETCARE</p>
      </a>
      <a
        href="https://www.instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        class="contact-item contact-link"
      >
        <div class="contact-icon icon-instagram">
          <i class="fab fa-instagram"></i>
        </div>
        <p class="contact-info">@PETCARE</p>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import useUserStore from "@/stores/user.js";
import "@/css/home.css";

// 用於追蹤影片是否發生錯誤
const videoError = ref(false);

const router = useRouter();
const userStore = useUserStore();

// path = 登入後要前往的路徑（由各卡片傳入，所以可共用）
function goWithLogin(path) {
  if (userStore.token) {
    // 已登入：正常前往
    router.push(path);
  } else {
    // 沒登入：跳出警告
    Swal.fire({
      icon: "warning",
      title: "請先登入會員",
      showCancelButton: true,
      confirmButtonText: "登入",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/member/login"); // 按「登入」→ 登入頁
      } else {
        router.push("/"); // 按「取消」→ 首頁
      }
    });
  }
}

//理念卡片動畫函式
onMounted(function () {
  var observerOptions = {
    threshold: 0.1,
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  var cards = document.querySelectorAll(".phi-card");
  cards.forEach(function (card) {
    observer.observe(card);
  });
});
</script>

<style></style>
