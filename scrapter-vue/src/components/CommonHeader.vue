<template>
  <div class="common-header">
    <div class="header-top">
      <div class="header-content">
        <router-link to="/" class="logo-link">
          <img
            :src="themeStore.isDarkMode ? '/logo2.png' : '/logo.png'"
            alt="Scrapter"
            class="logo-image"
            @error="handleLogoError"
          />
        </router-link>
        <div class="header-actions">
          <button @click="goToContact" class="contact-button">
            도입 문의하기
          </button>
          <button @click="handleLanguage" class="icon-button" title="언어 변경">
            <span class="material-icons">language</span>
          </button>
          <button @click="goToUser" class="icon-button" title="사용자">
            <span class="material-icons">person</span>
          </button>
          <button
            ref="themeToggleRef"
            @click="handleThemeToggle"
            class="icon-button"
            title="다크모드 전환"
          >
            <span class="material-icons">{{
              themeStore.isDarkMode ? "light_mode" : "dark_mode"
            }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="header-nav" v-if="isDesktop">
      <div class="nav-content">
        <router-link to="/" class="nav-item">홈</router-link>
        <router-link to="/user-guide" class="nav-item">사용가이드</router-link>
        <router-link to="/dashboard" class="nav-item">대시보드</router-link>
      </div>
    </div>
    <div class="header-nav-mobile" v-else>
      <div class="nav-content">
        <button @click="toggleMenu" class="menu-button">
          <span class="material-icons">menu</span>
        </button>
        <div v-if="isMenuOpen" class="mobile-menu">
          <router-link to="/" class="nav-item" @click="closeMenu"
            >홈</router-link
          >
          <router-link to="/user-guide" class="nav-item" @click="closeMenu"
            >사용가이드</router-link
          >
          <router-link to="/dashboard" class="nav-item" @click="closeMenu"
            >대시보드</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useThemeStore } from "../stores/theme";

// Firebase 동적 import (선택적)
let auth: any = null;
let onAuthStateChanged: any = null;

import("../config/firebase")
  .then((firebaseModule) => {
    if (firebaseModule.auth) {
      auth = firebaseModule.auth;
      import("firebase/auth").then((authModule) => {
        onAuthStateChanged = authModule.onAuthStateChanged;
      });
    }
  })
  .catch((error) => {
    console.warn("Firebase 모듈을 로드할 수 없습니다:", error);
  });

const router = useRouter();
const themeStore = useThemeStore();
const themeToggleRef = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);
const isLoggedIn = ref(false);
const windowWidth = ref(window.innerWidth);

const isDesktop = computed(() => windowWidth.value > 800);

const handleLogoError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
  if (img.parentElement) {
    img.parentElement.innerHTML =
      '<span style="font-weight: bold; font-size: 20px;">Scrapter</span>';
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const goToContact = () => {
  router.push("/contact");
};

const handleLanguage = () => {
  // 언어 변경 기능
};

const goToUser = async () => {
  // 현재 로그인 상태를 다시 확인
  try {
    if (auth && auth.currentUser) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  } catch (error) {
    router.push("/login");
  }
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

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);

  // Firebase Auth 상태 확인 (선택적)
  try {
    if (auth && onAuthStateChanged) {
      // 초기 상태 확인
      if (auth.currentUser) {
        isLoggedIn.value = true;
      }

      // 상태 변경 리스너
      onAuthStateChanged(auth, (user: any) => {
        isLoggedIn.value = !!user;
      });
    } else {
      // Firebase가 초기화되지 않은 경우
      isLoggedIn.value = false;
    }
  } catch (e) {
    // Firebase가 초기화되지 않은 경우
    console.warn("Firebase Auth를 사용할 수 없습니다:", e);
    isLoggedIn.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.common-header {
  background-color: var(--header-bg, white);
  transition: background-color 0.6s ease;
}

.header-top {
  padding: 20px 0;
}

.header-content {
  margin: 0 auto;
  padding: 0 20%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: high-quality;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: auto;
  filter: contrast(1.05) brightness(1.02);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.contact-button {
  padding: 10px 16px;
  background-color: #f59e61;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-button:hover {
  background-color: #e88d4f;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color, black);
  transition: color 0.6s ease;
}

.icon-button .material-icons {
  font-size: 24px;
}

.header-nav {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  transition: border-color 0.6s ease;
}

.nav-content {
  margin: 0 auto;
  padding: 0 20%;
  display: flex;
  gap: 32px;
}

.nav-item {
  padding: 0 16px;
  text-decoration: none;
  color: var(--text-color, black);
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.6s ease;
}

.nav-item:hover {
  color: #f59e61;
}

.header-nav-mobile {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  transition: border-color 0.6s ease;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: var(--text-color, black);
  transition: color 0.6s ease;
}

.mobile-menu {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-direction: column;
}

@media (max-width: 800px) {
  .header-content {
    padding: 0 5%;
  }

  .nav-content {
    padding: 0 5%;
  }
}
</style>
