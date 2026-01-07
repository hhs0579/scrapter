<template>
  <div class="question-view">
    <CommonHeader />
    <main class="question-content page-enter">
      <h1 class="question-title">{{ questionTitle }}</h1>
      <h2 class="question-heading">
        현재 운영 중인 사업(또는 준비 중인 서비스)은 어떤 유형에 속하나요?
        (다중선택)
      </h2>
      <p class="question-hint">
        가장 가까운 항목을 선택해 주세요 이후 질문과 원고 예시에 참고됩니다.
        (하나만 선택해도 괜찮아요.)
      </p>

      <div class="options-grid">
        <button
          v-for="option in businessOptions"
          :key="option"
          class="option-button"
          :class="{ active: isSelected(option) }"
          @click="toggleOption(option)"
        >
          {{ option }}
        </button>
      </div>

      <!-- 기타 직접 입력 필드 -->
      <div v-if="isOtherSelected" class="custom-input-container">
        <input
          v-model="customInput"
          type="text"
          placeholder="사업 유형을 직접 입력해주세요"
          class="custom-input"
          @input="updateCustomType"
        />
      </div>

      <div class="question-buttons">
        <button class="btn-secondary" @click="goBack">이전으로</button>
        <button
          class="btn-primary"
          @click="goNext"
          :disabled="selectedBusinessTypes.length === 0"
        >
          다음으로
        </button>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuestionStore } from "../stores/question";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const questionStore = useQuestionStore();
const customInput = ref(questionStore.customBusinessType);

// 선택한 카드가 없으면 AppView로 리다이렉트
onMounted(() => {
  if (!questionStore.selectedCard) {
    router.push("/app");
  }
});

const questionTitle = computed(() => {
  if (!questionStore.selectedCard) return "";
  return (
    questionStore.cardTitles[
      questionStore.selectedCard as keyof typeof questionStore.cardTitles
    ] || ""
  );
});

const selectedBusinessTypes = computed(
  () => questionStore.selectedBusinessTypes
);

const businessOptions = [
  "코스메틱/뷰티",
  "식품/F&B",
  "건강기능식품",
  "패션/라이프스타일 제품",
  "리빙/생활용품",
  "IT/SaaS",
  "구독형 서비스",
  "커뮤니티/멤버십",
  "콘텐츠 서비스",
  "플랫폼 서비스",
  "브랜드/D2C",
  "디자인/스튜디오",
  "마케팅/에이전시",
  "미디어/콘텐츠 제작",
  "교육/클래스",
  "헬스케어/웰니스",
  "여행/레저",
  "친환경/지속가능",
  "B2B 솔루션",
  "기타 (직접 입력)",
];

const isSelected = (option: string) => {
  return selectedBusinessTypes.value.includes(option);
};

const isOtherSelected = computed(() => {
  return selectedBusinessTypes.value.includes("기타 (직접 입력)");
});

const toggleOption = (option: string) => {
  questionStore.toggleBusinessType(option);
  // 기타 선택 해제 시 직접 입력 값도 초기화
  if (option === "기타 (직접 입력)" && !isOtherSelected.value) {
    customInput.value = "";
    questionStore.setCustomBusinessType("");
  }
};

const updateCustomType = () => {
  questionStore.setCustomBusinessType(customInput.value);
};

const goBack = () => {
  router.push("/app");
};

const goNext = () => {
  questionStore.setCurrentStep(2);
  router.push("/question-form");
};
</script>

<style scoped>
.question-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.question-content {
  flex: 1;

  width: 100%;
  margin: 0 auto;
  padding: 120px 20%;
}

.question-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 40px 0;
  text-align: center;
}

.question-heading {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px 0;
  text-align: center;
}

.question-hint {
  font-size: 14px;
  color: var(--muted-text);
  margin: 0 0 40px 0;
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 60px;
}

.option-button {
  padding: 16px 20px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: keep-all;
  white-space: nowrap;
}

.option-button:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-soft-bg);
}

.option-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.custom-input-container {
  margin-bottom: 40px;
  padding: 0 0 0 0;
}

.custom-input {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  background-color: var(--surface-bg);
  transition: all 0.2s;
  box-sizing: border-box;
}

.custom-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: var(--primary-soft-bg);
}

.custom-input::placeholder {
  color: var(--subtle-text);
}

.question-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 40px;
  border-top: 1px solid var(--border-color);
}

.btn-secondary {
  padding: 14px 32px;
  background-color: var(--secondary-bg);
  color: var(--muted-text);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background-color: var(--hover-bg);
}

.btn-primary {
  padding: 14px 32px;
  background-color: #ff7700;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .question-content {
    padding: 40px 5%;
  }

  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .question-buttons {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
