<script setup lang="ts">
import { useRouter } from "vue-router";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();

const goToApp = () => {
  router.push("/app");
};
</script>

<template>
  <div class="landing">
    <CommonHeader />
    <main class="main-content">
      <section class="hero">
        <p class="hero-description">
          복잡한 문서 기획, 이제 질문에 답하는 것만으로 시작하세요.
        </p>
        <h2 class="hero-title">Scrapter에 오신 것을 환영합니다</h2>
        <p class="hero-description">
          회사소개서, IR, 제품소개서, 상세페이지까지<br />상황에 맞는 원고를
          빠르게 정리해보세요.
        </p>
        <button @click="goToApp" class="cta-button">시작하기</button>
      </section>

      <section class="features">
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>빠른 성능</h3>
          <p>최적화된 성능으로 빠른 경험을 제공합니다</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>아름다운 디자인</h3>
          <p>현대적이고 직관적인 사용자 인터페이스</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>안전한 보안</h3>
          <p>데이터 보안과 개인정보 보호를 최우선으로 합니다</p>
        </div>
      </section>
    </main>
    <CommonFooter />
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

.hero {
  text-align: center;
  padding: 4rem 0 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-description:first-of-type {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
  font-weight: 400;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, var(--primary-color), #ff9933);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.hero-description:last-of-type {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  opacity: 0.8;
  line-height: 1.6;
  max-width: 600px;
}

.cta-button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, var(--primary-color), #ff9933);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 119, 0, 0.3);
  margin-top: 0;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 119, 0, 0.4);
}

.cta-button:active {
  transform: translateY(0);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.feature-card {
  padding: 2rem;
  border-radius: 16px;
  background-color: var(--secondary-bg);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.feature-card p {
  opacity: 0.8;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 0 4rem;
  }

  .hero-description:first-of-type {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }

  .hero-title {
    font-size: 2rem;
    margin-bottom: 1.25rem;
  }

  .hero-description:last-of-type {
    font-size: 1rem;
    margin-bottom: 2.5rem;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
