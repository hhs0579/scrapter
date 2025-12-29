<script setup lang="ts">
import { ref } from "vue";
import { useThemeStore } from "../stores/theme";

const themeStore = useThemeStore();
const themeToggleRef = ref<HTMLElement | null>(null);

const goToApp = () => {
  window.location.href = "/app/";
};

const handleThemeToggle = () => {
  if (!themeToggleRef.value) return;

  const button = themeToggleRef.value;
  const rect = button.getBoundingClientRect();

  // 버튼의 중심점 계산 (클릭 위치가 아닌 버튼 중심)
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 화면 대각선 길이 계산 (충분히 크게)
  const diagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
  const size = diagonal * 1.5;

  // Ripple 요소 생성
  const ripple = document.createElement("div");
  ripple.className = "theme-ripple";

  // 변경될 배경색 적용 (현재가 light면 dark 색상, dark면 light 색상)
  const newBgColor = themeStore.isDarkMode ? "#ffffff" : "#1a1a1a";
  ripple.style.backgroundColor = newBgColor;

  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${centerX}px`;
  ripple.style.top = `${centerY}px`;

  // body에 추가 (전체 화면에 퍼지도록)
  document.body.appendChild(ripple);

  // 테마 전환 (약간의 지연을 주어 ripple이 먼저 시작되도록)
  requestAnimationFrame(() => {
    setTimeout(() => {
      themeStore.toggleTheme();
    }, 50);
  });

  // 애니메이션 완료 후 제거
  ripple.addEventListener(
    "animationend",
    () => {
      ripple.remove();
    },
    { once: true }
  );
};
</script>

<template>
  <div class="landing">
    <header class="header">
      <div class="header-content">
        <h1 class="logo">Scrapter</h1>
        <button
          ref="themeToggleRef"
          @click="handleThemeToggle"
          class="theme-toggle"
        >
          {{ themeStore.isDarkMode ? "☀️" : "🌙" }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <section class="hero">
        <h2 class="hero-title">Scrapter에 오신 것을 환영합니다</h2>
        <p class="hero-description">더 나은 경험을 위한 새로운 시작</p>
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

    <footer class="footer">
      <p>&copy; 2024 Scrapter. All rights reserved.</p>
    </footer>
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

.header {
  padding: 1.5rem 2rem;
  background-color: var(--header-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), #747bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.theme-toggle {
  background: none;
  border: 2px solid var(--text-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  overflow: visible;
  z-index: 100;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-toggle:active {
  transform: scale(0.95);
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
  padding: 4rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), #747bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  opacity: 0.8;
}

.cta-button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, var(--primary-color), #747bff);
  color: white;
  box-shadow: 0 4px 15px rgba(100, 108, 255, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(100, 108, 255, 0.4);
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

.footer {
  padding: 2rem;
  text-align: center;
  background-color: var(--header-bg);
  border-top: 1px solid var(--border-color);
  opacity: 0.7;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
