<template>
  <div class="terms-view">
    <CommonHeader />
    <main class="terms-content page-enter">
      <div class="terms-container">
        <h1 class="terms-title">약관동의</h1>
        <p class="terms-subtitle">스크랩터의 서비스 이용약관에 동의해주세요</p>

        <div class="agreement-section">
          <label class="agree-all">
            <input
              type="checkbox"
              v-model="agreeAll"
              @change="handleAgreeAll"
              class="checkbox-input"
            />
            <span class="checkbox-label">모두 동의 (선택 정보 포함)</span>
          </label>

          <div class="divider"></div>

          <div class="agreement-list">
            <label class="agreement-item">
              <input
                type="checkbox"
                v-model="agreements.age"
                @change="updateAgreeAll"
                class="checkbox-input"
              />
              <span class="agreement-text">
                <span class="required">[필수]</span> 만 14세 이상입니다
              </span>
            </label>

            <label class="agreement-item">
              <input
                type="checkbox"
                v-model="agreements.service"
                @change="updateAgreeAll"
                class="checkbox-input"
              />
              <span class="agreement-text">
                <span class="required">[필수]</span> 스크랩터 서비스 이용약관 동의
              </span>
              <button class="view-link" @click.prevent="viewTerms('service')">
                보기
              </button>
            </label>

            <label class="agreement-item">
              <input
                type="checkbox"
                v-model="agreements.privacy"
                @change="updateAgreeAll"
                class="checkbox-input"
              />
              <span class="agreement-text">
                <span class="required">[필수]</span> 개인정보 수집 및 이용동의
              </span>
              <button class="view-link" @click.prevent="viewTerms('privacy')">
                보기
              </button>
            </label>
          </div>
        </div>

        <button
          class="next-button"
          :disabled="!canProceed"
          @click="goToBasicInfo"
        >
          다음
        </button>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const route = useRoute();

const agreeAll = ref(false);
const agreements = ref({
  age: false,
  service: false,
  privacy: false,
});

const canProceed = computed(() => {
  return agreements.value.age && agreements.value.service && agreements.value.privacy;
});

const handleAgreeAll = () => {
  if (agreeAll.value) {
    agreements.value.age = true;
    agreements.value.service = true;
    agreements.value.privacy = true;
  } else {
    agreements.value.age = false;
    agreements.value.service = false;
    agreements.value.privacy = false;
  }
};

const updateAgreeAll = () => {
  agreeAll.value =
    agreements.value.age &&
    agreements.value.service &&
    agreements.value.privacy;
};

const viewTerms = (type: string) => {
  // 약관 보기 모달 또는 새 페이지로 이동
  console.log(`${type} 약관 보기`);
  // TODO: 약관 보기 기능 구현
};

const goToBasicInfo = () => {
  if (canProceed.value) {
    // Google 로그인 정보가 있으면 전달
    const query = route.query;
    router.push({
      path: "/basic-info",
      query: query.method ? query : {},
    });
  }
};
</script>

<style scoped>
.terms-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.terms-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
}

.terms-container {
  width: 100%;
  max-width: 500px;
}

.terms-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 8px 0;
  text-align: center;
}

.terms-subtitle {
  font-size: 16px;
  color: var(--muted-text);
  margin: 0 0 40px 0;
  text-align: center;
}

.agreement-section {
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.agree-all {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  cursor: pointer;
}

.divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 16px 0;
}

.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agreement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color);
  flex-shrink: 0;
}

.checkbox-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-strong);
}

.agreement-text {
  flex: 1;
  font-size: 15px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: var(--primary-color);
  font-weight: 600;
}

.view-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  margin-left: auto;
}

.view-link:hover {
  color: #e88d4f;
}

.next-button {
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
}

.next-button:hover:not(:disabled) {
  background-color: #e88d4f;
}

.next-button:disabled {
  background-color: var(--border-color);
  color: var(--muted-text);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>

