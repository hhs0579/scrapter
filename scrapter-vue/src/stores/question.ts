import { defineStore } from "pinia";
import { ref } from "vue";

export const useQuestionStore = defineStore("question", () => {
  // 선택한 카드 번호 (1-4)
  const selectedCard = ref<number | null>(null);

  // 선택한 사업 유형들 (다중 선택)
  const selectedBusinessTypes = ref<string[]>([]);

  // 기타 직접 입력 값
  const customBusinessType = ref<string>("");

  // 현재 질문 단계
  const currentStep = ref<number>(1);

  // 카드별 제목
  const cardTitles = {
    1: "사업이나 브랜드를 처음 정리하는 단계예요!",
    2: "투자자나 외부에 설명할 자료가 필요해요!",
    3: "제품·서비스의 강점을 정리해 보여주고 싶어요!",
    4: "웹사이트나 마케팅에 사용할 콘텐츠가 필요해요",
  };

  // 카드별 질문 데이터
  const cardQuestions = {
    1: [
      {
        number: 1,
        title: "기본 정보",
        question: "먼저, 회사에 대한 기본 정보를 알려주세요",
        subtext: [
          "회사명, 대표자명, 설립연도처럼",
          "회사소개서에 기본적으로 들어가야 할 정보가 있다면 적어주세요.",
          "모두 정확하지 않아도 괜찮아요.",
        ],
        examples: ["회사명: 주식회사 ○○\n대표자: 홍길동\n설립연도: 2022년"],
      },
      {
        number: 2,
        title: "회사 한 줄 소개",
        question: "이 회사를 한 문장으로 소개한다면 어떻게 말하고 싶으신가요?",
        subtext: [
          "아직 정리가 안 되어 있어도 괜찮아요.",
          "지금 떠오르는 표현 그대로 적어주세요.",
        ],
        examples: [
          '"건강한 식문화를 만드는 요거트 브랜드입니다."',
          '"자연 원료를 기반으로 요거트를 만드는 식품 회사예요."',
          '"국내산 원유로 요거트를 생산하는 브랜드입니다."',
        ],
      },
      {
        number: 3,
        title: "해결하려는 문제",
        question: "이 회사가 해결하려는 가장 큰 문제는 무엇인가요?",
        subtext: [
          "시장이나 현장에서 느꼈던 불편함,",
          "'이건 꼭 바뀌어야 한다'고 느꼈던 지점을 떠올려 주세요.",
        ],
        examples: [
          '"시중 요거트는 당 함량이 높아 부담스럽다는 점이 문제였어요."',
          '"원재료와 제조 과정을 믿을 수 있는 요거트를 찾기 어려웠어요."',
          '"건강한 요거트를 선택할 기준이 명확하지 않았어요."',
        ],
      },
      {
        number: 4,
        title: "해결 방식 / 사업 내용",
        question: "그 문제를 해결하기 위해, 현재 어떤 방식으로 일하고 있나요?",
        subtext: [
          "제공하는 제품, 서비스, 운영 방식 등을",
          "편하게 설명해 주세요.",
        ],
        examples: [
          '"무가당 요거트를 직접 제조해 판매하고 있습니다."',
          '"국내산 원유만 사용해 요거트를 생산하고 있어요."',
          '"온라인 판매를 중심으로 요거트를 유통하고 있습니다."',
        ],
      },
      {
        number: 5,
        title: "성장 방향",
        question: "이 회사가 앞으로 어떤 방향으로 성장하길 바라시나요?",
        subtext: [
          "구체적인 계획이 없어도 괜찮아요.",
          "'이런 회사가 되었으면 좋겠다'는 생각이면 충분해요.",
        ],
        examples: [
          '"건강한 요거트를 떠올리면 가장 먼저 생각나는 브랜드가 되고 싶어요."',
          '"국내를 넘어 해외에도 요거트를 수출하고 싶어요."',
          '"식품을 넘어 라이프스타일 브랜드로 성장하고 싶습니다."',
        ],
      },
      {
        number: 6,
        title: "공통 · 자유 입력",
        question:
          "소개서에 꼭 반영되었으면 하는 추가 내용이 있다면 자유롭게 적어주세요",
        subtext: [
          "대표자 이력, 주요 제품이 꼭 포함되어야 할 문장이나 강조하고 싶은 포인트가 있다면 적어주세요.",

          "기존에 사용 중인 PDF, PPT, 문서 자료가 있다면 함께 첨부해 주셔도 좋아요.",
          "첨부한 자료는 원고를 보완하는 참고 자료로만 활용됩니다.",
        ],
        examples: [
          "대표자는 식품업계에서 10년 이상 근무한 경험이 있습니다.\n요거트는 무가당 제품이며, 국내산 원유만 사용합니다.\n'아이부터 어른까지 안심하고 먹을 수 있는 요거트'라는 문장이 꼭 들어갔으면 좋겠습니다.",
        ],
      },
    ],
    2: [
      {
        number: 1,
        title: "기본 기준 정보",
        question:
          "IR 자료의 기준이 되는 회사명과 대표적인 제품·서비스명을 알려주세요",
        subtext: [
          "이 정보는 IR 전체에서",
          "회사와 사업을 구분하는 기준값으로 사용됩니다.",
        ],
        examples: [
          "회사명: 주식회사 ○○\n제품명: 요거트",
          "법인명은 주식회사 ○○이고,\n현재 주력 제품은 요거트입니다.",
        ],
      },
      {
        number: 2,
        title: "문제 정의",
        question: "이 사업이 해결하려는 가장 중요한 문제는 무엇인가요?",
        subtext: [
          "시장이나 고객 입장에서 느꼈던 불편함을 기준으로 적어주세요.",
          "한 문장이어도 괜찮아요.",
        ],
        examples: [
          '"시중 요거트는 당 함량이 높아 건강하게 먹기 어렵습니다."',
          '"원재료와 제조 과정을 신뢰할 수 있는 요거트가 부족합니다."',
          '"건강한 요거트를 선택할 기준이 명확하지 않습니다."',
        ],
      },
      {
        number: 3,
        title: "기존 방식의 한계",
        question:
          "기존 방식으로는 이 문제가 왜 잘 해결되지 않았다고 생각하시나요?",
        subtext: ["지금까지의 제품, 브랜드, 시장 구조의 한계를 떠올려 주세요."],
        examples: [
          '"맛 위주의 제품이 많아 건강을 고려한 선택이 어렵습니다."',
          '"원재료 정보가 명확하게 공개되지 않습니다."',
          '"프리미엄 요거트는 가격이 높아 접근성이 낮습니다."',
        ],
      },
      {
        number: 4,
        title: "해결책 / 사업 내용",
        question: "이 문제를 해결하기 위해 어떤 제품·서비스를 제공하고 있나요?",
        subtext: [
          "현재 제공 중이거나 준비 중인 방식이라도 괜찮아요.",
          "사업의 핵심을 중심으로 설명해 주세요.",
        ],
        examples: [
          '"무가당 요거트를 직접 제조해 판매하고 있습니다."',
          '"국내산 원유만 사용한 요거트를 생산합니다."',
          '"온라인을 중심으로 요거트를 유통하고 있습니다."',
        ],
      },
      {
        number: 5,
        title: "성장 가능성",
        question: "이 사업이 앞으로 어떻게 성장할 수 있다고 생각하시나요?",
        subtext: [
          "시장 확장, 고객 확대, 사업 확장 중",
          "떠오르는 방향을 자유롭게 적어주세요.",
        ],
        examples: [
          '"건강 식품 시장을 중심으로 고객층을 넓힐 수 있습니다."',
          '"B2C를 넘어 B2B 납품으로 확장할 수 있습니다."',
          '"요거트를 시작으로 다양한 유제품 라인으로 확장 가능합니다."',
        ],
      },
      {
        number: 6,
        title: "공통 · 자유 입력",
        question:
          "IR 자료에 꼭 반영되었으면 하는 추가 정보가 있다면 자유롭게 적어주세요",
        subtext: [
          "대표자 이력, 주요 성과, 매출·지표, 파일럿 사례 등 투자 판단에 참고될 만한 내용이 있다면 적어주세요.",

          "기존에 사용 중인 PDF, PPT, 문서 자료가 있다면 함께 첨부해 주셔도 좋아요.",
          "첨부한 자료는 IR 원고를 보완하는 참고 자료로만 활용됩니다.",
        ],
        examples: [
          "대표자 홍길동은 식품업계에서 10년 이상 근무했습니다.\n출시 6개월 만에 누적 판매량 3만 개를 기록했습니다.\n로컬 마켓 5곳과 파일럿 판매를 진행했습니다.",
        ],
      },
    ],
    3: [
      {
        number: 1,
        title: "기본 기준 정보",
        question: "소개하려는 제품·서비스의 이름과 제공 형태를 알려주세요",
        subtext: [
          "제품명과 함께",
          "웹, 앱, 오프라인 제품 등 제공 형태를 적어주세요.",
        ],
        examples: [
          "제품명: 요거트 / 오프라인 식품",
          "제품명은 요거트이고, 냉장 유통되는 식품입니다.",
        ],
      },
      {
        number: 2,
        title: "사용 상황",
        question: "이 제품·서비스는 어떤 상황에서 필요하다고 느끼셨나요?",
        subtext: [
          "고객이 이 제품을 찾게 되는 순간이나",
          "불편함을 떠올려 주세요.",
        ],
        examples: [
          '"건강하게 먹을 수 있는 간식을 찾을 때 필요하다고 느꼈어요."',
          '"당 함량이 낮은 요거트를 찾는 사람이 많았습니다."',
          '"아이와 함께 먹을 수 있는 요거트를 찾기 어려웠어요."',
        ],
      },
      {
        number: 3,
        title: "해결 방식",
        question: "이 제품·서비스는 그 문제를 어떻게 해결해 주나요?",
        subtext: [
          "기능 설명보다는,",
          "사용자가 어떤 점에서 편해지는지를 기준으로 적어주세요.",
        ],
        examples: [
          '"무가당으로 만들어 부담 없이 먹을 수 있습니다."',
          '"국내산 원유만 사용해 신뢰할 수 있습니다."',
          '"간편하게 즐길 수 있는 소용량 요거트입니다."',
        ],
      },
      {
        number: 4,
        title: "차별화 포인트",
        question: "이 제품·서비스만의 가장 큰 강점은 무엇인가요?",
        subtext: [
          "다른 제품과 비교했을 때",
          "가장 다르다고 느끼는 점 하나를 떠올려 주세요.",
        ],
        examples: [
          '"불필요한 첨가물이 없습니다."',
          '"원재료와 제조 과정을 투명하게 공개합니다."',
          '"아이부터 어른까지 함께 먹을 수 있습니다."',
        ],
      },
      {
        number: 5,
        title: "한 문장 요약",
        question:
          "이 제품·서비스를 한 문장으로 표현한다면 어떻게 말하고 싶으신가요?",
        subtext: ["소개서의 첫 문장이나 요약 문장으로 사용될 수 있어요."],
        examples: [
          '"매일 먹어도 부담 없는 무가당 요거트입니다."',
          '"자연 원료로 만든 건강한 요거트입니다."',
          '"가족 모두를 위한 요거트입니다."',
        ],
      },
      {
        number: 6,
        title: "공통 · 자유 입력",
        question:
          "제품·서비스 소개서에 꼭 반영되었으면 하는 추가 내용이 있다면 자유롭게 적어주세요",
        subtext: [
          "원재료 정보, 제조 방식, 인증 사항, 가격 정책 등 꼭 포함되어야 할 정보가 있다면 적어주세요.",

          "기존에 사용 중인 PDF, PPT, 문서 자료가 있다면 함께 첨부해 주셔도 좋아요.",
          "첨부한 자료는 소개서 원고를 보완하는 참고 자료로만 활용됩니다.",
        ],
        examples: [
          "HACCP 인증을 받은 제조 시설에서 생산합니다.\n국내산 원유 100%를 사용합니다.\n냉장 배송을 통해 신선하게 전달됩니다.",
        ],
      },
    ],
    4: [
      {
        number: 1,
        title: "기본 기준 정보",
        question:
          "이 콘텐츠에서 가장 강조할 제품·서비스와, 사람들이 하길 바라는 행동을 알려주세요",
        subtext: [
          "이 페이지의 목적을 정하는 가장 중요한 질문이에요.",
          "하나만 적어주셔도 충분해요.",
        ],
        examples: [
          "제품명: 요거트 / 행동: 구매하기",
          "브랜드는 요거트이고, 페이지 목적은 상담 문의 유도입니다.",
        ],
      },
      {
        number: 2,
        title: "유입 상태",
        question: "이 콘텐츠를 처음 보게 될 사람은 어떤 상태일까요?",
        subtext: [
          "문제를 이미 인식하고 있는지,",
          "아직 막연한 상태인지 떠올려 주세요.",
        ],
        examples: [
          '"건강한 간식을 찾고 있지만 어떤 제품이 좋은지는 모르는 상태예요."',
          '"요거트를 자주 먹지만 성분까지는 잘 보지 않는 상태입니다."',
          '"아이에게 먹일 요거트를 고민하고 있는 상태예요."',
        ],
      },
      {
        number: 3,
        title: "공감 포인트",
        question:
          "그 사람에게 가장 먼저 공감시켜주고 싶은 포인트는 무엇인가요?",
        subtext: [
          "'이건 내 이야기다'라고 느끼게 만들고 싶은 지점을 적어주세요.",
        ],
        examples: [
          '"당 함량이 높은 요거트가 부담스럽다는 점"',
          '"성분을 하나하나 비교하기 번거롭다는 점"',
          '"아이에게 안심하고 먹일 제품을 찾기 어렵다는 점"',
        ],
      },
      {
        number: 4,
        title: "전환 목표",
        question: "이 콘텐츠를 통해 궁극적으로 어떤 행동을 기대하시나요?",
        subtext: ["가장 중요한 행동 하나만 떠올려 주세요."],
        examples: [
          '"제품을 바로 구매하게 하고 싶어요."',
          '"문의나 상담으로 이어졌으면 좋겠어요."',
          '"브랜드를 기억하게 만드는 것이 목표예요."',
        ],
      },
      {
        number: 5,
        title: "설득 포인트",
        question:
          "그 행동을 하도록 만들기 위해, 무엇을 가장 강조하고 싶으신가요?",
        subtext: [
          "기능, 신뢰, 경험, 차별점 중",
          "가장 중요하다고 느끼는 것을 적어주세요.",
        ],
        examples: [
          '"무가당이라 부담 없이 먹을 수 있다는 점"',
          '"국내산 원유만 사용한다는 신뢰"',
          '"아이부터 어른까지 함께 먹을 수 있다는 점"',
        ],
      },
      {
        number: 6,
        title: "공통 · 자유 입력",
        question:
          "웹사이트·마케팅 콘텐츠에 꼭 포함되었으면 하는 추가 내용이 있다면 자유롭게 적어주세요",
        subtext: [
          "가격, 배송 방식, 후기, 문의 방법 등 꼭 들어가야 할 정보가 있다면 적어주세요.",
          "기존에 사용 중인 PDF, PPT, 문서 자료가 있다면 함께 첨부해 주셔도 좋아요.",
          "첨부한 자료는 콘텐츠 원고를 보완하는 참고 자료로만 활용됩니다.",
        ],
        examples: [
          "정기 배송 옵션이 있다는 점을 꼭 넣어주세요.\n냉장 배송으로 신선하게 배송된다는 설명이 필요해요.\n실제 고객 후기가 들어갔으면 좋겠습니다.",
        ],
      },
    ],
  };

  // 질문 답변 저장 (카드별, 질문별)
  const answers = ref<Record<number, Record<number, string>>>({});

  function setAnswer(
    cardNumber: number,
    questionNumber: number,
    answer: string
  ) {
    if (!answers.value[cardNumber]) {
      answers.value[cardNumber] = {};
    }
    answers.value[cardNumber][questionNumber] = answer;
  }

  function getAnswer(cardNumber: number, questionNumber: number): string {
    return answers.value[cardNumber]?.[questionNumber] || "";
  }

  function setSelectedCard(cardNumber: number) {
    selectedCard.value = cardNumber;
  }

  function toggleBusinessType(type: string) {
    const index = selectedBusinessTypes.value.indexOf(type);
    if (index > -1) {
      selectedBusinessTypes.value.splice(index, 1);
    } else {
      selectedBusinessTypes.value.push(type);
    }
  }

  function setCurrentStep(step: number) {
    currentStep.value = step;
  }

  function setCustomBusinessType(value: string) {
    customBusinessType.value = value;
  }

  // 생성된 원고 저장
  const generatedManuscript = ref<string>("");

  function setGeneratedManuscript(manuscript: string) {
    generatedManuscript.value = manuscript;
  }

  function getGeneratedManuscript(): string {
    return generatedManuscript.value;
  }

  // 업로드된 문서에서 추출된 텍스트 저장
  const uploadedDocumentText = ref<string>("");

  function setUploadedDocumentText(text: string) {
    uploadedDocumentText.value = text;
  }

  function getUploadedDocumentText(): string {
    return uploadedDocumentText.value;
  }

  function reset() {
    selectedCard.value = null;
    selectedBusinessTypes.value = [];
    customBusinessType.value = "";
    currentStep.value = 1;
    answers.value = {};
    generatedManuscript.value = "";
    uploadedDocumentText.value = "";
  }

  return {
    selectedCard,
    selectedBusinessTypes,
    customBusinessType,
    currentStep,
    cardTitles,
    cardQuestions,
    answers,
    generatedManuscript,
    uploadedDocumentText,
    setSelectedCard,
    toggleBusinessType,
    setCustomBusinessType,
    setCurrentStep,
    setAnswer,
    getAnswer,
    setGeneratedManuscript,
    getGeneratedManuscript,
    setUploadedDocumentText,
    getUploadedDocumentText,
    reset,
  };
});
