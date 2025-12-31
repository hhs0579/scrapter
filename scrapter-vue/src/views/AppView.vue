<template>
  <div class="app-view">
    <CommonHeader />
    <main class="main-content">
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
              법인은 만들었지만, 우리 회사가 어떤 곳인지 말로 설명하기 어려운
              상태라면
            </p>
          </div>
          <div class="card" @click="handleCardClick(2)">
            <div class="card-icon">
              <span class="material-icons">menu_book</span>
            </div>
            <h3 class="card-title">투자자나 외부에 설명할 자료가 필요해요!</h3>
            <p class="card-description">
              투자 미팅이나 제안서를 앞두고 사업 구조를 논리적으로 정리해야 하는
              상황이라면
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
              제품은 있지만한 장으로 설명할 자료가 없는 상태라면
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
              홈페이지나 상세페이지에 들어갈 문장과 흐름이 아직 정리되지
              않았다면
            </p>
          </div>
        </div>
      </section>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

const handleCardClick = (cardNumber: number) => {
  console.log(`Card ${cardNumber} clicked`);
  // 카드 클릭 시 처리 로직 추가
};
</script>

<style scoped>
.app-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.main-content {
  flex: 1;
  padding: 40px 10%;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 상단 섹션 */
.top-section {
  margin-bottom: 60px;
}

.info-box {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 40px;
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
  font-size: 18;
}

.info-text p {
  font-size: 18px;
  color: #333;
  margin: 0;
  line-height: 1.6;
}

.info-button {
  padding: 12px 24px;
  background-color: #f59e61;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.info-button:hover {
  background-color: #e88d4f;
}

/* 하단 섹션 */
.bottom-section {
  margin-top: 60px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 40px;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.card {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background-color: #eeeeee;
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
  color: #333;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.card-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
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
</style>
