<template>
  <div class="insight-detail-view">
    <CommonHeader />
    <main class="detail-content">
      <div class="detail-container">
        <button @click="goBack" class="back-button">
          <span class="material-icons">arrow_back</span>
          목록으로
        </button>

        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>

        <div v-else-if="!insight" class="error-state">
          <p>게시물을 찾을 수 없습니다.</p>
          <button @click="goBack" class="back-button">목록으로 돌아가기</button>
        </div>

        <article v-else class="insight-article">
          <div class="article-header">
            <span class="article-category">{{ insight.category }}</span>
            <h1 class="article-title">{{ insight.title }}</h1>
            <div class="article-meta">
              <span class="article-date">{{
                formatDate(insight.createdAt)
              }}</span>
              <span v-if="insight.source" class="article-source">{{
                insight.source
              }}</span>
            </div>
          </div>

          <div class="article-content" v-html="sanitizedContent"></div>
        </article>
      </div>
    </main>
    <CommonFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import DOMPurify from "dompurify";
import CommonHeader from "../components/CommonHeader.vue";
import CommonFooter from "../components/CommonFooter.vue";

interface Insight {
  id: string;
  title: string;
  category: string;
  snippet: string;
  source?: string;
  imageUrl?: string;
  imageUrls?: string[];
  content?: string;
  createdAt: Date;
}

const router = useRouter();
const route = useRoute();
const insight = ref<Insight | null>(null);
const isLoading = ref(false);

// XSS 방지를 위한 HTML Sanitization
const sanitizedContent = computed(() => {
  if (!insight.value?.content) return "";
  return DOMPurify.sanitize(insight.value.content, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "div",
      "span",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
});

onMounted(async () => {
  const slugOrId = route.params.id as string;
  if (slugOrId) {
    await loadInsight(slugOrId);
  }
});

const loadInsight = async (slugOrId: string) => {
  if (!db) {
    console.error("Firestore가 초기화되지 않았습니다.");
    return;
  }

  isLoading.value = true;
  try {
    // 슬러그에서 ID 추출 (마지막 하이픈 뒤의 부분이 ID)
    // 형식: {slug}-{id} 또는 그냥 {id}
    let insightId = slugOrId;

    // 하이픈이 있고, 마지막 부분이 Firestore ID 형식인지 확인 (20자 이상)
    const parts = slugOrId.split("-");
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      // Firestore ID는 보통 20자 이상
      if (lastPart && lastPart.length >= 20) {
        insightId = lastPart;
      }
    }

    const insightDocRef = doc(db, "insights", insightId);
    const insightDoc = await getDoc(insightDocRef);

    if (insightDoc.exists()) {
      const data = insightDoc.data();
      insight.value = {
        id: insightDoc.id,
        title: data.title || "",
        category: data.category || "",
        snippet: data.snippet || "",
        source: data.source || "",
        imageUrl: data.imageUrl || "",
        imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []),
        content: data.content || "",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }
  } catch (error) {
    console.error("인사이트 로드 오류:", error);
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push("/insights");
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};
</script>

<style scoped>
.insight-detail-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: var(--text-color);
  transition: color 0.6s ease;
}

.detail-content {
  flex: 1;
  padding: 120px 0 80px;
}

.detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 32px;
}

.back-button:hover {
  background-color: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.back-button .material-icons {
  font-size: 20px;
}

.loading-state,
.error-state {
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

.insight-article {
  background-color: var(--surface-bg);
  border-radius: 12px;
  padding: 48px;
  border: 1px solid var(--border-color);
}

.article-header {
  margin-bottom: 32px;
}

.article-category {
  display: inline-block;
  padding: 6px 12px;
  background-color: var(--primary-soft-bg);
  color: var(--primary-color);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
  color: var(--muted-text);
}

.article-source {
  padding-left: 16px;
  border-left: 1px solid var(--border-color);
}

.article-thumbnail {
  width: 100%;
  max-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
  background-color: var(--secondary-bg);
}

.article-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-color);
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 24px 0;
}

.article-content :deep(p) {
  margin: 16px 0;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin: 32px 0 16px 0;
  color: var(--text-strong);
  font-weight: 700;
}

.article-content :deep(h1) {
  font-size: 28px;
}

.article-content :deep(h2) {
  font-size: 24px;
}

.article-content :deep(h3) {
  font-size: 20px;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin: 8px 0;
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 16px;
  margin: 24px 0;
  color: var(--muted-text);
  font-style: italic;
}

.article-content :deep(code) {
  background-color: var(--secondary-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.article-content :deep(pre) {
  background-color: var(--secondary-bg);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 24px 0;
}

.article-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.article-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 0 16px;
  }

  .insight-article {
    padding: 24px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-content {
    font-size: 15px;
  }
}
</style>
