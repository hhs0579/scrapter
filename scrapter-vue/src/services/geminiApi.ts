import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

// API 키 캐싱 (한 번만 읽어오기)
let cachedApiKey: string | null = null;

/**
 * API 키 캐시를 초기화합니다 (새로운 API 키로 변경 시 사용)
 */
export function clearApiKeyCache(): void {
  cachedApiKey = null;
  console.log("🔄 API 키 캐시 초기화됨");
}

/**
 * Gemini API 키를 가져옵니다.
 * @param forceRefresh 캐시를 무시하고 새로 가져올지 여부
 * @returns Gemini API 키 또는 빈 문자열
 */
async function getGeminiApiKey(forceRefresh: boolean = false): Promise<string> {
  // 강제 새로고침이 아니고 캐시된 API 키가 있으면 반환
  if (!forceRefresh && cachedApiKey) {
    console.log("✅ 캐시된 API 키 사용");
    return cachedApiKey;
  }

  try {
    // 환경 변수에서 먼저 확인 (우선순위 1)
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envApiKey && envApiKey.trim() !== "") {
      console.log("✅ 환경 변수에서 API 키 사용");
      cachedApiKey = envApiKey;
      return envApiKey;
    }

    // 코드에 직접 설정된 API 키 확인 (우선순위 2 - 개발용)
    // ⚠️ 주의: 프로덕션에서는 환경 변수 사용을 권장합니다
    const directApiKey = "AIzaSyB8mkSz_j7gpv7_xYwANn5LLt6nMCeFAXc";
    if (directApiKey && directApiKey.trim() !== "") {
      console.log("✅ 코드에서 직접 설정된 API 키 사용");
      console.log(
        "🔑 API 키 (처음 10자):",
        directApiKey.substring(0, 10) + "..."
      );
      cachedApiKey = directApiKey;
      return directApiKey;
    }

    // Firestore에서 API 키 읽기 (우선순위 3 - 선택사항)
    if (db) {
      try {
        console.log("📖 Firestore에서 API 키 읽기 시도...");
        const configDocRef = doc(db, "config", "geminiApiKey");
        const configDoc = await getDoc(configDocRef);

        if (configDoc.exists()) {
          const data = configDoc.data();
          const apiKey = data?.key || data?.apiKey || "";

          if (apiKey && apiKey.trim() !== "") {
            cachedApiKey = apiKey;
            console.log("✅ Firestore에서 API 키 가져오기 성공");
            return apiKey;
          }
        }
      } catch (firestoreError) {
        console.warn(
          "⚠️ Firestore에서 API 키 읽기 실패 (무시됨):",
          firestoreError
        );
      }
    }

    // 모든 방법 실패
    console.error("❌ API 키를 찾을 수 없습니다.");
    return "";
  } catch (error) {
    console.error("❌ Gemini API 키 가져오기 오류:", error);
    if (error instanceof Error) {
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
    }
    return "";
  }
}

// Gemini API 엔드포인트 베이스 URL
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// 사용할 모델 (gemini-1.5-pro 또는 gemini-1.5-flash)
const MODEL = "gemini-2.5-flash";

interface GeminiGenerateContentRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
    finishMessage?: string;
  }>;
  error?: {
    message: string;
    code?: number;
    status?: string;
  };
}

// 카드별 프롬프트 생성 함수
function getPromptForCard(
  cardNumber: number,
  answers: Record<number, string>,
  extractedText?: string
): string {
  if (cardNumber === 1) {
    // 회사소개서 프롬프트
    const basePrompt = `당신은 회사소개서 전문 카피라이터이자, 기업 문서 구조 설계에 특화된 콘텐츠 디렉터입니다.
아래에 제공되는 6개의 질문과 답변을 기반으로, 외부 이해관계자(투자자, 파트너, 고객 등)가 읽는 공식 회사소개서 원고를 작성하세요. 이 문서는 홍보용 글이 아니라, 회사의 맥락과 구조를 이해시키기 위한 설명 문서입니다.

[중요한 출력 규칙]

결과물은 반드시 총 10개의 챕터로 구성해야 하며, 각 챕터는 명확한 제목을 포함해야 합니다. 각 챕터의 본문은 짧은 요약 수준이 아니라, 배경과 맥락, 회사의 판단과 선택, 그 의미가 자연스럽게 이어지는 설명형 문단으로 작성해야 합니다. 각 챕터는 최소 두 개 이상의 설명 단락으로 구성하고, 분량 기준으로는 짧은 회사소개 페이지 하나(A4 기준 최소 절반 이상)에 해당하는 밀도를 유지하세요. 단순히 같은 내용을 반복해 분량을 늘리는 방식은 사용하지 마세요.

문체는 과장 없는 설명체를 유지하고, 공식 문서에 어울리는 전문적이고 신뢰감 있는 톤을 사용하세요. 마케팅 문구, 슬로건형 문장, 감탄형 표현은 사용하지 마세요. GPT 특유의 표현으로 보일 수 있는 문장 구조와 어휘는 피해야 합니다. 예를 들어 "핵심은", "~라고 할 수 있습니다", "~라고 볼 수 있습니다", "이러한", "~라는 점에서"와 같은 표현, 불필요한 강조 표시(**표현), 지나치게 추상적인 단어 나열은 사용하지 마세요. AI, 자동화, 기술과 같은 단어는 반드시 설명 맥락에서만 제한적으로 사용하며, 의미 없이 반복하지 마세요.

문장은 자연스럽게 이어지되, 불필요한 줄바꿈 없이 문단 단위로만 구성하세요. 목록, 불릿, 이모지, 구분선은 사용하지 않습니다. 또한 사용자가 입력한 질문과 답변에 없는 내용을 임의로 상상하거나 추가하지 마세요. 회사의 성과, 수치, 외부 평가 등은 입력에 포함되지 않았다면 언급하지 않습니다.

[회사소개서 챕터 구성 규칙]

회사소개서는 아래의 10개 챕터 구조를 반드시 따르세요.
1. 회사 개요
2. 우리가 정의하는 회사의 모습
3. 문제 인식의 출발점
4. 이 문제가 중요한 이유
5. 우리의 해결 접근 방식
6. 해결 방식이 만들어내는 가치
7. 현재의 위치와 진행 상황
8. 우리가 그리는 성장 방향
9. 우리가 지키는 기준과 원칙
10. 그래서, 이 회사는

[질문과 답변 매핑 규칙]

질문과 답변은 다음과 같이 챕터에 반영하세요. 질문 1의 답변은 1번 챕터의 기준 정보로 사용합니다. 질문 2의 답변은 2번과 10번 챕터의 핵심 문장과 정의에 활용합니다. 질문 3의 답변은 3번과 4번 챕터에서 문제 인식과 그 중요성을 확장하는 데 사용합니다. 질문 4의 답변은 5번과 6번 챕터에서 회사의 해결 방식과 그로 인해 만들어지는 가치를 설명하는 데 반영합니다. 질문 5의 답변은 8번과 10번 챕터에서 회사의 방향성과 장기적인 관점에 녹여 설명합니다. 질문 6의 답변은 7번과 9번 챕터에서 현재 상태, 보조 정보, 회사가 중요하게 여기는 기준과 원칙을 설명하는 데 활용합니다.

[시각화 가이드 규칙]

각 챕터의 본문이 끝난 뒤에는 반드시 해당 챕터에 어울리는 시각화 가이드를 한 문장으로 추가하세요. 이 시각화 가이드는 단순한 이미지 장식이 아니라, 독자의 이해를 돕기 위해 어떤 정보나 구조를 도식이나 다이어그램으로 정리하면 좋은지를 설명하는 역할을 합니다. 예를 들어 회사 개요에서는 회사의 기본 정보를 한눈에 파악할 수 있는 구조를, 문제 인식 챕터에서는 기존 구조와 문제 흐름을 단계적으로 보여주는 다이어그램을 제안하는 식입니다. 시각화 가이드는 "[시각화 가이드]"라는 문구로 시작해 한 문장으로 작성하세요.

[입력 데이터]
질문 1:
${answers[1] || ""}

질문 2:
${answers[2] || ""}

질문 3:
${answers[3] || ""}

질문 4:
${answers[4] || ""}

질문 5:
${answers[5] || ""}

질문 6:
${answers[6] || ""}
${
  extractedText && extractedText.trim()
    ? `

[추가 참고 자료]
사용자가 업로드한 문서 자료에서 추출한 정보가 아래에 포함되어 있습니다. 이 정보를 참고하여 원고를 보완하되, 질문과 답변의 내용과 일관성을 유지하세요. 업로드된 자료의 내용이 질문 답변과 충돌하거나 모순되는 경우, 질문 답변의 내용을 우선하세요.

${extractedText}`
    : ""
}

[출력 형식]

출력 시 각 챕터는 반드시 번호와 제목으로 시작하고, 본문은 연속된 설명 흐름으로 작성하세요. 모든 챕터에 시각화 가이드가 포함되어야 하며, 전체 결과물은 하나의 완성된 회사소개서로 바로 활용할 수 있는 수준이어야 합니다.`;

    return basePrompt;
  } else if (cardNumber === 2) {
    // IR / 사업계획서 프롬프트
    const basePrompt2 = `당신은 IR 및 사업계획서 전문 카피라이터이자, 투자자 관점의 논리 구조를 설계하는 문서 디렉터입니다.

아래에 제공되는 6개의 질문과 답변을 기반으로, 투자자·외부 파트너·내부 의사결정자가 읽는 공식 IR / 사업계획서 원고를 작성하세요. 이 문서는 홍보 목적이 아니라, 사업의 구조와 판단 근거를 이해시키기 위한 설명 문서입니다.

[중요한 출력 규칙]

결과물은 반드시 총 10개의 챕터로 구성해야 하며, 각 챕터는 명확한 제목을 포함해야 합니다. 각 챕터의 본문은 단순 요약이 아니라, 시장 맥락 → 문제 정의 → 사업적 판단 → 현재 선택의 이유가 자연스럽게 이어지는 설명형 문단으로 작성해야 합니다. 각 챕터는 최소 두 개 이상의 설명 단락으로 구성하고, 분량 기준으로는 IR 슬라이드 2~3장을 글로 풀어 쓴 수준의 밀도를 유지하세요. 핵심만 나열하는 방식이나 발표 스크립트처럼 보이는 문장은 사용하지 마세요.

문체는 과장 없는 설명체를 유지하고, 투자 판단에 적합한 차분하고 논리적인 톤을 사용하세요. 마케팅 문구, 슬로건형 표현, 감정적인 강조는 사용하지 않습니다. GPT 특유의 표현으로 보일 수 있는 문장 구조와 어휘는 피해야 합니다. 예를 들어 "핵심은", "~라고 볼 수 있습니다", "이러한", "~라는 점에서", "선도적인", "혁신적인" 같은 표현은 사용하지 마세요. AI, 기술, 플랫폼 등의 단어는 반드시 사업 구조와 역할을 설명하는 맥락에서만 제한적으로 사용하세요.

문장은 자연스럽게 이어지되, 불필요한 줄바꿈 없이 문단 단위로만 구성하세요. 목록, 불릿, 이모지, 구분선은 사용하지 않습니다. 사용자가 입력한 질문과 답변에 없는 시장 규모, 수치, 성과, 외부 평가, 경쟁사 정보는 임의로 추가하지 마세요. 추정이나 상상에 기반한 내용은 포함하지 않습니다.

[IR / 사업계획서 챕터 구성 규칙]

IR / 사업계획서는 아래의 10개 챕터 구조를 반드시 따르세요.

1. 사업 개요
2. 우리가 주목한 시장의 구조
3. 문제 정의
4. 기존 방식의 한계
5. 우리의 해결 방식
6. 사업 모델과 작동 구조
7. 현재의 진행 상황과 검증 단계
8. 성장 가능성과 확장 방향
9. 리스크 인식과 운영 기준
10. 이 사업이 의미하는 것

[질문과 답변 매핑 규칙]

질문과 답변은 다음과 같이 챕터에 반영하세요. 질문 1의 답변은 1번 챕터에서 사업과 제품·서비스의 기준 정보로 사용합니다. 질문 2의 답변은 3번 챕터의 문제 정의 핵심 문장으로 사용합니다. 질문 3의 답변은 4번 챕터에서 기존 방식의 한계를 구조적으로 확장하는 데 활용합니다. 질문 4의 답변은 5번과 6번 챕터에서 해결 방식과 사업 모델의 작동 구조를 설명하는 데 반영합니다. 질문 5의 답변은 8번과 10번 챕터에서 성장 가능성과 장기적인 사업 의미를 설명하는 데 활용합니다. 질문 6의 답변은 7번과 9번 챕터에서 현재 단계, 보조 정보, 운영 기준과 리스크 인식에 반영합니다.

[시각화 가이드 규칙]

각 챕터의 본문이 끝난 뒤에는 반드시 해당 챕터에 어울리는 시각화 가이드를 한 문장으로 추가하세요. 이 시각화 가이드는 IR 슬라이드나 사업계획서 도표로 전환하기 위한 기준 설명이며, 어떤 구조나 흐름을 도식, 다이어그램, 플로우 차트, 단계도 등으로 표현하면 좋은지를 설명해야 합니다. 시각화 가이드는 "[시각화 가이드]"라는 문구로 시작해 한 문장으로 작성하세요.

[입력 데이터]
질문 1:
${answers[1] || ""}

질문 2:
${answers[2] || ""}

질문 3:
${answers[3] || ""}

질문 4:
${answers[4] || ""}

질문 5:
${answers[5] || ""}

질문 6:
${answers[6] || ""}
${
  extractedText && extractedText.trim()
    ? `

[추가 참고 자료]
사용자가 업로드한 문서 자료에서 추출한 정보가 아래에 포함되어 있습니다. 이 정보를 참고하여 원고를 보완하되, 질문과 답변의 내용과 일관성을 유지하세요. 업로드된 자료의 내용이 질문 답변과 충돌하거나 모순되는 경우, 질문 답변의 내용을 우선하세요.

${extractedText}`
    : ""
}

[출력 형식]

출력 시 각 챕터는 반드시 번호와 제목으로 시작하고, 본문은 연속된 설명 흐름으로 작성하세요. 모든 챕터에 시각화 가이드가 포함되어야 하며, 전체 결과물은 투자 미팅, 내부 보고, 지원사업 제출용 문서로 바로 활용할 수 있는 수준이어야 합니다.`;

    return basePrompt2;
  } else if (cardNumber === 3) {
    // 제품·서비스 소개서 프롬프트
    const basePrompt3 = `당신은 제품·서비스 소개서 전문 카피라이터이며, 사용자의 관점에서 '무엇을 이해해야 이 제품이나 서비스를 선택할 수 있는지'를 구조화하는 문서 설계자입니다. 아래에 제공되는 6개의 질문과 답변을 기반으로, 제품 또는 서비스의 성격에 맞는 하나의 완성된 소개서 원고를 작성하세요.

이 문서는 마케팅 문구나 광고용 카피가 아니라, 디자이너, 기획자, 파트너, 고객이 제품이나 서비스를 정확히 이해하기 위해 읽는 설명 문서입니다. 결과물은 기능을 나열하거나 장점을 강조하는 방식이 아니라, 사용 맥락과 구조를 중심으로 "왜 이 제품·서비스가 필요하고, 어떻게 쓰이며, 무엇이 기준이 되는지"가 자연스럽게 드러나야 합니다.

먼저, 입력된 답변을 바탕으로 이 대상이 **제품인지, 서비스인지, 혹은 제품을 포함한 서비스인지**를 내부적으로 판단한 뒤 그 성격에 맞는 설명 방식을 선택하세요.

- 물리적 제품인 경우: 사용 상황, 구성, 선택 기준, 사용 전후의 변화 중심으로 설명하세요.
- 디지털 서비스인 경우: 사용 흐름, 역할, 사용자가 맡는 행동과 시스템의 역할을 구분해 설명하세요.
- 제품과 서비스가 결합된 경우: 각각을 분리해서 설명한 뒤, 어떻게 연결되어 하나의 경험을 만드는지 설명하세요.

결과물은 반드시 총 10개의 챕터로 구성해야 하며, 각 챕터는 명확한 제목을 포함해야 합니다. 각 챕터의 본문은 약 10~20줄 분량의 설명형 문장으로 작성하세요. 각 챕터는 한 문단으로 끝내지 말고, 최소 두 개 이상의 설명 흐름이 이어지도록 구성하세요. 요약형 문장, 기능 리스트, 스펙 나열은 사용하지 않습니다.

문체는 과장 없는 설명체를 유지하고, 사람이 실제로 읽고 이해할 수 있는 차분한 톤을 사용하세요. "혁신적인", "차별화된", "최적의", "강력한" 등 마케팅성 형용사는 사용하지 않습니다. GPT 특유의 표현으로 보일 수 있는 문장 구조, 반복적인 연결어, 추상적인 총평 문장은 피하세요. AI, 자동화, 기술 등의 단어는 반드시 사용 맥락과 역할을 설명하는 경우에만 제한적으로 사용하세요.

문장은 자연스럽게 이어지되, 불필요한 줄바꿈 없이 문단 단위로만 구성하세요. 목록, 불릿, 이모지, 강조 표시(**), 구분선은 사용하지 않습니다. 사용자가 입력하지 않은 기능, 효과, 수치, 비교 대상은 임의로 추가하지 마세요.

[제품·서비스 소개서 챕터 구성 규칙]

제품·서비스 소개서는 아래의 10개 챕터 구조를 반드시 따르세요.

1. 제품·서비스 개요
2. 이 제품·서비스가 등장한 배경
3. 사용자가 처한 상황
4. 기존 방식의 불편함
5. 우리가 선택한 해결 방향
6. 제품·서비스의 작동 방식
7. 사용 흐름과 경험 구조
8. 선택 기준으로서의 차별점
9. 사용 시 기대할 수 있는 변화
10. 이 제품·서비스를 어떻게 이해하면 좋은가

[질문과 답변 매핑 규칙]

질문과 답변은 다음 기준으로 챕터에 반영하세요. 질문 1의 답변은 1번 챕터에서 제품·서비스의 정체성과 제공 형태를 설명하는 기준 정보로 사용하세요. 질문 2의 답변은 3번 챕터에서 사용자가 이 제품·서비스를 필요로 하게 되는 상황 설명에 반영하세요. 질문 3의 답변은 5번과 6번 챕터에서 문제 해결 방식과 작동 구조를 설명하는 데 활용하세요. 질문 4의 답변은 8번 챕터에서 선택 기준과 차별점으로 확장하세요. 질문 5의 답변은 1번과 10번 챕터의 핵심 정의 문장으로 활용하세요. 질문 6의 답변은 7번과 9번 챕터에서 보조 정보, 사용 조건, 신뢰 요소로 반영하세요.

[시각화 가이드 규칙]

각 챕터의 본문이 끝난 뒤에는 반드시 해당 챕터에 필요한 시각화 방향을 한 문장으로 제시하세요. 이 시각화 문장은 실제 디자인 작업을 위한 가이드이며, 어떤 내용을 도식, 흐름도, 구조도, 비교 다이어그램 등으로 표현하면 좋은지를 설명해야 합니다. 시각화 문장은 "[시각화 가이드]"로 시작하며, 설명은 구체적이되 한 문장으로 작성하세요.

[입력 데이터]
질문 1:
${answers[1] || ""}

질문 2:
${answers[2] || ""}

질문 3:
${answers[3] || ""}

질문 4:
${answers[4] || ""}

질문 5:
${answers[5] || ""}

질문 6:
${answers[6] || ""}
${
  extractedText && extractedText.trim()
    ? `

[추가 참고 자료]
사용자가 업로드한 문서 자료에서 추출한 정보가 아래에 포함되어 있습니다. 이 정보를 참고하여 원고를 보완하되, 질문과 답변의 내용과 일관성을 유지하세요. 업로드된 자료의 내용이 질문 답변과 충돌하거나 모순되는 경우, 질문 답변의 내용을 우선하세요.

${extractedText}`
    : ""
}

[출력 형식]

출력 시 각 챕터는 번호와 제목으로 시작하세요. 모든 챕터는 연속된 설명형 문단으로 구성되어야 하며, 전체 결과물은 상세페이지 이전 단계의 원고, 제안서, 소개 자료로 바로 활용할 수 있는 수준이어야 합니다.`;

    return basePrompt3;
  } else if (cardNumber === 4) {
    // 상세페이지 원고 프롬프트
    const basePrompt4 = `당신은 상세페이지 원고를 설계하는 콘텐츠 라이터입니다.

아래에 제공되는 질문과 답변을 기반으로, **상세페이지에 바로 사용할 수 있는 글 원고**를 작성하세요.

이 결과물은 회사소개서나 IR 문서가 아닙니다.

스크롤을 내리며 읽히는 **상세페이지용 콘텐츠**이며, 각 섹션은 **짧은 소제목 + 2~3줄 설명**으로 구성되어야 합니다.

한 섹션이 길어지거나 문단이 길게 이어지면 안 됩니다.

이 상세페이지의 목적은 제품이나 서비스를 처음 접하는 사람이

"아, 이게 이런 거구나" → "그래서 나한테 필요하겠네" → "한 번 써볼 만하네"

이 흐름으로 **자연스럽게 이해하도록 돕는 것**입니다.

광고 문구처럼 보이는 표현, 과장된 효능, 감정적인 호소는 사용하지 마세요.

기능 나열, 스펙 정리, 장점 열거 방식도 사용하지 않습니다.

GPT 특유의 문장 구조, 추상적인 형용사, 의미 없는 정리 문장은 피하세요.

먼저 내부적으로 이 대상이 **물리적 제품인지, 디지털 서비스인지, 혹은 제품을 포함한 서비스인지**를 판단한 뒤, 그 성격에 맞는 설명 방식을 선택하세요.

- 제품인 경우: 사용 맥락, 선택 기준, 섭취·사용 이유 중심으로 작성하세요.
- 서비스인 경우: 사용 상황, 흐름, 사용자가 느끼는 변화 중심으로 작성하세요.
- 제품+서비스인 경우: 각각을 구분해 설명한 뒤 연결 구조를 보여주세요.

[출력 구조 규칙]

결과물은 **총 12개의 섹션**으로 구성하세요.

각 섹션은 아래 규칙을 반드시 지켜야 합니다.

- 각 섹션은 **짧은 소제목 1줄 + 설명 2~3줄**로만 구성
- 한 섹션에 4줄 이상 작성 금지
- 문단 나누기 금지 (한 덩어리로 작성)
- 불릿, 번호, 이모지, 강조 표시 사용 금지

[상세페이지 섹션 구성 (고정)]

1. 이 페이지에서 다루는 대상
2. 이런 사람이 이 페이지에 들어옵니다
3. 처음에 느끼는 고민
4. 자주 겪는 불편한 지점
5. 그 불편이 생기는 이유
6. 이 제품·서비스가 제안하는 방향
7. 어떻게 사용하게 되는지
8. 사용 과정에서 느껴지는 변화
9. 다른 선택지와 다른 기준
10. 신뢰를 판단할 수 있는 근거
11. 사용 전 알아두면 좋은 점
12. 그래서, 이런 사람에게 맞습니다

[질문 반영 규칙]

- 질문 1의 답변은 1번 섹션의 기준 정보와 페이지 목적에 반영하세요.
- 질문 2의 답변은 2번과 3번 섹션의 사용자 상태 설명에 활용하세요.
- 질문 3의 답변은 4번과 5번 섹션의 공감·불편 설명에 사용하세요.
- 질문 4의 답변은 7번 섹션의 사용 방식 설명에 반영하세요.
- 질문 5의 답변은 6번과 9번 섹션의 설득 기준으로 활용하세요.
- 질문 6의 답변은 10번과 11번 섹션의 신뢰·보조 정보로 반영하세요.

[시각화 가이드 규칙]

각 섹션의 설명 뒤에는 **한 줄의 시각화 가이드**를 반드시 추가하세요.

이 문장은 디자이너에게 전달되는 기준이며, 다음 형식을 따르세요.

"[시각화 가이드] 이 섹션은 ○○을 보여주는 이미지 / 다이어그램이 적합합니다."

- 제품 컷, 사용 장면, 흐름도, 비교 구조, 아이콘 조합 등
- 실제 상세페이지에 바로 적용 가능한 수준으로 구체적으로 작성

[문체 및 금지 사항]

- 과장, 단정적 효능 표현 금지
- "혁신적인", "완벽한", "차별화된" 사용 금지
- "~합니다" 설명체 유지
- 사용자의 입력에 없는 정보 추가 금지

[입력 데이터]
질문 1:
${answers[1] || ""}

질문 2:
${answers[2] || ""}

질문 3:
${answers[3] || ""}

질문 4:
${answers[4] || ""}

질문 5:
${answers[5] || ""}

질문 6:
${answers[6] || ""}
${
  extractedText && extractedText.trim()
    ? `

[추가 참고 자료]
사용자가 업로드한 문서 자료에서 추출한 정보가 아래에 포함되어 있습니다. 이 정보를 참고하여 원고를 보완하되, 질문과 답변의 내용과 일관성을 유지하세요. 업로드된 자료의 내용이 질문 답변과 충돌하거나 모순되는 경우, 질문 답변의 내용을 우선하세요.

${extractedText}`
    : ""
}

[결과물 기준]

이 결과물은

- 디자이너에게 바로 전달 가능한 상세페이지 원고이며
- 쇼핑몰, 브랜드 사이트, 랜딩페이지에 그대로 사용할 수 있어야 하고
- 수정 없이도 "글 구조가 이미 잡혀 있다"고 느껴지는 수준이어야 합니다.`;

    return basePrompt4;
  } else {
    // 기본값 (카드 1과 동일 - 회사소개서)
    return `당신은 회사소개서 전문 카피라이터이자, 기업 문서 구조 설계에 특화된 콘텐츠 디렉터입니다.
아래에 제공되는 6개의 질문과 답변을 기반으로, 외부 이해관계자(투자자, 파트너, 고객 등)가 읽는 공식 회사소개서 원고를 작성하세요. 이 문서는 홍보용 글이 아니라, 회사의 맥락과 구조를 이해시키기 위한 설명 문서입니다.

[중요한 출력 규칙]

결과물은 반드시 총 10개의 챕터로 구성해야 하며, 각 챕터는 명확한 제목을 포함해야 합니다. 각 챕터의 본문은 짧은 요약 수준이 아니라, 배경과 맥락, 회사의 판단과 선택, 그 의미가 자연스럽게 이어지는 설명형 문단으로 작성해야 합니다. 각 챕터는 최소 두 개 이상의 설명 단락으로 구성하고, 분량 기준으로는 짧은 회사소개 페이지 하나(A4 기준 최소 절반 이상)에 해당하는 밀도를 유지하세요. 단순히 같은 내용을 반복해 분량을 늘리는 방식은 사용하지 마세요.

문체는 과장 없는 설명체를 유지하고, 공식 문서에 어울리는 전문적이고 신뢰감 있는 톤을 사용하세요. 마케팅 문구, 슬로건형 문장, 감탄형 표현은 사용하지 마세요. GPT 특유의 표현으로 보일 수 있는 문장 구조와 어휘는 피해야 합니다. 예를 들어 "핵심은", "~라고 할 수 있습니다", "~라고 볼 수 있습니다", "이러한", "~라는 점에서"와 같은 표현, 불필요한 강조 표시(**표현), 지나치게 추상적인 단어 나열은 사용하지 마세요. AI, 자동화, 기술과 같은 단어는 반드시 설명 맥락에서만 제한적으로 사용하며, 의미 없이 반복하지 마세요.

문장은 자연스럽게 이어지되, 불필요한 줄바꿈 없이 문단 단위로만 구성하세요. 목록, 불릿, 이모지, 구분선은 사용하지 않습니다. 또한 사용자가 입력한 질문과 답변에 없는 내용을 임의로 상상하거나 추가하지 마세요. 회사의 성과, 수치, 외부 평가 등은 입력에 포함되지 않았다면 언급하지 않습니다.

[회사소개서 챕터 구성 규칙]

회사소개서는 아래의 10개 챕터 구조를 반드시 따르세요.
1. 회사 개요
2. 우리가 정의하는 회사의 모습
3. 문제 인식의 출발점
4. 이 문제가 중요한 이유
5. 우리의 해결 접근 방식
6. 해결 방식이 만들어내는 가치
7. 현재의 위치와 진행 상황
8. 우리가 그리는 성장 방향
9. 우리가 지키는 기준과 원칙
10. 그래서, 이 회사는

[질문과 답변 매핑 규칙]

질문과 답변은 다음과 같이 챕터에 반영하세요. 질문 1의 답변은 1번 챕터의 기준 정보로 사용합니다. 질문 2의 답변은 2번과 10번 챕터의 핵심 문장과 정의에 활용합니다. 질문 3의 답변은 3번과 4번 챕터에서 문제 인식과 그 중요성을 확장하는 데 사용합니다. 질문 4의 답변은 5번과 6번 챕터에서 회사의 해결 방식과 그로 인해 만들어지는 가치를 설명하는 데 반영합니다. 질문 5의 답변은 8번과 10번 챕터에서 회사의 방향성과 장기적인 관점에 녹여 설명합니다. 질문 6의 답변은 7번과 9번 챕터에서 현재 상태, 보조 정보, 회사가 중요하게 여기는 기준과 원칙을 설명하는 데 활용합니다.

[시각화 가이드 규칙]

각 챕터의 본문이 끝난 뒤에는 반드시 해당 챕터에 어울리는 시각화 가이드를 한 문장으로 추가하세요. 이 시각화 가이드는 단순한 이미지 장식이 아니라, 독자의 이해를 돕기 위해 어떤 정보나 구조를 도식이나 다이어그램으로 정리하면 좋은지를 설명하는 역할을 합니다. 예를 들어 회사 개요에서는 회사의 기본 정보를 한눈에 파악할 수 있는 구조를, 문제 인식 챕터에서는 기존 구조와 문제 흐름을 단계적으로 보여주는 다이어그램을 제안하는 식입니다. 시각화 가이드는 "[시각화 가이드]"라는 문구로 시작해 한 문장으로 작성하세요.

[입력 데이터]
질문 1:
${answers[1] || ""}

질문 2:
${answers[2] || ""}

질문 3:
${answers[3] || ""}

질문 4:
${answers[4] || ""}

질문 5:
${answers[5] || ""}

질문 6:
${answers[6] || ""}

[출력 형식]

출력 시 각 챕터는 반드시 번호와 제목으로 시작하고, 본문은 연속된 설명 흐름으로 작성하세요. 모든 챕터에 시각화 가이드가 포함되어야 하며, 전체 결과물은 하나의 완성된 회사소개서로 바로 활용할 수 있는 수준이어야 합니다.`;
  }
}

export async function generateCompanyIntroduction(
  answers: Record<number, string>,
  cardNumber: number = 1,
  extractedText?: string,
  retryCount: number = 0
): Promise<string> {
  const prompt = getPromptForCard(cardNumber, answers, extractedText);

  // Gemini API 요청 형식
  // system 메시지는 프롬프트에 포함
  const fullPrompt = `당신은 전문적인 문서 작성 AI입니다. 사용자의 요구사항에 따라 정확하고 전문적인 문서를 작성합니다.

⚠️ 중요: 반드시 모든 챕터(또는 섹션)를 완전히 작성해야 합니다. 중간에 끊기거나 미완성된 상태로 끝나면 안 됩니다. 문서의 처음부터 끝까지 완전한 형태로 작성해주세요.

${prompt}

⚠️ 마지막 확인: 위의 모든 챕터(또는 섹션)가 완전히 작성되었는지 확인하고, 미완성된 부분이 없도록 완전한 문서를 작성해주세요.`;

  const requestBody: GeminiGenerateContentRequest = {
    contents: [
      {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384, // 긴 회사소개서를 위해 증가
    },
  };

  // Gemini API 키 가져오기 (재시도 시 캐시 무시)
  const apiKey = await getGeminiApiKey(retryCount > 0);

  // API 키 확인
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Gemini API 키가 설정되지 않았습니다.\n\n" +
        "Firestore의 'config/geminiApiKey' 문서에 API 키를 설정하거나,\n" +
        ".env 파일에 VITE_GEMINI_API_KEY를 설정해주세요."
    );
  }

  // 디버깅: 사용 중인 API 키 확인 (처음 10자만)
  console.log(
    "🔑 사용 중인 API 키:",
    apiKey ? `${apiKey.substring(0, 10)}...` : "없음"
  );

  // API 호출 시도
  try {
    const apiUrl = `${API_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error?.message || `API 요청 실패: ${response.status}`;

      // 모델 접근 권한 오류 처리
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("not available") ||
        errorMessage.includes("permission denied")
      ) {
        throw new Error(
          `⚠️ 모델 접근 오류: ${errorMessage}\n\n` +
            `현재 사용 중인 모델: ${MODEL}\n\n` +
            `해결 방법:\n` +
            `1. Google AI Studio에서 모델 접근 권한 확인\n` +
            `2. API 키에 해당 모델 사용 권한이 있는지 확인\n` +
            `3. 다른 모델(gemini-1.5-flash 등) 사용 시도`
        );
      }

      // 할당량 초과 오류 처리
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        response.status === 429
      ) {
        let quotaErrorMessage =
          "⚠️ Gemini API 할당량이 초과되었습니다.\n\n" +
          "사용 한도에 도달했습니다.\n\n" +
          "해결 방법:\n" +
          "1. Google AI Studio (https://aistudio.google.com/app/apikey)에서:\n" +
          "   - 사용량 확인\n" +
          "   - 할당량 확인 및 업그레이드\n" +
          "2. 잠시 후 다시 시도\n" +
          "3. 다른 API 키 사용";

        throw new Error(quotaErrorMessage);
      }

      // API 키 관련 에러인 경우 명확한 메시지 제공
      if (
        errorMessage.includes("API key") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("UNAUTHENTICATED") ||
        response.status === 401
      ) {
        // API 키 캐시 초기화 (잘못된 키일 수 있음)
        cachedApiKey = null;
        throw new Error(
          `Gemini API 키 오류: ${errorMessage}\n\n` +
            `API 키를 확인하고 다시 시도해주세요.`
        );
      }

      throw new Error(errorMessage);
    }

    const data: GeminiGenerateContentResponse = await response.json();

    if (data.error) {
      const errorMessage = data.error.message;

      // 할당량 초과 오류 처리
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("RESOURCE_EXHAUSTED")
      ) {
        let quotaErrorMessage =
          "⚠️ Gemini API 할당량이 초과되었습니다.\n\n" +
          "사용 한도에 도달했습니다.\n\n" +
          "해결 방법:\n" +
          "1. Google AI Studio (https://aistudio.google.com/app/apikey)에서:\n" +
          "   - 사용량 확인\n" +
          "   - 할당량 확인 및 업그레이드\n" +
          "2. 잠시 후 다시 시도\n" +
          "3. 다른 API 키 사용";

        throw new Error(quotaErrorMessage);
      }

      // API 키 관련 에러인 경우 명확한 메시지 제공
      if (
        errorMessage.includes("API key") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("UNAUTHENTICATED")
      ) {
        // API 키 캐시 초기화 (잘못된 키일 수 있음)
        cachedApiKey = null;
        throw new Error(
          `Gemini API 키 오류: ${errorMessage}\n\n` +
            `API 키를 확인하고 다시 시도해주세요.`
        );
      }
      throw new Error(errorMessage);
    }

    // Gemini 응답에서 텍스트 추출
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      const finishReason = data.candidates[0].finishReason;

      // 응답이 완전히 생성되었는지 확인
      if (finishReason === "MAX_TOKENS") {
        console.warn(
          "⚠️ 응답이 토큰 제한으로 인해 잘렸을 수 있습니다. maxOutputTokens를 늘려보세요."
        );
        // 완전하지 않더라도 받은 내용 반환 (재시도 없이)
        return text;
      }

      if (
        finishReason &&
        finishReason !== "STOP" &&
        finishReason !== "MAX_TOKENS"
      ) {
        console.warn(`⚠️ 응답 완료 이유: ${finishReason}`);
        if (data.candidates[0].finishMessage) {
          console.warn(`완료 메시지: ${data.candidates[0].finishMessage}`);
        }
      }

      return text;
    }

    throw new Error("응답에서 원고를 찾을 수 없습니다.");
  } catch (error) {
    console.error("Gemini API 요청 실패:", error);
    throw error;
  }
}
