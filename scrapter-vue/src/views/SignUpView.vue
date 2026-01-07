<template>
  <div class="signup-view">
    <CommonHeader />
    <main class="signup-content page-enter">
      <div class="signup-container">
        <h1 class="greeting">안녕하세요!</h1>
        <p class="instruction">회원가입 방식을 선택해주세요</p>

        <div class="signup-options">
          <button class="signup-option google-signup" @click="signUpWithGoogle">
            <div class="option-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span class="option-text">Google로 회원가입</span>
          </button>

          <button class="signup-option email-signup" @click="goToEmailSignUp">
            <div class="option-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </div>
            <span class="option-text">이메일로 회원가입</span>
          </button>
        </div>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const isLoading = ref(false);
const error = ref<string>("");

const signUpWithGoogle = async () => {
  if (!auth) {
    error.value = "Firebase Auth를 사용할 수 없습니다.";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Google 로그인 성공 시 약관동의 페이지로 이동 (이메일 정보 전달)
    router.push({
      path: "/terms-agreement",
      query: {
        method: "google",
        email: user.email || "",
        displayName: user.displayName || "",
      },
    });
  } catch (err: any) {
    console.error("Google 로그인 오류:", err);
    error.value =
      err.message || "Google 로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
  } finally {
    isLoading.value = false;
  }
};

const goToEmailSignUp = () => {
  router.push("/terms-agreement");
};
</script>

<style scoped>
.signup-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.signup-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
}

.signup-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  margin-bottom: 40px;
}

.logo-image {
  width: 80px;
  height: auto;
  image-rendering: high-quality;
  -webkit-font-smoothing: antialiased;
  filter: contrast(1.05) brightness(1.02);
}

.greeting {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 12px 0;
  text-align: center;
}

.instruction {
  font-size: 16px;
  color: var(--muted-text);
  margin: 0 0 40px 0;
  text-align: center;
}

.signup-options {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.signup-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--surface-bg);
  color: var(--text-color);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.signup-option:hover {
  border-color: var(--primary-color);
  background-color: var(--hover-bg);
}

.signup-option:active {
  transform: scale(0.98);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.option-icon svg {
  width: 100%;
  height: 100%;
}

.option-text {
  flex: 1;
  text-align: left;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}
</style>
