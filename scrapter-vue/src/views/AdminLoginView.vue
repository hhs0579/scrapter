<template>
  <div class="admin-login-view">
    <CommonHeader />
    <main class="login-content">
      <div class="login-container">
        <h1 class="login-title">어드민 로그인</h1>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">이메일</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="form-input"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="form-input"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? "로그인 중..." : "로그인" }}
          </button>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");

const handleLogin = async () => {
  if (!auth || !db) {
    error.value = "Firebase를 사용할 수 없습니다.";
    return;
  }

  error.value = "";
  isLoading.value = true;

  try {
    // Firebase Auth로 로그인
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    const user = userCredential.user;

    // Firestore에서 사용자 정보 확인
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // 사용자 정보가 없으면 로그아웃하고 에러
      await signOut(auth);
      error.value = "어드민 권한이 없습니다.";
      isLoading.value = false;
      return;
    }

    const userData = userDoc.data();
    const nickname = userData?.nickname;

    // nickname이 "admin"인지 확인
    if (nickname !== "admin") {
      // 어드민이 아니면 로그아웃하고 에러
      await signOut(auth);
      error.value = "어드민 권한이 없습니다.";
      isLoading.value = false;
      return;
    }

    // 어드민이면 어드민 페이지로 이동
    router.push("/admin");
  } catch (err: any) {
    console.error("어드민 로그인 오류:", err);
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
.admin-login-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
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
  background-color: var(--surface-bg);
  border-radius: 12px;
  padding: 40px;
  border: 1px solid var(--border-color);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 32px 0;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.form-input {
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--secondary-bg);
  color: var(--text-color);
  transition: all 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 119, 0, 0.1);
}

.login-button {
  padding: 14px 24px;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin: 0;
}
</style>
