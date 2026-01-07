<template>
  <div class="question-form-view">
    <CommonHeader />
    <main class="question-form-content page-enter">
      <h1 class="form-title">{{ questionTitle }}</h1>

      <div
        v-for="(question, index) in currentQuestions"
        :key="question.number"
        class="question-section"
      >
        <div class="question-header">
          <span class="question-number">{{ question.number }}.</span>
          <span class="question-section-title">{{ question.title }}</span>
        </div>

        <h2 class="question-text">{{ question.question }}</h2>

        <div class="input-container">
          <div
            v-if="!answers[question.number] && !isFocused[question.number]"
            class="hint-text"
          >
            <div class="hint-subtext">
              <p
                v-for="(line, lineIndex) in question.subtext"
                :key="lineIndex"
                class="hint-line"
              >
                {{ line }}
              </p>
            </div>
            <div class="hint-examples">
              <p class="hint-examples-label">입력 예시</p>
              <ul class="hint-examples-list">
                <li
                  v-for="(example, exampleIndex) in question.examples"
                  :key="exampleIndex"
                  class="hint-example-item"
                >
                  {{ example }}
                </li>
              </ul>
            </div>
          </div>
          <textarea
            v-model="answers[question.number]"
            placeholder=""
            class="answer-input"
            maxlength="400"
            @input="updateAnswer(question.number, $event)"
            @focus="isFocused[question.number] = true"
            @blur="isFocused[question.number] = false"
          ></textarea>
          <div class="character-count">
            {{ (answers[question.number] || "").length }}/400
          </div>
        </div>

        <div
          v-if="index < currentQuestions.length - 1"
          class="section-divider"
        ></div>
      </div>

      <!-- PDF 업로드 (마지막 질문에만) -->
      <div
        v-if="
          currentQuestions.length > 0 &&
          currentQuestions[currentQuestions.length - 1]?.number === 6
        "
        class="pdf-upload-section"
      >
        <button class="pdf-upload-button" @click="triggerFileUpload">
          PDF 업로드
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.ppt,.pptx"
          multiple
          style="display: none"
          @change="handleFileUpload"
        />
        <div v-if="uploadedFiles.length > 0" class="uploaded-files">
          <div
            v-for="(file, index) in uploadedFiles"
            :key="index"
            class="uploaded-file-item"
          >
            <span class="file-name">{{ file.name }}</span>
            <button
              class="file-delete-button"
              @click="removeFile(index)"
              type="button"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      </div>

      <div class="form-buttons">
        <button class="btn-secondary" @click="goBack">이전으로</button>
        <button class="btn-primary" @click="submitForm">제출하기</button>
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
const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFiles = ref<File[]>([]);
const answers = ref<Record<number, string>>({});
const isFocused = ref<Record<number, boolean>>({});

// 선택한 카드가 없으면 QuestionView로 리다이렉트
onMounted(() => {
  if (!questionStore.selectedCard) {
    router.push("/question");
    return;
  }

  // 기존 답변 불러오기
  const cardNumber = questionStore.selectedCard;
  if (cardNumber && questionStore.cardQuestions) {
    const questions =
      questionStore.cardQuestions[
        cardNumber as keyof typeof questionStore.cardQuestions
      ];
    if (questions) {
      questions.forEach((q) => {
        const savedAnswer = questionStore.getAnswer(cardNumber, q.number);
        if (savedAnswer) {
          answers.value[q.number] = savedAnswer;
        }
      });
    }
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

const currentQuestions = computed(() => {
  if (!questionStore.selectedCard || !questionStore.cardQuestions) return [];
  const questions =
    questionStore.cardQuestions[
      questionStore.selectedCard as keyof typeof questionStore.cardQuestions
    ];
  return questions || [];
});

const updateAnswer = (questionNumber: number, event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const answer = target.value;
  answers.value[questionNumber] = answer;

  // Store에 저장
  if (questionStore.selectedCard) {
    questionStore.setAnswer(questionStore.selectedCard, questionNumber, answer);
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    // 기존 파일에 새 파일 추가 (중복 제거)
    newFiles.forEach((newFile) => {
      const isDuplicate = uploadedFiles.value.some(
        (existingFile) =>
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size
      );
      if (!isDuplicate) {
        uploadedFiles.value.push(newFile);
      }
    });
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    target.value = "";
  }
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const goBack = () => {
  router.push("/question");
};

const submitForm = () => {
  // 제출 로직
  console.log("제출된 답변:", answers.value);
  console.log("업로드된 파일:", uploadedFiles.value);
  router.push("/submit-complete");
};
</script>

<style scoped>
.question-form-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.question-form-content {
  flex: 1;

  width: 100%;
  margin: 0 auto;
  padding: 120px 20%;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 60px 0;
  text-align: left;
}

.question-section {
  margin-bottom: 60px;
}

.question-header {
  margin-bottom: 16px;
}

.question-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.question-section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
  margin-left: 8px;
}

.question-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0 20px 0;
}

.input-container {
  position: relative;
  margin-bottom: 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--surface-bg);
  transition: all 0.2s;
}

.input-container:focus-within {
  border-color: var(--primary-color);
  background-color: var(--primary-soft-bg);
}

.hint-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 20px;
  background-color: transparent;
  pointer-events: none;
  z-index: 1;
  overflow-y: auto;
  max-height: 100%;
}

.hint-subtext {
  margin-bottom: 16px;
}

.hint-line {
  font-size: 12px;
  color: var(--muted-text);
  line-height: 1.5;
  margin: 0 0 4px 0;
}

.hint-examples {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.hint-examples-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.hint-examples-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hint-example-item {
  font-size: 12px;
  color: var(--muted-text);
  line-height: 1.5;
  margin-bottom: 6px;
  padding-left: 12px;
  position: relative;
  white-space: pre-line;
}

.hint-example-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-size: 12px;
}

.hint-example-item:last-child {
  margin-bottom: 0;
}

.answer-input {
  width: 100%;
  min-height: 200px;
  padding: 16px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-color);
  background-color: transparent;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.answer-input:focus {
  outline: none;
}

.answer-input::placeholder {
  color: var(--subtle-text);
}

.character-count {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 12px;
  color: var(--subtle-text);
}

.section-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 40px 0;
}

.pdf-upload-section {
  margin-bottom: 60px;
  padding-top: 40px;
  border-top: 1px solid var(--border-color);
}

.pdf-upload-button {
  padding: 12px 24px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.pdf-upload-button:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-soft-bg);
}

.uploaded-files {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--surface-muted-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
}

.uploaded-file-item:hover {
  background-color: var(--secondary-bg);
}

.file-name {
  font-size: 14px;
  color: var(--text-color);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.file-delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--muted-text);
  transition: all 0.2s;
  flex-shrink: 0;
}

.file-delete-button:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
}

.file-delete-button .material-icons {
  font-size: 18px;
}

.form-buttons {
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
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

@media (max-width: 768px) {
  .question-form-content {
    padding: 40px 5%;
  }

  .form-buttons {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
