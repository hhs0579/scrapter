<template>
  <div class="submit-complete-view">
    <CommonHeader />
    <main class="complete-content page-enter">
      <h1 class="complete-title">제출 완료!</h1>
      <div v-if="isGenerating" class="generating-state">
        <div class="loading-spinner"></div>
        <p class="generating-message">
          선택하신 목적에 맞게 원고를 생성하고 있습니다...<br />
          잠시만 기다려주세요.
        </p>
      </div>
      <div v-else-if="generationError" class="error-state">
        <p class="error-message">{{ generationError }}</p>
        <button class="retry-button" @click="goBack">
          다시 시도
        </button>
      </div>
      <div v-else class="success-state">
        <p class="complete-message">
          모든 질문에 제출되었습니다.<br />
          원고 생성이 완료되었습니다.
        </p>
        <button class="complete-button" @click="goToManuscript">
          원고 확인하러 가기
        </button>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuestionStore } from "../stores/question";
import { generateCompanyIntroduction } from "../services/geminiApi";
import { auth, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const questionStore = useQuestionStore();

const isGenerating = ref(false);
const generationError = ref<string>("");

// 현재 카드의 모든 답변 가져오기
const getAllAnswers = () => {
  const answers: Record<number, string> = {};
  if (!questionStore.selectedCard) return answers;

  const cardNumber = questionStore.selectedCard;
  const questions =
    questionStore.cardQuestions[
      cardNumber as keyof typeof questionStore.cardQuestions
    ];

  if (questions) {
    questions.forEach((q) => {
      const answer = questionStore.getAnswer(cardNumber, q.number);
      if (answer) {
        answers[q.number] = answer;
      }
    });
  }

  return answers;
};

const generateManuscript = async () => {
  if (!questionStore.selectedCard) {
    generationError.value = "선택한 카드 정보를 찾을 수 없습니다.";
    return;
  }

  const answers = getAllAnswers();

  // 모든 질문에 답변이 있는지 확인
  const questions =
    questionStore.cardQuestions[
      questionStore.selectedCard as keyof typeof questionStore.cardQuestions
    ];

  if (!questions) {
    generationError.value = "질문 정보를 불러올 수 없습니다.";
    return;
  }

  const allAnswered = questions.every((q) => {
    const answer = answers[q.number];
    return answer && typeof answer === "string" && answer.trim().length > 0;
  });

  if (!allAnswered) {
    generationError.value = "모든 질문에 답변을 입력해주세요.";
    return;
  }

  isGenerating.value = true;
  generationError.value = "";

  try {
    const extractedText = questionStore.getUploadedDocumentText();
    const manuscript = await generateCompanyIntroduction(
      answers,
      questionStore.selectedCard,
      extractedText
    );
    questionStore.setGeneratedManuscript(manuscript);
  } catch (error) {
    console.error("원고 생성 오류:", error);
    generationError.value =
      error instanceof Error
        ? error.message
        : "원고 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
  } finally {
    isGenerating.value = false;
  }
};

const goToManuscript = async () => {
  // 원고 자동 저장
  if (auth?.currentUser && db && questionStore.getGeneratedManuscript()) {
    try {
      const cardTitles: Record<number, string> = {
        1: "회사소개서",
        2: "IR / 사업계획서",
        3: "제품·서비스 소개서",
        4: "상세페이지 / 마케팅 콘텐츠",
      };

      const cardNumber = questionStore.selectedCard;
      if (!cardNumber) {
        router.push("/manuscript");
        return;
      }

      const title = cardTitles[cardNumber] || "원고";
      const type = cardTitles[cardNumber] || "원고";

      // 유효기간: 생성일로부터 3년
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 3);

      const answers = getAllAnswers();

      const manuscriptData = {
        userId: auth.currentUser.uid,
        title: `${title} 제작`,
        type: type,
        status: "complete",
        answers: answers,
        manuscript: questionStore.getGeneratedManuscript(),
        selectedCard: questionStore.selectedCard,
        createdAt: serverTimestamp(),
        validUntil: Timestamp.fromDate(validUntil),
      };

      // 새 문서 생성
      await setDoc(
        doc(db, "manuscripts", `${Date.now()}_${auth.currentUser.uid}`),
        manuscriptData
      );
    } catch (error) {
      console.error("원고 자동 저장 오류:", error);
      // 저장 실패해도 원고 페이지로 이동
    }
  }

  router.push("/manuscript");
};

const goBack = () => {
  router.push("/question-form");
};

// 페이지 로드 시 자동으로 원고 생성
onMounted(() => {
  generateManuscript();
});
</script>

<style scoped>
.submit-complete-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.complete-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20%;

  width: 100%;
  margin: 0 auto;
}

.complete-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 24px 0;
  text-align: center;
}

.complete-message {
  font-size: 16px;
  color: var(--muted-text);
  line-height: 1.6;
  margin: 0 0 40px 0;
  text-align: center;
}

.complete-button {
  padding: 16px 48px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.complete-button:hover {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.generating-message {
  font-size: 16px;
  color: var(--muted-text);
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.error-message {
  color: #e74c3c;
  font-size: 16px;
  text-align: center;
  margin: 0;
}

.retry-button {
  padding: 12px 32px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-button:hover {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .complete-content {
    padding: 80px 5%;
  }

  .complete-title {
    font-size: 24px;
  }

  .complete-message {
    font-size: 14px;
  }
}
</style>
