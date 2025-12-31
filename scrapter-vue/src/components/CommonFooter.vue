<template>
  <footer class="common-footer">
    <div class="footer-content">
      <div class="footer-left">
        <img
          src="/logo2.png"
          alt="Scrapter"
          class="footer-logo"
          @error="handleLogoError"
        />
        <p class="footer-text">Scrapter | 원하는 문서를, 원하는 형식으로</p>
        <p class="footer-text">
          복잡한 기획 과정을 간편하게 시작하세요.<br />
          문의하기 | info@9works.kr
        </p>
      </div>
      <div class="footer-right">
        <a href="#" @click.prevent="goToServiceIntro" class="footer-link"
          >서비스 소개</a
        >
        <a href="#" @click.prevent="goToPricing" class="footer-link"
          >가격 안내</a
        >
        <a href="#" @click.prevent="goToFaq" class="footer-link"
          >자주 묻는 질문</a
        >
        <a href="#" class="footer-link">고객 지원</a>
      </div>
    </div>
    <div class="footer-divider"></div>
    <p class="footer-copyright">© 2025 Scrapter. All rights reserved.</p>
  </footer>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogoError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
  if (img.parentElement) {
    img.parentElement.innerHTML =
      '<span style="font-weight: bold; font-size: 20px; color: white;">Scrapter</span>';
  }
};

const goToServiceIntro = () => {
  router.push("/service-intro");
};

const goToPricing = () => {
  router.push("/pricing");
};

const goToFaq = () => {
  router.push("/faq");
};
</script>

<style scoped>
.common-footer {
  background-color: #9e9e9e;
  padding: 80px 10%;
  color: white;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-logo {
  height: 40px;
  object-fit: contain;
  transition: opacity 0.3s;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: auto;
  -ms-interpolation-mode: nearest-neighbor;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.footer-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.footer-right {
  display: flex;
  gap: 32px;
}

.footer-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.footer-link:hover {
  opacity: 0.8;
}

.footer-divider {
  height: 1px;
  background-color: white;
  margin-bottom: 20px;
}

.footer-copyright {
  text-align: center;
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 40px;
  }

  .footer-right {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
