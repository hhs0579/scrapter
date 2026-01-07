<template>
  <div class="app-view">
    <CommonHeader />
    <main class="main-content page-enter">
      <!-- 상단 섹션 -->
      <section class="top-section">
        <div class="info-box">
          <div class="illustration">
            <img src="/1.png" alt="일러스트" class="illustration-image" />
          </div>
          <div class="info-text">
            <p>
              질문에 답하는 것만으로 어떤 문서가<br />만들어지는지 미리 확인
              보세요.
            </p>
          </div>
          <button class="info-button">스크랩터를 더 잘 활용하는 방법</button>
        </div>
      </section>

      <!-- 하단 섹션 -->
      <section class="bottom-section">
        <h2 class="section-title">
          지금 상황에 가장 가까운 질문을 하나 골라주세요.
        </h2>
        <div class="cards-grid">
          <div class="card" @click="handleCardClick(1)">
            <div class="card-icon">
              <span class="material-icons">menu_book</span>
            </div>
            <h3 class="card-title">
              사업이나 브랜드를 처음 정리하는 단계예요!
            </h3>
            <p class="card-description">
              법인은 만들었지만, 우리 회사가 어떤 곳인지<br />말로 설명하기
              어려운 상태라면
            </p>
          </div>
          <div class="card" @click="handleCardClick(2)">
            <div class="card-icon">
              <span class="material-icons">menu_book</span>
            </div>
            <h3 class="card-title">투자자나 외부에 설명할 자료가 필요해요!</h3>
            <p class="card-description">
              투자 미팅이나 제안서를 앞두고<br />사업 구조를 논리적으로 정리해야
              하는 상황이라면
            </p>
          </div>
          <div class="card" @click="handleCardClick(3)">
            <div class="card-icon">
              <span class="material-icons">menu_book</span>
            </div>
            <h3 class="card-title">
              제품·서비스의 강점을 정리해 보여주고 싶어요!
            </h3>
            <p class="card-description">
              제품은 있지만한 장으로<br />설명할 자료가 없는 상태라면
            </p>
          </div>
          <div class="card" @click="handleCardClick(4)">
            <div class="card-icon">
              <span class="material-icons">menu_book</span>
            </div>
            <h3 class="card-title">
              웹사이트나 마케팅에 사용할 콘텐츠가 필요해요
            </h3>
            <p class="card-description">
              홈페이지나 상세페이지에 들어갈<br />문장과 흐름이 아직 정리되지
              않았다면
            </p>
          </div>
        </div>
      </section>
    </main>
    <CommonFooter />

    <!-- 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <button class="modal-close" @click.stop="closeModal">
        <span class="material-icons">close</span>
      </button>
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">어떤 자료를 만드시나요?</h2>
        <p class="modal-subtitle">
          만들어질 자료:
          <span class="material-highlight">{{ selectedMaterial }}</span>
        </p>
        <p class="modal-description">
          선택한 질문에 따라 목적에 맞는 문서 초안이 자동으로 만들어집니다.<br />
          질문에 답하는 것만으로 초안을 완성할 수 있어요.
        </p>
        <ul class="modal-features">
          <li>{{ modalFeatures.description }}</li>
          <li>{{ modalFeatures.usage }}</li>
        </ul>
        <div class="modal-buttons">
          <button class="modal-button secondary" @click="closeModal">
            나중에 할게요
          </button>
          <button class="modal-button primary" @click="startCreating">
            네, 시작할게요!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuestionStore } from "../stores/question";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const router = useRouter();
const questionStore = useQuestionStore();

const showModal = ref(false);
const selectedCard = ref<number | null>(null);

// 카드별 문서 유형 정보
const cardMaterials = {
  1: {
    material: "회사소개서 / 브랜드 소개서",
    description:
      "회사 개요, 비전, 사업 내용을 정리한 회사소개서 초안이 생성됩니다.",
    usage: "웹사이트 소개, 제안서, 이메일 첨부 등에도 바로 활용할 수 있습니다.",
  },
  2: {
    material: "IR / 사업계획서",
    description:
      "투자자와 외부 이해관계자에게 제시할 IR 자료 및 사업계획서 초안이 생성됩니다.",
    usage: "투자 미팅, 제안서, 사업 설명 자료로 활용할 수 있습니다.",
  },
  3: {
    material: "제품·서비스 소개서",
    description:
      "제품과 서비스의 핵심 가치와 강점을 정리한 소개서 초안이 생성됩니다.",
    usage: "제품 홍보, 고객 제안, 마케팅 자료로 활용할 수 있습니다.",
  },
  4: {
    material: "상세페이지 / 마케팅 콘텐츠",
    description:
      "웹사이트와 마케팅에 바로 사용할 수 있는 콘텐츠 초안이 생성됩니다.",
    usage:
      "홈페이지, 상세페이지, 광고 문구 등 다양한 마케팅 채널에 활용할 수 있습니다.",
  },
};

const selectedMaterial = computed(() => {
  if (!selectedCard.value) return "";
  return (
    cardMaterials[selectedCard.value as keyof typeof cardMaterials]?.material ||
    ""
  );
});

const modalFeatures = computed(() => {
  if (!selectedCard.value) {
    return { description: "", usage: "" };
  }
  return (
    cardMaterials[selectedCard.value as keyof typeof cardMaterials] || {
      description: "",
      usage: "",
    }
  );
});

const handleCardClick = (cardNumber: number) => {
  selectedCard.value = cardNumber;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCard.value = null;
};

const startCreating = () => {
  if (selectedCard.value) {
    // 상태 저장
    questionStore.setSelectedCard(selectedCard.value);
    questionStore.setCurrentStep(1);
    closeModal();
    router.push("/question");
  }
};
</script>

<style scoped>
.app-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  padding: 120px 25%;
  z-index: 1;
  margin: 0 auto;
  width: 100%;
}

/* 상단 섹션 */
.top-section {
  margin-bottom: 60px;
}

.info-box {
  background-color: var(--secondary-bg);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 40px;
}

.illustration {
  flex-shrink: 0;
}

.illustration-image {
  width: 200px;
  height: auto;
  object-fit: contain;
}

.info-text {
  flex: 1;
  font-weight: 600;
  font-size: 18px;
}

.info-text p {
  font-size: 18px;
  color: var(--text-color);
  margin: 0;
  line-height: 1.6;
  font-weight: 600;
}

.info-button {
  padding: 12px 24px;
  background-color: var(--surface-bg);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  white-space: nowrap;
}

.info-button:hover {
  background-color: #e88d4f;
  color: white;
}

/* 하단 섹션 */
.bottom-section {
  margin-top: 60px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 40px;
  text-align: left;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.card {
  background-color: var(--secondary-bg);
  border-radius: 12px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fade-up 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.card:nth-child(1) {
  animation-delay: 80ms;
}
.card:nth-child(2) {
  animation-delay: 140ms;
}
.card:nth-child(3) {
  animation-delay: 200ms;
}
.card:nth-child(4) {
  animation-delay: 260ms;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background-color: var(--hover-bg);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none !important;
  }
}

.card-icon {
  margin-bottom: 20px;
}

.card-icon .material-icons {
  font-size: 48px;
  color: #f59e61;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.card-description {
  font-size: 14px;
  color: var(--muted-text);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .info-box {
    flex-direction: column;
    text-align: center;
  }

  .info-text {
    order: 2;
  }

  .info-button {
    order: 3;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 5%;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .info-box {
    padding: 24px;
  }

  .illustration-image {
    width: 150px;
  }

  .section-title {
    font-size: 20px;
  }
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: var(--surface-bg);
  border-radius: 16px;
  padding: 40px;
  max-width: 660px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: fixed;
  top: calc(50vh - 240px);
  right: calc(50vw - 345px);

  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: opacity 0.2s;
  z-index: 1001;
}

@media (max-width: 720px) {
  .modal-close {
    top: 20px;
    right: 20px;
    transform: none;
  }
}

.modal-close:hover {
  opacity: 0.8;
}

.modal-close .material-icons {
  font-size: 28px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 10px 0;
  text-align: center;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--text-color);
  margin: 0 0 10px 0;
  font-weight: 600;
  text-align: center;
}

.material-highlight {
  color: #ff7700;
}

.modal-description {
  font-size: 12px;
  color: var(--muted-text);
  line-height: 1.2;
  margin: 0 0 10px 0;
  text-align: center;
}

.modal-features {
  list-style: none;
  padding: 20px 24px;
  margin: 0 0 32px 0;
  background-color: var(--surface-muted-bg);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.modal-features li {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1.6;
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
}

.modal-features li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #ff7700;
  font-size: 20px;
  line-height: 1.2;
}

.modal-features li:last-child {
  margin-bottom: 0;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.modal-button {
  flex: 1;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-button.secondary {
  background-color: var(--secondary-bg);
  color: var(--muted-text);
}

.modal-button.secondary:hover {
  background-color: var(--hover-bg);
}

.modal-button.primary {
  background-color: #ff7700;
  color: white;
}

.modal-button.primary:hover {
  background-color: #e88d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
}

@media (max-width: 768px) {
  .modal-content {
    padding: 32px 24px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .modal-button {
    width: 100%;
  }
}
</style>
