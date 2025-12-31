<template>
  <div class="user-guide-view">
    <CommonHeader />
    <main class="main-content">
      <div class="content-wrapper">
        <h1 class="page-title">사용가이드</h1>
        <p class="description">Scrapter 사용 방법을 안내합니다.</p>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";
</script>

<style scoped>
.user-guide-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.content-wrapper {
  text-align: center;
  max-width: 800px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
}

.description {
  font-size: 18px;
  color: #666;
  margin: 0;
}
</style>
