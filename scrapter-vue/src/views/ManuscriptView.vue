<template>
  <div class="manuscript-view">
    <CommonHeader />
    <main class="manuscript-content page-enter">
      <div v-if="isLoadingManuscript" class="loading-container">
        <div class="loading-spinner"></div>
        <p>원고를 불러오는 중...</p>
      </div>
      <div v-else class="manuscript-layout">
        <!-- 왼쪽: 작성한 질문과 답변 -->
        <div class="manuscript-form-section">
          <h2 class="section-header">
            {{
              isViewMode
                ? "저장된 원고의 작성 내용입니다."
                : "아래 콘텐츠는 원고 생성에 직접 입력하신 정보입니다."
            }}
          </h2>

          <div
            v-for="question in currentQuestions"
            :key="question.number"
            class="question-answer-section"
          >
            <div class="question-number-label">{{ question.number }}.</div>
            <div class="question-content-wrapper">
              <h3 class="question-label">{{ question.question }}</h3>
              <textarea
                v-if="!isViewMode"
                v-model="answers[question.number]"
                class="answer-textarea"
                maxlength="400"
                @input="updateAnswer(question.number, $event)"
              ></textarea>
              <div v-else class="answer-display">
                {{ answers[question.number] || "답변이 없습니다." }}
              </div>
              <div v-if="!isViewMode" class="character-count">
                {{ (answers[question.number] || "").length }}/400
              </div>
            </div>
          </div>

          <div v-if="!isViewMode" class="form-buttons">
            <button class="btn-secondary" @click="goBack">이전으로</button>
            <button
              class="btn-generate"
              @click="generateManuscript"
              :disabled="isGenerating"
            >
              {{ isGenerating ? "생성 중..." : "원고 생성하기" }}
            </button>
            <button
              class="btn-primary"
              @click="saveManuscript"
              :disabled="!generatedManuscript"
            >
              원고저장
            </button>
          </div>
          <div v-else class="form-buttons">
            <button class="btn-secondary" @click="goBack">
              대시보드로 돌아가기
            </button>
            <button class="btn-primary" @click="enableEditMode">
              수정하기
            </button>
          </div>
        </div>

        <!-- 오른쪽: 원고 미리보기 -->
        <div class="manuscript-preview-section">
          <div class="preview-header-wrapper">
            <h2 class="preview-header">원고 미리보기</h2>
            <div v-if="generatedManuscript" class="download-buttons">
              <button
                class="btn-download"
                @click="downloadPDF"
                title="PDF 다운로드"
              >
                <span class="material-icons">picture_as_pdf</span>
                PDF
              </button>
              <button
                class="btn-download"
                @click="downloadDOC"
                title="DOC 다운로드"
              >
                <span class="material-icons">description</span>
                DOC
              </button>
            </div>
          </div>
          <div class="preview-content">
            <div
              v-if="generatedManuscript"
              class="manuscript-text"
              v-html="sanitizedManuscript"
            ></div>
            <p v-else class="preview-placeholder">
              원고가 생성되면 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuestionStore } from "../stores/question";
import { generateCompanyIntroduction } from "../services/geminiApi";
import { auth, db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import DOMPurify from "dompurify";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const questionStore = useQuestionStore();
const answers = ref<Record<number, string>>({});
const isGenerating = ref(false);
const generationError = ref<string>("");
const isViewMode = ref(false);
const savedManuscript = ref<string>("");
const isLoadingManuscript = ref(false);
const currentManuscriptId = ref<string | null>(null);

// Store에서 원고를 가져오는 computed (저장된 원고 모드일 경우 savedManuscript 우선)
const generatedManuscript = computed(() => {
  if (isViewMode.value && savedManuscript.value) {
    return savedManuscript.value;
  }
  return questionStore.getGeneratedManuscript();
});

// 원고 포맷팅: 모든 마크다운 제거, 제목 볼드 없이 처리
const formattedManuscript = computed(() => {
  if (!generatedManuscript.value) return "";

  let text = generatedManuscript.value;

  // 마크다운 제거 (시각화 가이드는 유지)
  text = text.replace(/\*\*/g, ""); // ** 제거
  text = text.replace(/##\s*/g, ""); // ## 제거
  text = text.replace(/#\s*/g, ""); // # 제거
  text = text.replace(/\*\s+/g, ""); // * 불릿 제거

  // 줄 단위로 분리
  const lines = text.split("\n");
  let result = "";
  let currentParagraph: string[] = [];
  let isFirstSection = true;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]?.trim() || "";

    // 마크다운 제거 (시각화 가이드는 유지)
    line = line.replace(/##\s*/g, "");
    line = line.replace(/#\s*/g, "");
    line = line.replace(/\*\*/g, "");
    line = line.replace(/\*\s+/g, "");

    // 제목인 경우 (숫자. 로 시작)
    if (/^\d+\.\s+/.test(line)) {
      // 이전 문단이 있으면 닫기
      if (currentParagraph.length > 0) {
        result += `<p>${currentParagraph.join(" ")}</p>\n`;
        currentParagraph = [];
      }

      // 첫 번째 섹션이 아니면 2줄 간격 추가 (내용 끝과 다음 제목 사이)
      if (!isFirstSection) {
        result += `<br/><div class="section-spacer"></div>\n`;
      }

      // 제목 추가 (볼드 처리)
      result += `<div class="manuscript-title"><strong>${line}</strong></div>\n`;

      // 제목 아래 간격 추가
      result += `<div class="title-spacer"></div>\n`;

      isFirstSection = false;
    } else if (line) {
      // 시각화 가이드가 포함된 경우 처리
      if (/\[시각화 가이드\]/.test(line)) {
        // 문단 내에 [시각화 가이드]가 포함되어 있는지 확인
        const parts = line.split(/\[시각화 가이드\]/);

        // [시각화 가이드] 앞에 텍스트가 있으면 문단에 추가
        if (parts[0] && parts[0].trim()) {
          currentParagraph.push(parts[0].trim());
        }

        // 이전 문단이 있으면 닫기
        if (currentParagraph.length > 0) {
          result += `<p>${currentParagraph.join(" ")}</p>\n`;
          currentParagraph = [];
        }

        // 시각화 가이드 추출 및 표시
        if (parts[1] && parts[1].trim()) {
          result += `<div class="visualization-guide">${parts[1].trim()}</div>\n`;
        } else {
          // [시각화 가이드]만 있는 경우
          const guideText = line.replace(/\[시각화 가이드\]\s*/, "").trim();
          if (guideText) {
            result += `<div class="visualization-guide">${guideText}</div>\n`;
          }
        }
      } else {
        // 일반 텍스트인 경우
        currentParagraph.push(line);
      }
    } else {
      // 빈 줄인 경우 - 문단 구분
      if (currentParagraph.length > 0) {
        result += `<p>${currentParagraph.join(" ")}</p>\n`;
        currentParagraph = [];
      }
    }
  }

  // 마지막 문단 처리
  if (currentParagraph.length > 0) {
    result += `<p>${currentParagraph.join(" ")}</p>`;
  }

  return result;
});

// XSS 방지를 위한 HTML Sanitization
const sanitizedManuscript = computed(() => {
  if (!formattedManuscript.value) return "";
  return DOMPurify.sanitize(formattedManuscript.value, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "div",
      "span",
    ],
    ALLOWED_ATTR: ["class", "style"],
  });
});

// 저장된 원고 로드
const loadSavedManuscript = async (manuscriptId: string) => {
  if (!db || !auth?.currentUser) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  isLoadingManuscript.value = true;

  try {
    const manuscriptDocRef = doc(db, "manuscripts", manuscriptId);
    const manuscriptDoc = await getDoc(manuscriptDocRef);

    if (!manuscriptDoc.exists()) {
      alert("원고를 찾을 수 없습니다.");
      router.push("/dashboard");
      return;
    }

    const data = manuscriptDoc.data();

    // 본인의 원고인지 확인
    if (data.userId !== auth.currentUser.uid) {
      alert("권한이 없습니다.");
      router.push("/dashboard");
      return;
    }

    // 저장된 답변과 원고 로드
    if (data.answers) {
      answers.value = data.answers;
    }

    if (data.manuscript) {
      savedManuscript.value = data.manuscript;
      questionStore.setGeneratedManuscript(data.manuscript);
    }

    // 선택한 카드 정보 설정
    if (data.selectedCard) {
      questionStore.selectedCard = data.selectedCard;
    }

    // 현재 원고 ID 저장
    currentManuscriptId.value = manuscriptId;
    isViewMode.value = true;
  } catch (error) {
    console.error("원고 로드 오류:", error);
    alert("원고를 불러오는 중 오류가 발생했습니다.");
    router.push("/dashboard");
  } finally {
    isLoadingManuscript.value = false;
  }
};

// 수정 모드 활성화
const enableEditMode = () => {
  isViewMode.value = false;
};

// 선택한 카드가 없으면 QuestionFormView로 리다이렉트
onMounted(async () => {
  // 세션 스토리지에서 ID 확인 (URL에 노출되지 않음)
  const editingManuscriptId = sessionStorage.getItem("editingManuscriptId");
  const viewingManuscriptId = sessionStorage.getItem("viewingManuscriptId");
  const manuscriptId = editingManuscriptId || viewingManuscriptId;

  if (manuscriptId) {
    await loadSavedManuscript(manuscriptId);
    // 수정 모드로 열었으면 편집 모드 활성화
    if (editingManuscriptId) {
      isViewMode.value = false;
    }
    // 사용 후 세션 스토리지에서 제거
    sessionStorage.removeItem("editingManuscriptId");
    sessionStorage.removeItem("viewingManuscriptId");
    return;
  }

  // 새 원고 작성 모드
  if (!questionStore.selectedCard) {
    router.push("/question-form");
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

const goBack = () => {
  if (isViewMode.value) {
    router.push("/dashboard");
  } else {
    router.push("/question-form");
  }
};

const generateManuscript = async () => {
  // 모든 질문에 답변이 있는지 확인
  if (!currentQuestions.value || currentQuestions.value.length === 0) {
    generationError.value = "질문 정보를 불러올 수 없습니다.";
    return;
  }

  const allAnswered = currentQuestions.value.every((q) => {
    const answer = answers.value[q.number];
    return answer && typeof answer === "string" && answer.trim().length > 0;
  });

  if (!allAnswered) {
    generationError.value = "모든 질문에 답변을 입력해주세요.";
    return;
  }

  isGenerating.value = true;
  generationError.value = "";
  questionStore.setGeneratedManuscript("");

  try {
    const extractedText = questionStore.getUploadedDocumentText();
    const manuscript = await generateCompanyIntroduction(
      answers.value,
      questionStore.selectedCard || 1,
      extractedText
    );
    questionStore.setGeneratedManuscript(manuscript);
  } catch (error) {
    console.error("원고 생성 오류:", error);
    generationError.value =
      error instanceof Error
        ? error.message
        : "원고 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
    questionStore.setGeneratedManuscript("");
  } finally {
    isGenerating.value = false;
  }
};

const saveManuscript = async () => {
  if (!auth?.currentUser || !db) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  if (!generatedManuscript.value) {
    alert("저장할 원고가 없습니다.");
    return;
  }

  if (!questionStore.selectedCard) {
    alert("선택한 카드 정보를 찾을 수 없습니다.");
    return;
  }

  try {
    const cardTitles: Record<number, string> = {
      1: "회사소개서",
      2: "IR / 사업계획서",
      3: "제품·서비스 소개서",
      4: "상세페이지 / 마케팅 콘텐츠",
    };

    const cardNumber = questionStore.selectedCard;
    const title = cardTitles[cardNumber] || "원고";
    const type = cardTitles[cardNumber] || "원고";

    // 유효기간: 생성일로부터 3년
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 3);

    const manuscriptData = {
      userId: auth.currentUser.uid,
      title: `${title} 제작`,
      type: type,
      status: "complete",
      answers: answers.value,
      manuscript: generatedManuscript.value,
      selectedCard: questionStore.selectedCard,
      createdAt: serverTimestamp(),
      validUntil: Timestamp.fromDate(validUntil),
    };

    // 수정 모드인 경우 기존 문서 업데이트, 아니면 새로 생성
    if (currentManuscriptId.value) {
      // 기존 문서 업데이트
      await setDoc(
        doc(db, "manuscripts", currentManuscriptId.value),
        manuscriptData,
        { merge: false } // 전체 교체
      );
      alert("원고가 수정되었습니다.");
    } else {
      // 새 문서 생성
      await setDoc(
        doc(db, "manuscripts", `${Date.now()}_${auth.currentUser.uid}`),
        manuscriptData
      );
      alert("원고가 저장되었습니다.");
    }

    router.push("/dashboard");
  } catch (error) {
    console.error("원고 저장 오류:", error);
    alert("원고 저장 중 오류가 발생했습니다.");
  }
};

// 원고를 일반 텍스트로 변환 (HTML 태그 제거)
const getPlainTextManuscript = (): string => {
  if (!generatedManuscript.value) return "";

  let text = generatedManuscript.value;

  // 마크다운 제거
  text = text.replace(/\*\*/g, "");
  text = text.replace(/##\s*/g, "");
  text = text.replace(/#\s*/g, "");
  text = text.replace(/\*\s+/g, "");

  // HTML 태그가 있다면 제거 (sanitizedManuscript에서)
  const tempDiv = document.createElement("div");
  // textContent만 사용하여 안전하게 텍스트 추출
  tempDiv.textContent = formattedManuscript.value;
  text = tempDiv.textContent || text;

  return text.trim();
};

// PDF 다운로드 (html2canvas를 사용하여 한글 지원)
const downloadPDF = async () => {
  if (!generatedManuscript.value) {
    alert("다운로드할 원고가 없습니다.");
    return;
  }

  try {
    // 원고 미리보기 요소 찾기
    const previewElement = document.querySelector(
      ".preview-content .manuscript-text"
    ) as HTMLElement;

    if (!previewElement) {
      alert("원고 내용을 찾을 수 없습니다.");
      return;
    }

    // 로딩 메시지
    const loadingMessage = document.createElement("div");
    loadingMessage.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px 40px; border-radius: 8px; z-index: 10000;";
    loadingMessage.textContent = "PDF 생성 중...";
    document.body.appendChild(loadingMessage);

    // html2canvas로 이미지 생성
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // PDF 생성
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 여백 설정 (좌우 15mm, 상하 10mm)
    const marginLeft = 15;
    const marginRight = 15;
    const marginTop = 10;
    const marginBottom = 10;

    const pageWidth = 210; // A4 너비 (mm)
    const pageHeight = 297; // A4 높이 (mm)
    const contentWidth = pageWidth - marginLeft - marginRight;
    const contentHeight = pageHeight - marginTop - marginBottom;

    // 이미지 비율에 맞게 크기 조정
    const imgAspectRatio = canvas.width / canvas.height;
    let imgWidth = contentWidth;
    let imgHeight = contentWidth / imgAspectRatio;

    // 이미지가 한 페이지보다 큰 경우 여러 페이지로 분할
    if (imgHeight <= contentHeight) {
      // 한 페이지에 들어가는 경우
      pdf.addImage(imgData, "PNG", marginLeft, marginTop, imgWidth, imgHeight);
    } else {
      // 여러 페이지가 필요한 경우
      let heightLeft = imgHeight;
      let positionY = marginTop;

      while (heightLeft > 0) {
        const pageImgHeight = Math.min(contentHeight, heightLeft);
        const sourceY = imgHeight - heightLeft;
        const sourceHeight = (pageImgHeight / imgHeight) * canvas.height;

        // 캔버스를 잘라서 각 페이지에 추가
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext("2d");

        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0,
            (sourceY / imgHeight) * canvas.height,
            canvas.width,
            sourceHeight,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          pdf.addImage(
            pageImgData,
            "PNG",
            marginLeft,
            positionY,
            imgWidth,
            pageImgHeight
          );
        }

        heightLeft -= contentHeight;

        if (heightLeft > 0) {
          pdf.addPage();
          positionY = marginTop;
        }
      }
    }

    // 파일명 생성
    const cardTitles: Record<number, string> = {
      1: "회사소개서",
      2: "IR_사업계획서",
      3: "제품서비스소개서",
      4: "상세페이지마케팅콘텐츠",
    };
    const cardNumber = questionStore.selectedCard || 1;
    const fileName = `${cardTitles[cardNumber]}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // 로딩 메시지 제거
    document.body.removeChild(loadingMessage);

    pdf.save(fileName);
  } catch (error) {
    console.error("PDF 다운로드 오류:", error);
    alert("PDF 다운로드 중 오류가 발생했습니다.");
    // 로딩 메시지 제거 (에러 발생 시)
    const loadingMessage = document.querySelector(
      "div[style*='position: fixed']"
    );
    if (loadingMessage) {
      document.body.removeChild(loadingMessage);
    }
  }
};

// DOC 다운로드
const downloadDOC = async () => {
  if (!generatedManuscript.value) {
    alert("다운로드할 원고가 없습니다.");
    return;
  }

  try {
    const text = getPlainTextManuscript();
    const lines = text.split("\n");

    // DOCX 문서 생성
    const children: Paragraph[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        // 빈 줄
        children.push(new Paragraph({ text: "" }));
        return;
      }

      // 제목인 경우 (숫자. 로 시작)
      if (/^\d+\.\s+/.test(trimmedLine)) {
        children.push(
          new Paragraph({
            text: trimmedLine,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        );
      } else if (/\[시각화 가이드\]/.test(trimmedLine)) {
        // 시각화 가이드는 이탤릭체로
        const guideText = trimmedLine.replace(/\[시각화 가이드\]\s*/, "");
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: guideText,
                italics: true,
              }),
            ],
            spacing: { before: 100, after: 200 },
          })
        );
      } else {
        // 일반 텍스트
        children.push(
          new Paragraph({
            text: trimmedLine,
            spacing: { after: 100 },
          })
        );
      }
    });

    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    // 파일명 생성
    const cardTitles: Record<number, string> = {
      1: "회사소개서",
      2: "IR_사업계획서",
      3: "제품서비스소개서",
      4: "상세페이지마케팅콘텐츠",
    };
    const cardNumber = questionStore.selectedCard || 1;
    const fileName = `${cardTitles[cardNumber]}_${
      new Date().toISOString().split("T")[0]
    }.docx`;

    // Blob 생성 및 다운로드
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("DOC 다운로드 오류:", error);
    alert("DOC 다운로드 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.manuscript-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.manuscript-content {
  flex: 1;

  width: 100%;
  margin: 0 auto;
  padding: 120px 10%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.loading-container p {
  color: var(--muted-text);
  font-size: 16px;
}

.manuscript-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.manuscript-form-section {
  min-width: 0;
}

.section-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 40px 0;
}

.question-answer-section {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  padding-bottom: 40px;
}

.question-answer-section:last-of-type {
  margin-bottom: 0;
  padding-bottom: 0;
}

.question-number-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  flex-shrink: 0;
  width: 32px;
}

.question-content-wrapper {
  flex: 1;
  min-width: 0;
}

.question-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px 0;
}

.answer-textarea {
  width: 100%;
  min-height: 150px;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-color);
  background-color: var(--surface-bg);
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.2s;
}

.answer-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: var(--primary-soft-bg);
}

.character-count {
  text-align: right;
  font-size: 12px;
  color: var(--subtle-text);
  margin-top: 8px;
}

.answer-display {
  width: 100%;
  min-height: 150px;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-color);
  background-color: var(--surface-bg);
  box-sizing: border-box;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 40px;
  margin-top: 40px;
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

.manuscript-preview-section {
  position: sticky;
  top: 120px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 28px;
  min-height: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.manuscript-preview-section:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.preview-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 12px;
}

.preview-header {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
  letter-spacing: -0.02em;
}

.download-buttons {
  display: flex;
  gap: 8px;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover {
  background-color: #e88d4f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 119, 0, 0.3);
}

.btn-download .material-icons {
  font-size: 18px;
}

.preview-content {
  min-height: 300px;
  max-height: 70vh;
  padding: 32px 28px;
  background-color: var(--surface-muted-bg);
  border-radius: 12px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-placeholder {
  font-size: 14px;
  color: var(--subtle-text);
  text-align: center;
  margin: 0;
  padding: 40px 0;
}

.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.generating-state p {
  color: var(--muted-text);
  font-size: 14px;
  margin: 0;
}

.manuscript-text {
  color: var(--text-color);
  font-size: 15px;
  line-height: 1.9;
  word-wrap: break-word;
  letter-spacing: -0.01em;
}

.manuscript-text p {
  margin: 0 0 20px 0;
  text-align: justify;
}

.manuscript-text p:last-child {
  margin-bottom: 0;
}

.manuscript-text .manuscript-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 20px 0;
  line-height: 1.4;
  display: block;
  font-family: inherit;
  letter-spacing: -0.02em;
}

.manuscript-text .manuscript-title strong {
  font-weight: 700;
  color: var(--text-strong);
}

.manuscript-text .manuscript-title:first-child {
  margin-top: 0;
}

.manuscript-text .section-spacer {
  height: 3em;
  display: block;
  margin: 0;
  padding: 0;
}

.manuscript-text .title-spacer {
  height: 1.5em;
  display: block;
  margin: 0;
  padding: 0;
}

.manuscript-text .visualization-guide {
  font-size: 13px;
  font-style: italic;
  color: var(--muted-text);
  margin: 12px 0 20px 0;
  padding-left: 16px;
  border-left: 3px solid var(--primary-color);
  line-height: 1.6;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.retry-button {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background-color: #e88d4f;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.btn-generate {
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

.btn-generate:hover:not(:disabled) {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .manuscript-layout {
    grid-template-columns: 1fr;
  }

  .manuscript-preview-section {
    position: static;
    margin-top: 40px;
  }
}

@media (max-width: 768px) {
  .manuscript-content {
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
