<template>
  <div class="basic-info-view">
    <CommonHeader />
    <main class="basic-info-content page-enter">
      <div class="basic-info-container">
        <h1 class="info-title">기본정보입력</h1>
        <p class="info-subtitle">스크랩터 가입정보를 입력해주세요!</p>

        <form @submit.prevent="handleSignUp" class="signup-form">
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

          <div v-if="!isGoogleSignUp" class="form-group">
            <label for="password" class="form-label">비밀번호</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-input"
              placeholder="비밀번호를 입력해주세요"
              required
              minlength="6"
            />
          </div>

          <div v-if="!isGoogleSignUp" class="form-group">
            <label for="confirmPassword" class="form-label">비밀번호 확인</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              class="form-input"
              placeholder="비밀번호를 다시 입력해주세요"
              required
            />
            <p v-if="passwordMismatch" class="error-text">
              비밀번호가 일치하지 않습니다
            </p>
          </div>

          <div class="form-group">
            <label for="nickname" class="form-label">닉네임</label>
            <div class="nickname-input-group">
              <input
                id="nickname"
                v-model="formData.nickname"
                type="text"
                class="form-input"
                placeholder="닉네임을 입력해주세요"
                required
                :class="{ 'input-success': nicknameAvailable }"
              />
              <button
                type="button"
                class="check-button"
                @click="checkNickname"
                :disabled="!formData.nickname || isCheckingNickname"
              >
                {{ isCheckingNickname ? "확인 중..." : "중복확인" }}
              </button>
            </div>
            <p v-if="nicknameAvailable" class="success-text">
              사용가능한 닉네임 입니다
            </p>
            <p v-else-if="nicknameChecked && !nicknameAvailable" class="error-text">
              이미 사용 중인 닉네임입니다
            </p>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="!canSubmit || isSubmitting"
          >
            {{ isSubmitting ? "가입 중..." : "회원가입 완료" }}
          </button>
        </form>

        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const route = useRoute();

const formData = ref({
  email: "",
  password: "",
  confirmPassword: "",
  nickname: "",
});

const nicknameAvailable = ref(false);
const nicknameChecked = ref(false);
const isCheckingNickname = ref(false);
const isSubmitting = ref(false);
const error = ref<string>("");
const isGoogleSignUp = ref(false);

// Google 로그인 정보가 있으면 폼에 자동 입력
onMounted(() => {
  const query = route.query;
  if (query.method === "google" && query.email) {
    formData.value.email = query.email as string;
    if (query.displayName) {
      formData.value.nickname = query.displayName as string;
    }
    isGoogleSignUp.value = true;
    // Google 로그인은 이미 인증이 완료되었으므로 비밀번호 입력 불필요
  }
});

const passwordMismatch = computed(() => {
  return (
    formData.value.confirmPassword &&
    formData.value.password !== formData.value.confirmPassword
  );
});

const canSubmit = computed(() => {
  if (isGoogleSignUp.value) {
    return formData.value.nickname && nicknameAvailable.value;
  }
  return (
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.nickname &&
    !passwordMismatch.value &&
    nicknameAvailable.value
  );
});

const checkNickname = async () => {
  if (!formData.value.nickname) return;

  isCheckingNickname.value = true;
  nicknameChecked.value = false;
  nicknameAvailable.value = false;

  try {
    if (!db) {
      throw new Error("Firestore를 사용할 수 없습니다.");
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("nickname", "==", formData.value.nickname));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      nicknameAvailable.value = true;
    } else {
      nicknameAvailable.value = false;
    }
    nicknameChecked.value = true;
  } catch (err: any) {
    console.error("닉네임 확인 오류:", err);
    error.value = "닉네임 확인 중 오류가 발생했습니다.";
    nicknameChecked.value = true;
  } finally {
    isCheckingNickname.value = false;
  }
};

const handleSignUp = async () => {
  if (!canSubmit.value) return;

  if (!isGoogleSignUp.value && passwordMismatch.value) {
    error.value = "비밀번호가 일치하지 않습니다.";
    return;
  }

  if (!nicknameAvailable.value) {
    error.value = "닉네임 중복 확인을 해주세요.";
    return;
  }

  isSubmitting.value = true;
  error.value = "";

  try {
    if (!auth) {
      throw new Error("Firebase Auth를 사용할 수 없습니다.");
    }

    let userUid: string;

    if (isGoogleSignUp.value) {
      // Google 로그인은 이미 인증이 완료되었으므로 현재 사용자 정보 가져오기
      if (!auth.currentUser) {
        throw new Error("로그인된 사용자 정보를 찾을 수 없습니다.");
      }
      userUid = auth.currentUser.uid;
    } else {
      // 이메일 회원가입
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.value.email,
        formData.value.password
      );
      userUid = userCredential.user.uid;
    }

    // Firestore에 사용자 정보 저장
    if (db) {
      await setDoc(doc(db, "users", userUid), {
        email: formData.value.email,
        nickname: formData.value.nickname,
        createdAt: new Date(),
        signUpMethod: isGoogleSignUp.value ? "google" : "email",
      });
    }

    // 회원가입 성공 시 메인 페이지로 이동
    router.push("/app");
  } catch (err: any) {
    console.error("회원가입 오류:", err);
    if (err.code === "auth/email-already-in-use") {
      error.value = "이미 사용 중인 이메일입니다.";
    } else if (err.code === "auth/weak-password") {
      error.value = "비밀번호는 6자 이상이어야 합니다.";
    } else {
      error.value = err.message || "회원가입 중 오류가 발생했습니다.";
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.basic-info-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.basic-info-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
}

.basic-info-container {
  width: 100%;
  max-width: 500px;
}

.info-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 8px 0;
  text-align: center;
}

.info-subtitle {
  font-size: 16px;
  color: var(--muted-text);
  margin: 0 0 40px 0;
  text-align: center;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.form-input.input-success {
  border-color: #4caf50;
}

.nickname-input-group {
  display: flex;
  gap: 8px;
}

.nickname-input-group .form-input {
  flex: 1;
}

.check-button {
  padding: 14px 20px;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background-color: white;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.check-button:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
}

.check-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-text {
  font-size: 13px;
  color: var(--primary-color);
  margin: 0;
}

.error-text {
  font-size: 13px;
  color: #e74c3c;
  margin: 0;
}

.submit-button {
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

.submit-button:hover:not(:disabled) {
  background-color: #e88d4f;
}

.submit-button:disabled {
  background-color: var(--border-color);
  color: var(--muted-text);
  cursor: not-allowed;
  opacity: 0.6;
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

