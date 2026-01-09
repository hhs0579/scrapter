<script setup lang="ts">
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";
</script>

<template>
  <div class="user-guide">
    <CommonHeader />
    <main class="main-content">
      <section class="guide-hero">
        <h1 class="guide-title">사용 가이드</h1>
        <p class="guide-subtitle">
          Scrapter를 더 효과적으로 활용하는 방법을 알아보세요
        </p>
      </section>

      <section class="guide-section">
        <h2 class="section-title">시작하기</h2>
        <div class="guide-content">
          <div class="guide-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>질문 선택</h3>
              <p>
                지금 상황에 가장 가까운 질문을 하나 선택하세요. 각 질문은 특정
                문서 유형에 맞춰져 있습니다.
              </p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>답변 작성</h3>
              <p>
                선택한 질문에 대한 답변을 작성하세요. 자세할수록 더 정확한
                문서가 생성됩니다.
              </p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>문서 확인</h3>
              <p>
                질문에 답하는 것만으로 어떤 문서가 만들어지는지 미리 확인할 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="guide-section">
        <h2 class="section-title">주요 기능</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">📝</div>
            <h3>다양한 문서 유형</h3>
            <p>
              회사소개서, IR 자료, 제품소개서, 상세페이지 등 다양한 문서를
              생성할 수 있습니다.
            </p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h3>빠른 생성</h3>
            <p>
              복잡한 기획 과정 없이 질문에 답하는 것만으로 문서를 빠르게 생성할
              수 있습니다.
            </p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <h3>상황별 맞춤</h3>
            <p>
              현재 상황에 가장 적합한 질문을 선택하여 맞춤형 문서를 생성할 수
              있습니다.
            </p>
          </div>
        </div>
      </section>

      <section class="guide-section">
        <h2 class="section-title">자주 묻는 질문</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-question">어떤 문서를 만들 수 있나요?</h3>
            <p class="faq-answer">
              회사소개서, IR 자료, 제품소개서, 상세페이지 등 다양한 문서를
              생성할 수 있습니다.
            </p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">답변은 얼마나 자세히 작성해야 하나요?</h3>
            <p class="faq-answer">
              답변이 자세할수록 더 정확하고 완성도 높은 문서가 생성됩니다.
              가능한 한 구체적으로 작성해주세요.
            </p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">생성된 문서를 수정할 수 있나요?</h3>
            <p class="faq-answer">
              네, 생성된 문서는 언제든지 수정하고 편집할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
    <CommonFooter />
  </div>
</template>

<style scoped>
.user-guide {
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

  width: 100%;
  margin: 0 auto;
  padding: 60px 20%;
}

.guide-hero {
  text-align: center;
  margin-bottom: 80px;
  padding: 40px 0;
}

.guide-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, var(--primary-color), #ff9933);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guide-subtitle {
  font-size: 1.25rem;
  opacity: 0.8;
  margin: 0;
}

.guide-section {
  margin-bottom: 80px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 40px 0;
  color: var(--text-color);
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.guide-step {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 32px;
  background-color: var(--secondary-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.guide-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), #ff9933);
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 700;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-color);
}

.step-content p {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-item {
  padding: 32px;
  background-color: var(--secondary-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.feature-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-color);
}

.feature-item p {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.8;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.faq-item {
  padding: 24px;
  background-color: var(--secondary-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.faq-question {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-color);
}

.faq-answer {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .main-content {
    padding: 40px 5%;
  }

  .guide-title {
    font-size: 2rem;
  }

  .guide-subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .guide-step {
    flex-direction: column;
    text-align: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>

