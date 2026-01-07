<template>
  <div class="login-view">
    <CommonHeader />
    <main class="login-content page-enter">
      <div class="login-container">
        <h1 class="greeting">안녕하세요!</h1>
        <p class="instruction">로그인 방식을 선택해주세요</p>

        <div class="login-options">
          <button class="login-option google-login" @click="signInWithGoogle">
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
            <span class="option-text">Google로 로그인</span>
          </button>

          <button
            class="login-option email-login"
            @click="showEmailForm = true"
          >
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
            <span class="option-text">이메일로 로그인</span>
          </button>
        </div>

        <div v-if="showEmailForm" class="email-form">
          <form @submit.prevent="handleEmailLogin" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">이메일</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="이메일을 입력해주세요"
                required
              />
            </div>

            <div class="form-group">
              <label for="password" class="form-label">비밀번호</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-input"
                placeholder="비밀번호를 입력해주세요"
                required
              />
            </div>

            <button type="submit" class="login-button" :disabled="isLoading">
              {{ isLoading ? "로그인 중..." : "로그인" }}
            </button>
          </form>
        </div>

        <div class="signup-link">
          <p>
            계정이 없으신가요?
            <router-link to="/signup" class="link">회원가입</router-link>
          </p>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const showEmailForm = ref(false);
const isLoading = ref(false);
const error = ref<string>("");

const formData = ref({
  email: "",
  password: "",
});

const signInWithGoogle = async () => {
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

    // Firestore에 사용자 정보가 있는지 확인
    if (db) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // 사용자 정보가 없으면 회원가입 절차로 이동
        router.push({
          path: "/terms-agreement",
          query: {
            method: "google",
            email: user.email || "",
            displayName: user.displayName || "",
          },
        });
        return;
      }
    }

    // 사용자 정보가 있으면 로그인 성공
    router.push("/app");
  } catch (err: any) {
    console.error("Google 로그인 오류:", err);
    error.value =
      err.message || "Google 로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
  } finally {
    isLoading.value = false;
  }
};

const handleEmailLogin = async () => {
  if (!auth) {
    error.value = "Firebase Auth를 사용할 수 없습니다.";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      formData.value.email,
      formData.value.password
    );
    // 로그인 성공 시 메인 페이지로 이동
    router.push("/app");
  } catch (err: any) {
    console.error("이메일 로그인 오류:", err);
    if (err.code === "auth/user-not-found") {
      error.value = "등록되지 않은 이메일입니다.";
    } else if (err.code === "auth/wrong-password") {
      error.value = "비밀번호가 올바르지 않습니다.";
    } else if (err.code === "auth/invalid-email") {
      error.value = "올바른 이메일 형식이 아닙니다.";
    } else {
      error.value = err.message || "로그인 중 오류가 발생했습니다.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.login-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
}

.login-container {
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

.login-options {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.login-option {
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

.login-option:hover {
  border-color: var(--primary-color);
  background-color: var(--hover-bg);
}

.login-option:active {
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

.email-form {
  width: 100%;
  margin-top: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-strong);
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--surface-bg);
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 119, 0, 0.1);
}

.login-button {
  width: 100%;
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  background-color: #e88d4f;
}

.login-button:disabled {
  background-color: var(--border-color);
  color: var(--muted-text);
  cursor: not-allowed;
  opacity: 0.6;
}

.signup-link {
  margin-top: 24px;
  text-align: center;
}

.signup-link p {
  font-size: 14px;
  color: var(--muted-text);
  margin: 0;
}

.signup-link .link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.signup-link .link:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  width: 100%;
}
</style>
