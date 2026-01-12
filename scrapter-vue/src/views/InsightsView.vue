<template>
  <div class="insights-view">
    <CommonHeader />
    <div class="insights-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          문서를 더 잘 쓰기 위한<br />
          기준과 사례 인사이트
        </h1>
        <p class="hero-subtitle">
          문서 작성에 필요로한 여러 실제 사례와 함께 정리된 인사이트 자료를
          제공합니다.
        </p>
      </div>
    </div>
    <main class="insights-content">
      <div class="insights-container">
        <div class="insights-header">
          <div class="category-tabs">
            <button
              @click="selectedCategory = ''"
              class="category-tab"
              :class="{ active: selectedCategory === '' }"
            >
              전체
            </button>
            <button
              @click="selectedCategory = '창업 인사이트'"
              class="category-tab"
              :class="{ active: selectedCategory === '창업 인사이트' }"
            >
              창업 인사이트
            </button>
            <button
              @click="selectedCategory = '투자유치 전략'"
              class="category-tab"
              :class="{ active: selectedCategory === '투자유치 전략' }"
            >
              투자유치 전략
            </button>
            <button
              @click="selectedCategory = '트렌드 뉴스'"
              class="category-tab"
              :class="{ active: selectedCategory === '트렌드 뉴스' }"
            >
              트렌드 뉴스
            </button>
          </div>

          <div class="view-controls">
            <button
              @click="setViewType('grid')"
              class="view-button"
              :class="{ active: viewType === 'grid' }"
              title="그리드 보기"
            >
              <span class="material-icons">grid_view</span>
            </button>
            <button
              @click="setViewType('list')"
              class="view-button"
              :class="{ active: viewType === 'list' }"
              title="리스트 보기"
            >
              <span class="material-icons">view_list</span>
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>

        <div v-else-if="filteredInsights.length === 0" class="empty-state">
          <p>인사이트가 없습니다.</p>
        </div>

        <div
          v-else
          :class="['insights-grid', { 'list-view': viewType === 'list' }]"
        >
          <div
            v-for="insight in filteredInsights"
            :key="insight.id"
            class="insight-card"
            @click="viewInsight(insight)"
          >
            <div class="card-image-container">
              <button
                @click.stop="toggleLike(insight.id)"
                class="like-button"
                :class="{ liked: likedInsights.has(insight.id) }"
              >
                <span class="material-icons">{{
                  likedInsights.has(insight.id) ? "favorite" : "favorite_border"
                }}</span>
              </button>
              <img
                v-if="insight.imageUrl"
                :src="insight.imageUrl"
                :alt="insight.title"
                class="card-image"
                @error="handleImageError"
              />
              <div v-else class="card-image-placeholder">
                <span class="material-icons">article</span>
              </div>
              <div class="card-overlay">
                <span class="card-overlay-text">{{ insight.title }}</span>
              </div>
            </div>
            <div class="card-content">
              <span class="card-category">{{ insight.category }}</span>
              <h3 class="card-title">{{ insight.title }}</h3>
              <p class="card-snippet">{{ insight.snippet }}</p>
              <p v-if="insight.source" class="card-source">
                {{ insight.source }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

interface Insight {
  id: string;
  title: string;
  category: string;
  snippet: string;
  source?: string;
  imageUrl?: string;
  content?: string;
  createdAt: Date;
}

const router = useRouter();
const insights = ref<Insight[]>([]);
const isLoading = ref(false);
const viewType = ref<"grid" | "list">("grid");
const selectedCategory = ref<string>("");
const likedInsights = ref<Set<string>>(new Set());

onMounted(async () => {
  await loadLikedInsights();
  await loadInsights();
  // 로컬 스토리지에서 뷰 타입 불러오기
  const savedViewType = localStorage.getItem("insightsViewType");
  if (savedViewType === "list" || savedViewType === "grid") {
    viewType.value = savedViewType;
  }
});

const setViewType = (type: "grid" | "list") => {
  viewType.value = type;
  localStorage.setItem("insightsViewType", type);
};

const filteredInsights = computed(() => {
  if (!selectedCategory.value) {
    return insights.value;
  }
  return insights.value.filter(
    (insight) => insight.category === selectedCategory.value
  );
});

const loadInsights = async () => {
  if (!db) {
    console.error("Firestore가 초기화되지 않았습니다.");
    return;
  }

  isLoading.value = true;
  try {
    const insightsRef = collection(db, "insights");
    const q = query(insightsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    insights.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        category: data.category || "",
        snippet: data.snippet || "",
        source: data.source || "",
        imageUrl: data.imageUrl || "",
        content: data.content || "",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("인사이트 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
};

// 제목을 슬러그로 변환하는 함수
const createSlug = (title: string, id: string): string => {
  // 한글, 영문, 숫자, 공백만 허용하고 나머지 제거
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-가-힣]/g, "") // 특수문자 제거
    .replace(/\s+/g, "-") // 공백을 하이픈으로
    .replace(/-+/g, "-") // 연속된 하이픈을 하나로
    .trim();

  // 슬러그가 너무 길면 자르기 (50자 제한)
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
  }

  // 슬러그가 비어있으면 ID 사용
  if (!slug) {
    return id;
  }

  // ID를 뒤에 추가하여 고유성 보장
  return `${slug}-${id}`;
};

const viewInsight = (insight: Insight) => {
  const slug = createSlug(insight.title, insight.id);
  router.push(`/insights/${slug}`);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
  if (img.parentElement) {
    const placeholder = img.parentElement.querySelector(
      ".card-image-placeholder"
    );
    if (placeholder) {
      (placeholder as HTMLElement).style.display = "flex";
    }
  }
};

const loadLikedInsights = async () => {
  if (!auth?.currentUser || !db) return;

  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const liked = userData.likedInsights || [];
      likedInsights.value = new Set(liked);
    }
  } catch (error) {
    console.error("좋아요 목록 로드 오류:", error);
  }
};

const toggleLike = async (insightId: string) => {
  if (!auth?.currentUser || !db) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const isLiked = likedInsights.value.has(insightId);

    if (isLiked) {
      // 좋아요 취소
      await updateDoc(userDocRef, {
        likedInsights: arrayRemove(insightId),
      });
      likedInsights.value.delete(insightId);
    } else {
      // 좋아요 추가
      await updateDoc(userDocRef, {
        likedInsights: arrayUnion(insightId),
      });
      likedInsights.value.add(insightId);
    }
  } catch (error) {
    console.error("좋아요 토글 오류:", error);
    alert("좋아요 처리 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.insights-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
}

.insights-hero {
  background: linear-gradient(180deg, #fffcf9 0%, #fef5f0 100%);

  padding: 80px 0;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
  text-align: center;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.hero-subtitle {
  font-size: 14px;
  color: #5d5d5d;
  margin: 0;
  line-height: 1.6;
}

.insights-content {
  flex: 1;
  padding: 80px 0;
}

.insights-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 16px;
}

.category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.category-tab {
  padding: 10px 20px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
}

.category-tab.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
}

.view-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.view-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
}

.view-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
}

.view-button.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.view-button .material-icons {
  font-size: 20px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: var(--muted-text);
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

.insights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.insights-grid.list-view {
  grid-template-columns: 1fr;
  gap: 16px;
}

.insight-card {
  background-color: var(--surface-bg);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.insights-grid.list-view .insight-card {
  flex-direction: row;
  max-height: 200px;
}

.insight-card:hover {
  transform: translateY(-4px);

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: var(--secondary-bg);
}

.like-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.like-button:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.like-button .material-icons {
  font-size: 24px;
  color: var(--muted-text);
  transition: color 0.2s;
}

.like-button.liked .material-icons {
  color: var(--primary-color);
}

.like-button.liked {
  background-color: rgba(255, 119, 0, 0.1);
}

.insights-grid.list-view .card-image-container {
  width: 300px;
  flex-shrink: 0;
  height: 200px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-image-placeholder .material-icons {
  font-size: 64px;
  opacity: 0.5;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.insight-card:hover .card-overlay {
  opacity: 1;
}

.card-overlay-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-category {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-snippet {
  font-size: 14px;
  color: var(--text-color);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.insights-grid.list-view .card-snippet {
  -webkit-line-clamp: 2;
}

.card-source {
  font-size: 12px;
  color: var(--muted-text);
  margin: 0;
  margin-top: auto;
}

@media (max-width: 1200px) {
  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .insights-hero {
    padding: 60px 0;
  }

  .hero-content {
    padding: 0 4%;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .insights-container {
    padding: 0 4%;
  }

  .insights-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid.list-view .insight-card {
    flex-direction: column;
    max-height: none;
  }

  .insights-grid.list-view .card-image-container {
    width: 100%;
  }
}
</style>
