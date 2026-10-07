// 프로젝트별 추천 앱 조합
// app 이름은 services.js의 name과 똑같이 적어야 카드·상세 보기와 연결됩니다.
//
// 보기 모드: 기본 추천 + 요금 모드 3가지
//   can: 이 모드로 할 수 있는 것 / limit: 감안할 점
const comboModes = [
  {
    id: "base", icon: "📋", label: "기본 추천", desc: "분야별로 가장 많이 추천되는 조합",
    can: ["각 단계에 가장 잘 맞는 대표 앱으로 구성", "요금제는 앱마다 무료/유료 마크를 보고 직접 선택"],
    limit: ["예산이 정해져 있다면 아래 요금 모드를 골라 보세요"],
  },
  {
    id: "free", icon: "🆓", label: "완전 무료", desc: "무료 플랜만으로, 월 $0",
    can: ["과제·연습·개인 작업", "짧은 결과물 1~2개를 끝까지 만들어 보기", "어떤 앱이 나에게 맞는지 맛보기"],
    limit: ["하루·월 사용량(크레딧) 제한", "워터마크가 붙거나 상업적 이용이 안 되는 앱이 있음", "고급 모델·고화질 기능은 잠겨 있는 경우가 많음"],
  },
  {
    id: "part", icon: "💸", label: "일부 유료", desc: "핵심 한두 개만 결제해서 가성비 있게",
    can: ["가장 많이 쓰는 단계만 결제해 막힘 없이 작업", "상업 이용·내 도메인처럼 꼭 필요한 조건 해결", "한 학기 동안 꾸준히 쓰기"],
    limit: ["무료로 남긴 단계는 여전히 사용량 제한이 있음"],
  },
  {
    id: "flex", icon: "💎", label: "플렉스 모드", desc: "비용 걱정 없이 최고 품질로",
    can: ["최고 품질 모델과 넉넉한 사용량", "워터마크 없이 상업적 이용까지", "팀 단위 작업·매주 반복되는 콘텐츠 제작"],
    limit: ["월 비용이 큼 — 프로젝트 기간에만 한 달 결제 후 해지하는 것을 추천"],
  },
];

// steps: 단계마다 하는 일(role)은 같고, 모드별로 쓰는 앱이 달라요.
//   base: 기본 추천 앱
//   free / part / flex: 요금 모드별 앱(app)·요금제(plan)·월 비용(cost, USD, 안 적으면 0)
//   모드에서 하는 일이 조금 다르면 role을 따로 적을 수 있어요.
// scope: 요금 모드별로 이 조합으로 할 수 있는 범위
// example: "예시 보기"를 눌렀을 때 나오는 사용 예시 (단계 순서대로)
const combos = [
  {
    icon: "📑",
    title: "조별 과제 · 발표 준비",
    desc: "자료 조사부터 발표 슬라이드까지 한 번에",
    tags: ["과제", "발표"],
    scope: {
      free: "발표 1번 분량은 충분해요. 다만 Gamma 무료 크레딧으로는 슬라이드를 몇 번만 생성할 수 있고, Claude는 하루 사용량이 금방 차요.",
      part: "원고는 Claude Pro로 마음껏 고치고, Gamma Plus(월 1,000크레딧)로 슬라이드를 여러 번 다시 만들 수 있어요. 과제가 많은 학기에 적당해요.",
      flex: "Perplexity Pro로 깊이 있는 조사, 노트북LM 확장 한도, Claude Max의 넉넉한 사용량, Gamma Pro(월 4,000크레딧)까지. 팀 자료를 한 사람이 다 처리해도 막히지 않아요.",
    },
    steps: [
      {
        role: "출처가 달린 자료 조사",
        base: { app: "Perplexity" },
        free: { app: "Perplexity", plan: "무료" },
        part: { app: "Perplexity", plan: "무료" },
        flex: { app: "Perplexity", plan: "Pro", cost: 20 },
      },
      {
        role: "모은 자료만 근거로 요약·질의응답",
        base: { app: "노트북LM (NotebookLM)" },
        free: { app: "노트북LM (NotebookLM)", plan: "무료" },
        part: { app: "노트북LM (NotebookLM)", plan: "무료" },
        flex: { app: "노트북LM (NotebookLM)", plan: "Google AI Pro", cost: 19.99 },
      },
      {
        role: "발표 원고·보고서 다듬기",
        base: { app: "Claude" },
        free: { app: "Claude", plan: "무료" },
        part: { app: "Claude", plan: "Pro", cost: 20 },
        flex: { app: "Claude", plan: "Max", cost: 100 },
      },
      {
        role: "주제만 넣고 슬라이드 초안 만들기",
        base: { app: "Gamma" },
        free: { app: "Gamma", plan: "무료 크레딧" },
        part: { app: "Gamma", plan: "Plus", cost: 9 },
        flex: { app: "Gamma", plan: "Pro", cost: 18 },
      },
      {
        role: "핵심 내용을 도식·인포그래픽으로",
        base: { app: "Napkin" },
        free: { app: "Napkin", plan: "무료" },
        part: { app: "Napkin", plan: "무료" },
        flex: { app: "Napkin", plan: "Pro", cost: 22 },
      },
    ],
    example: {
      scenario: "‘생성형 AI가 대학 교육에 미치는 영향’으로 10분 조별 발표를 준비하는 상황",
      steps: [
        {
          how: "주제를 넣고 믿을 만한 기사·보고서를 찾은 뒤, 마음에 드는 출처 링크를 모아 둡니다.",
          prompt: "생성형 AI가 대학 교육에 미치는 영향에 대해 2025년 이후 국내외 조사·통계 자료를 찾아줘. 장점과 우려를 나눠서 출처와 함께 정리해줘.",
          output: "출처 링크가 달린 요약 + 읽어 볼 원문 5~10개",
        },
        {
          how: "찾은 원문 링크·PDF를 노트북에 올리고, 자료 안에서만 답하게 질문합니다.",
          prompt: "올린 자료들을 근거로 발표에 쓸 핵심 주장 3개와 각각의 근거 수치를 뽑아줘.",
          output: "자료 안에서만 뽑은 핵심 주장과 근거 (엉뚱한 지어내기가 적음)",
        },
        {
          how: "뽑은 내용을 붙여넣고 발표 대본으로 바꿔 달라고 합니다.",
          prompt: "아래 내용을 10분 발표 대본으로 써줘. 도입-본론 3개-결론 구조로, 대학생이 말하듯 자연스럽게.",
          output: "슬라이드별로 나눠진 발표 대본",
        },
        {
          how: "대본을 그대로 붙여넣고 ‘텍스트로 만들기’를 선택하면 슬라이드가 생성됩니다.",
          prompt: "이 대본으로 12장짜리 발표 자료를 만들어줘. 깔끔한 남색 테마로.",
          output: "디자인이 입혀진 발표 슬라이드 초안",
        },
        {
          how: "설명이 긴 슬라이드의 문장을 붙여넣고 마음에 드는 도식을 골라 슬라이드에 넣습니다.",
          prompt: "",
          output: "비교표·흐름도 같은 인포그래픽 이미지",
        },
      ],
      tips: [
        "통계 수치는 Perplexity가 단 출처 원문에서 꼭 한 번 더 확인하세요.",
        "완전 무료 모드는 Gamma 크레딧이 빨리 닳으니, 슬라이드 생성은 대본을 완성한 뒤 한 번에 하세요.",
        "조원끼리 자료 조사 → 대본 → 슬라이드를 나눠 맡으면 시간이 크게 줄어요.",
      ],
    },
  },
  {
    icon: "🎬",
    title: "유튜브 쇼츠 · 짧은 영상",
    desc: "대본 → 장면 이미지 → 영상 → 목소리 → 배경음악",
    tags: ["영상", "SNS"],
    scope: {
      free: "쇼츠 1~2편을 연습해 볼 수 있어요. Kling은 무료 크레딧 안에서만 만들 수 있고, ElevenLabs·Suno 무료는 상업 이용이 안 돼 수익 창출 채널엔 쓸 수 없어요.",
      part: "미드저니 Basic과 Kling Standard(월 660크레딧)로 장면 품질을 올려 꾸준히 만들 수 있어요. 음성·음악은 무료라 비상업 채널에 적합해요.",
      flex: "Higgsfield에서 Veo·Kling 등 여러 영상 모델을 골라 쓰고, ElevenLabs Creator·Suno Premier로 상업 이용까지 가능해요. 수익 창출 채널을 운영할 수준이에요.",
    },
    steps: [
      {
        role: "아이디어·대본 쓰기",
        base: { app: "ChatGPT" },
        free: { app: "ChatGPT", plan: "무료" },
        part: { app: "ChatGPT", plan: "무료" },
        flex: { app: "ChatGPT", plan: "Plus", cost: 20 },
      },
      {
        role: "장면별 고퀄리티 이미지 만들기",
        base: { app: "미드저니 (Midjourney)" },
        free: { app: "ImageFX", plan: "무료" },
        part: { app: "미드저니 (Midjourney)", plan: "Basic", cost: 10 },
        flex: { app: "미드저니 (Midjourney)", plan: "Standard", cost: 30 },
      },
      {
        role: "이미지를 자연스럽게 움직이는 영상으로",
        base: { app: "Kling" },
        free: { app: "Kling", plan: "무료 크레딧" },
        part: { app: "Kling", plan: "Standard", cost: 10 },
        flex: { app: "Higgsfield", plan: "Plus", cost: 39 },
      },
      {
        role: "사람 같은 내레이션 입히기",
        base: { app: "ElevenLabs" },
        free: { app: "ElevenLabs", plan: "무료 (비상업)" },
        part: { app: "ElevenLabs", plan: "무료 (비상업)" },
        flex: { app: "ElevenLabs", plan: "Creator", cost: 22 },
      },
      {
        role: "분위기에 맞는 배경음악 만들기",
        base: { app: "Suno" },
        free: { app: "Suno", plan: "무료 (비상업)" },
        part: { app: "Suno", plan: "무료 (비상업)" },
        flex: { app: "Suno", plan: "Premier", cost: 24 },
      },
    ],
    example: {
      scenario: "‘하루 만에 알아보는 고양이의 비밀’ 같은 40초 정보형 쇼츠를 만드는 상황",
      steps: [
        {
          how: "주제를 주고 장면별로 나눈 대본과 이미지 설명을 함께 받아요.",
          prompt: "고양이에 대한 신기한 사실 4가지로 40초 쇼츠 대본을 써줘. 장면 4개로 나누고, 장면마다 내레이션과 이미지 프롬프트(영어)를 같이 줘.",
          output: "장면별 내레이션 + 영어 이미지 프롬프트",
        },
        {
          how: "받은 영어 프롬프트를 넣고 세로(9:16) 비율로 장면 이미지를 만듭니다.",
          prompt: "a fluffy orange cat looking curiously at a glass of water, cinematic lighting, cozy room, vertical",
          output: "세로 장면 이미지 4장",
        },
        {
          how: "이미지를 올리고 어떤 움직임을 원하는지 짧게 적어 5초 영상으로 만듭니다.",
          prompt: "the cat slowly tilts its head and blinks, camera slowly zooms in",
          output: "장면마다 5초짜리 움직이는 영상",
        },
        {
          how: "대본 내레이션을 붙여넣고 목소리를 골라 음성 파일로 저장해요.",
          prompt: "",
          output: "자연스러운 한국어 내레이션 mp3",
        },
        {
          how: "영상 분위기를 말로 설명하고 ‘Instrumental(가사 없음)’을 켜서 배경음악을 만듭니다.",
          prompt: "cute and playful lo-fi background music, light piano, 40 seconds",
          output: "영상에 깔 배경음악",
        },
      ],
      tips: [
        "무료 플랜으로 만든 음성·음악은 상업적 이용(수익 창출 채널 등)이 안 될 수 있어요.",
        "마지막 편집(자르기·자막·합치기)은 CapCut 같은 편집 앱으로 하면 편해요.",
        "무료 크레딧이 적은 앱이 많으니 장면 수를 먼저 정하고 시작하세요.",
      ],
    },
  },
  {
    icon: "🌐",
    title: "포트폴리오 웹사이트",
    desc: "코딩 없이 디자인하고 바로 발행하기",
    tags: ["웹", "디자인"],
    scope: {
      free: "사이트 하나를 만들어 ‘○○.framer.website’ 주소로 공개할 수 있어요. 디자인 툴은 무료 플랜의 파일·크레딧 제한이 있어요.",
      part: "Framer Basic으로 내 도메인(예: myname.com)을 연결할 수 있어요. 취업·지원서 제출용으로 딱 좋아요.",
      flex: "Uizard Pro로 스케치를 넉넉히 변환하고, Figma Professional로 파일·버전 관리, Recraft Pro로 아이콘 대량 제작, Framer Pro로 페이지가 많은 사이트까지 만들 수 있어요.",
    },
    steps: [
      {
        role: "손 스케치를 와이어프레임으로",
        base: { app: "Uizard" },
        free: { app: "Galileo AI", plan: "무료", role: "글로 설명해서 와이어프레임 만들기" },
        part: { app: "Galileo AI", plan: "무료", role: "글로 설명해서 와이어프레임 만들기" },
        flex: { app: "Uizard", plan: "Pro", cost: 12 },
      },
      {
        role: "화면 디자인 다듬기",
        base: { app: "Figma" },
        free: { app: "Figma", plan: "무료" },
        part: { app: "Figma", plan: "무료" },
        flex: { app: "Figma", plan: "Professional", cost: 15 },
      },
      {
        role: "통일감 있는 아이콘·일러스트 만들기",
        base: { app: "Recraft" },
        free: { app: "Recraft", plan: "무료" },
        part: { app: "Recraft", plan: "무료" },
        flex: { app: "Recraft", plan: "Pro", cost: 16 },
      },
      {
        role: "디자인을 반응형 사이트로 발행",
        base: { app: "Framer" },
        free: { app: "Framer", plan: "무료 (기본 주소)" },
        part: { app: "Framer", plan: "Basic (내 도메인)", cost: 10 },
        flex: { app: "Framer", plan: "Pro", cost: 30 },
      },
    ],
    example: {
      scenario: "취업·대외활동용으로 내 작업물 4개를 보여 주는 1페이지 포트폴리오 사이트를 만드는 상황",
      steps: [
        {
          how: "원하는 구성을 글로 적거나 종이에 그린 화면을 올려 화면 뼈대를 받아요.",
          prompt: "디자인 전공 대학생 포트폴리오 사이트. 상단에 이름과 한 줄 소개, 가운데 작업물 4개 카드, 아래 연락처.",
          output: "편집 가능한 화면 뼈대(와이어프레임)",
        },
        {
          how: "만든 화면을 가져와 색·글꼴·여백을 내 스타일로 다듬습니다.",
          prompt: "",
          output: "완성된 화면 디자인 시안",
        },
        {
          how: "사이트 분위기에 맞는 아이콘이나 일러스트를 같은 스타일로 여러 개 만들어요.",
          prompt: "minimal line icons for: design, video, writing, contact — navy and yellow color",
          output: "스타일이 통일된 아이콘 세트 (SVG)",
        },
        {
          how: "Figma 디자인을 플러그인으로 옮기거나 Framer에서 바로 꾸민 뒤 ‘Publish’를 눌러 발행합니다.",
          prompt: "",
          output: "휴대폰에서도 잘 보이는 나만의 사이트 주소",
        },
      ],
      tips: [
        "작업물 이미지는 미리 같은 비율로 잘라 두면 카드가 깔끔하게 정렬돼요.",
        "무료 요금제는 주소에 ‘.framer.website’가 붙어요. 제출용으로 내 도메인이 필요하면 일부 유료 모드를 고르세요.",
      ],
    },
  },
  {
    icon: "🎙️",
    title: "회의 · 인터뷰 기록",
    desc: "녹음만 하면 정리된 회의록이 완성",
    tags: ["업무", "기록"],
    scope: {
      free: "클로바노트 월 300분(데이터 활용 동의 시 600분)이라 1시간 회의를 한 달에 5번 정도 기록할 수 있어요. 요약은 Claude 무료로 가능해요.",
      part: "받아쓰기는 그대로 월 300분, 요약은 Claude Pro로 긴 회의록도 한 번에 처리해요. 회의가 한 달 5번 안팎인 조 활동에 적당해요.",
      flex: "Tiro Max로 받아쓰기 무제한·실시간 기록, Notion Business의 AI 회의 노트까지 써요. 매일 회의하는 팀·동아리 운영진 수준이에요.",
    },
    steps: [
      {
        role: "한국어 녹음을 글로 받아쓰기",
        base: { app: "클로바노트" },
        free: { app: "클로바노트", plan: "무료 (월 300분)" },
        part: { app: "클로바노트", plan: "무료 (월 300분)" },
        flex: { app: "Tiro", plan: "Max (무제한)", cost: 29 },
      },
      {
        role: "결정 사항·할 일만 뽑아 요약",
        base: { app: "Claude" },
        free: { app: "Claude", plan: "무료" },
        part: { app: "Claude", plan: "Pro", cost: 20 },
        flex: { app: "Claude", plan: "Pro", cost: 20 },
      },
      {
        role: "팀 노트에 정리해서 공유",
        base: { app: "Notion" },
        free: { app: "Notion", plan: "무료" },
        part: { app: "Notion", plan: "무료" },
        flex: { app: "Notion", plan: "Business (AI 회의 노트)", cost: 20 },
      },
    ],
    example: {
      scenario: "1시간짜리 조 회의를 녹음하고, 끝나자마자 회의록을 공유하는 상황",
      steps: [
        {
          how: "회의 시작 전에 앱으로 녹음을 켜고, 끝나면 참석자 수를 지정해 받아쓰기를 돌립니다.",
          prompt: "",
          output: "말한 사람별로 나뉜 전체 대화 텍스트",
        },
        {
          how: "받아쓴 텍스트를 복사해서 붙여넣고 회의록 형식으로 요약해 달라고 합니다.",
          prompt: "아래 회의 기록을 회의록으로 정리해줘. ① 결정된 것 ② 할 일(담당자·마감일) ③ 다음에 논의할 것 순서로, 짧게.",
          output: "결정 사항·할 일·다음 안건이 정리된 회의록",
        },
        {
          how: "팀 페이지에 회의록을 붙이고, 할 일은 체크박스로 바꿔 담당자를 태그해요.",
          prompt: "",
          output: "조원 모두가 보고 체크할 수 있는 회의 기록 페이지",
        },
      ],
      tips: [
        "녹음 전에 참석자 모두에게 녹음 동의를 꼭 받으세요.",
        "회의가 길고 잦다면 Claude 무료 사용량이 금방 차요. 그럴 땐 일부 유료 모드가 편해요.",
        "인터뷰라면 ②번 프롬프트를 ‘핵심 답변과 인용할 만한 문장’으로 바꿔 보세요.",
      ],
    },
  },
  {
    icon: "📚",
    title: "논문 · 학술 리서치",
    desc: "근거 있는 자료를 찾고 구조를 한눈에",
    tags: ["리서치", "공부"],
    scope: {
      free: "Consensus 무료 검색 횟수 안에서 논문을 찾고, AlphaXiv·노트북LM·Mapify 기본 기능으로 리포트 1편 분량은 충분해요.",
      part: "Consensus Pro로 논문 검색·분석 한도가 크게 늘어나요. 졸업 논문·긴 리포트를 준비할 때 적당해요.",
      flex: "Consensus Deep으로 심층 리서치 보고서, 노트북LM 확장 한도로 논문 여러 편 동시 비교, Mapify 무제한 마인드맵까지. 대학원·연구실 수준이에요.",
    },
    steps: [
      {
        role: "논문 근거로 답 찾기",
        base: { app: "Consensus" },
        free: { app: "Consensus", plan: "무료" },
        part: { app: "Consensus", plan: "Pro", cost: 20 },
        flex: { app: "Consensus", plan: "Deep", cost: 65 },
      },
      {
        role: "arXiv 논문을 AI와 함께 읽기",
        base: { app: "AlphaXiv" },
        free: { app: "AlphaXiv", plan: "무료" },
        part: { app: "AlphaXiv", plan: "무료" },
        flex: { app: "AlphaXiv", plan: "무료" },
      },
      {
        role: "논문 여러 편을 올려 비교·정리",
        base: { app: "노트북LM (NotebookLM)" },
        free: { app: "노트북LM (NotebookLM)", plan: "무료" },
        part: { app: "노트북LM (NotebookLM)", plan: "무료" },
        flex: { app: "노트북LM (NotebookLM)", plan: "Google AI Pro", cost: 19.99 },
      },
      {
        role: "내용을 마인드맵으로 구조화",
        base: { app: "Mapify" },
        free: { app: "Mapify", plan: "무료" },
        part: { app: "Mapify", plan: "무료" },
        flex: { app: "Mapify", plan: "Unlimited", cost: 17.99 },
      },
    ],
    example: {
      scenario: "‘수면 시간이 학업 성취도에 영향을 주는가’로 문헌 조사 리포트를 쓰는 상황",
      steps: [
        {
          how: "연구 질문을 그대로 물어보면 관련 논문들이 ‘그렇다/아니다’로 어떻게 답하는지 보여 줍니다.",
          prompt: "Does sleep duration affect academic performance in college students?",
          output: "관련 논문 목록 + 연구 결과의 전반적인 방향",
        },
        {
          how: "핵심 논문이 arXiv에 있으면 열어서 어려운 문단을 드래그해 바로 질문해요.",
          prompt: "이 실험 방법을 고등학생도 이해할 수 있게 설명해줘.",
          output: "어려운 부분의 쉬운 설명",
        },
        {
          how: "읽은 논문 PDF 3~5편을 올리고 비교표를 만들어 달라고 합니다.",
          prompt: "올린 논문들을 연구 대상, 방법, 주요 결과, 한계로 나눠 표로 비교해줘.",
          output: "논문 비교표 (출처 문장 바로 확인 가능)",
        },
        {
          how: "비교 정리 내용을 넣어 마인드맵으로 바꾸고, 리포트 목차를 잡는 데 씁니다.",
          prompt: "",
          output: "주제 → 하위 주장 → 근거 논문 구조의 마인드맵",
        },
      ],
      tips: [
        "리포트에 인용할 때는 AI 요약이 아니라 논문 원문을 직접 인용하세요.",
        "Consensus는 연 결제하면 Pro가 월 $12로 내려가요.",
        "영어 논문은 질문도 영어로 하면 검색 결과가 더 정확해요.",
      ],
    },
  },
  {
    icon: "🎨",
    title: "웹툰 · 스토리 만화",
    desc: "줄거리부터 컷 나누기, 그림까지",
    tags: ["창작", "만화"],
    scope: {
      free: "Anifusion 무료 크레딧으로 짧은 한 편을 시험해 볼 정도예요. 스토리·스토리보드·표지는 무료로 충분해요.",
      part: "Anifusion Creator(2,000크레딧)로 여러 편을 그려 연재 연습을 할 수 있어요. 나머지 단계는 무료로 충분해요.",
      flex: "Claude Pro로 긴 세계관·시나리오, Anifusion Pro(10,000크레딧)로 연재 분량, Ideogram Plus로 표지 시안 여러 장까지 만들 수 있어요.",
    },
    steps: [
      {
        role: "줄거리·캐릭터 설정 짜기",
        base: { app: "ChatGPT" },
        free: { app: "ChatGPT", plan: "무료" },
        part: { app: "ChatGPT", plan: "무료" },
        flex: { app: "Claude", plan: "Pro", cost: 20 },
      },
      {
        role: "대본을 컷별 스토리보드로",
        base: { app: "StoryTribe" },
        free: { app: "StoryTribe", plan: "무료" },
        part: { app: "StoryTribe", plan: "무료" },
        flex: { app: "StoryTribe", plan: "Pro", cost: 12.99 },
      },
      {
        role: "말풍선 들어간 만화 컷 그리기",
        base: { app: "Anifusion" },
        free: { app: "Anifusion", plan: "무료 크레딧" },
        part: { app: "Anifusion", plan: "Creator", cost: 9 },
        flex: { app: "Anifusion", plan: "Pro", cost: 24 },
      },
      {
        role: "글자가 정확한 표지·타이틀 만들기",
        base: { app: "Ideogram" },
        free: { app: "Ideogram", plan: "무료" },
        part: { app: "Ideogram", plan: "무료" },
        flex: { app: "Ideogram", plan: "Plus", cost: 20 },
      },
    ],
    example: {
      scenario: "‘기숙사 룸메이트가 사실 로봇이었다’는 8컷 짜리 짧은 웹툰을 만드는 상황",
      steps: [
        {
          how: "아이디어 한 줄을 주고 캐릭터와 컷별 대본을 받아요.",
          prompt: "‘기숙사 룸메이트가 사실 로봇’이라는 코믹 웹툰 8컷 대본을 써줘. 주인공 2명 외형 설정, 컷마다 장면 설명과 대사를 나눠서.",
          output: "캐릭터 설정 + 컷별 장면·대사",
        },
        {
          how: "컷별 장면 설명을 옮겨 적고 인물 위치·구도를 정해 스토리보드를 만들어요.",
          prompt: "",
          output: "8컷 구도가 잡힌 스토리보드",
        },
        {
          how: "캐릭터를 먼저 등록해 같은 얼굴이 유지되게 한 뒤, 컷마다 장면을 생성하고 말풍선을 넣습니다.",
          prompt: "dorm room at night, a girl surprised as her roommate's arm opens revealing robot parts, webtoon style",
          output: "말풍선까지 들어간 웹툰 컷",
        },
        {
          how: "제목 글자가 들어간 표지를 만들어 첫 장에 붙여요.",
          prompt: "webtoon cover, title text \"내 룸메는 로봇\", two college students, bright pastel colors",
          output: "제목 글자가 정확하게 들어간 표지 이미지",
        },
      ],
      tips: [
        "캐릭터 외형 설명을 한 문장으로 정해 두고 매번 똑같이 넣으면 얼굴이 덜 바뀌어요.",
        "완전 무료 모드는 컷 그리기 크레딧이 가장 먼저 떨어져요. 8컷 이상이면 일부 유료 모드를 고려해 보세요.",
        "한글 제목이 깨지면 영문 제목으로 만든 뒤 Canva에서 한글을 얹는 방법도 있어요.",
      ],
    },
  },
  {
    icon: "📣",
    title: "SNS 카드뉴스 · 홍보물",
    desc: "문구와 이미지를 만들어 템플릿에 담기",
    tags: ["홍보", "SNS"],
    scope: {
      free: "Canva 무료 템플릿과 Ideogram 무료 생성으로 카드뉴스 몇 세트는 충분해요. 프리미엄 템플릿·배경 제거는 쓸 수 없어요.",
      part: "Canva Pro로 프리미엄 템플릿·배경 제거·브랜드 키를 쓸 수 있어요. 동아리·소모임 홍보 담당이라면 이걸로 충분해요.",
      flex: "ChatGPT Plus로 고급 문구와 이미지, Ideogram Plus로 시안 여러 장, Canva Pro까지. 매주 콘텐츠를 올리는 SNS 운영 수준이에요.",
    },
    steps: [
      {
        role: "홍보 문구·해시태그 쓰기",
        base: { app: "ChatGPT" },
        free: { app: "ChatGPT", plan: "무료" },
        part: { app: "ChatGPT", plan: "무료" },
        flex: { app: "ChatGPT", plan: "Plus", cost: 20 },
      },
      {
        role: "문구가 들어간 포스터 이미지",
        base: { app: "Ideogram" },
        free: { app: "Ideogram", plan: "무료" },
        part: { app: "Ideogram", plan: "무료" },
        flex: { app: "Ideogram", plan: "Plus", cost: 20 },
      },
      {
        role: "템플릿으로 카드뉴스 완성",
        base: { app: "Canva" },
        free: { app: "Canva", plan: "무료" },
        part: { app: "Canva", plan: "Pro", cost: 12 },
        flex: { app: "Canva", plan: "Pro", cost: 12 },
      },
    ],
    example: {
      scenario: "동아리 신입 부원 모집을 인스타그램 카드뉴스 5장으로 홍보하는 상황",
      steps: [
        {
          how: "동아리 정보를 주고 카드 한 장에 들어갈 문구 단위로 나눠 달라고 해요.",
          prompt: "사진 동아리 신입 부원 모집 인스타 카드뉴스 5장 문구를 써줘. 1장 후킹 문구, 2~4장 활동 소개, 5장 지원 방법. 해시태그 10개도.",
          output: "카드별 문구 + 해시태그",
        },
        {
          how: "1장(표지)에 쓸 눈에 띄는 포스터 이미지를 문구와 함께 생성합니다.",
          prompt: "poster with bold text \"JOIN US\", vintage film camera, warm sunset colors, square",
          output: "글자가 들어간 표지용 이미지",
        },
        {
          how: "‘인스타그램 게시물’ 템플릿을 고르고 표지 이미지와 문구를 장마다 넣어 완성해요.",
          prompt: "",
          output: "바로 올릴 수 있는 1080×1080 카드뉴스 5장",
        },
      ],
      tips: [
        "Canva Pro는 유료 템플릿·배경 제거를 쓸 수 있고, 학생이면 교육용 무료 혜택이 있는지도 확인해 보세요.",
        "동아리 로고·색을 ‘브랜드’로 저장해 두면 다음 홍보물도 금방 만들어요.",
      ],
    },
  },
  {
    icon: "🎵",
    title: "나만의 노래 · 뮤직비디오",
    desc: "작곡부터 앨범 커버, 노래하는 캐릭터까지",
    tags: ["음악", "영상"],
    scope: {
      free: "노래·커버·영상 모두 만들 수 있지만 Suno는 비상업, Hedra는 무료 100크레딧에 워터마크가 붙어요. 개인 선물용으로는 충분해요.",
      part: "Suno Pro(월 2,500크레딧)로 상업 이용이 되는 노래를 만들 수 있어요. 영상에는 워터마크가 남아요.",
      flex: "Suno Premier(월 10,000크레딧), Ideogram Plus, Hedra Creator(5,400크레딧·워터마크 제거·상업 이용)로 유튜브에 뮤직비디오를 올릴 수준이에요.",
    },
    steps: [
      {
        role: "분위기만 말해서 노래 만들기",
        base: { app: "Suno" },
        free: { app: "Suno", plan: "무료 (비상업)" },
        part: { app: "Suno", plan: "Pro (상업 이용)", cost: 8 },
        flex: { app: "Suno", plan: "Premier", cost: 24 },
      },
      {
        role: "앨범 커버 디자인",
        base: { app: "Ideogram" },
        free: { app: "Ideogram", plan: "무료" },
        part: { app: "Ideogram", plan: "무료" },
        flex: { app: "Ideogram", plan: "Plus", cost: 20 },
      },
      {
        role: "사진 한 장으로 노래하는 캐릭터 영상",
        base: { app: "Hedra" },
        free: { app: "Hedra", plan: "무료 (워터마크)" },
        part: { app: "Hedra", plan: "무료 (워터마크)" },
        flex: { app: "Hedra", plan: "Creator", cost: 30 },
      },
    ],
    example: {
      scenario: "친구 생일 축하곡을 만들어 짧은 뮤직비디오로 선물하는 상황",
      steps: [
        {
          how: "분위기와 들어갈 내용을 적어 노래를 만들고, 마음에 드는 버전을 골라요. 가사를 직접 써서 넣을 수도 있어요.",
          prompt: "밝고 신나는 K-pop 스타일 생일 축하 노래, 친구 이름 ‘지민’, 함께한 여행 추억, 1분",
          output: "보컬이 들어간 1분짜리 노래 2곡(골라 쓰기)",
        },
        {
          how: "노래 제목이 들어간 앨범 커버를 만들어요.",
          prompt: "album cover, title text \"HAPPY JIMIN DAY\", confetti, pastel pop art style",
          output: "앨범 커버 이미지",
        },
        {
          how: "캐릭터 이미지(또는 본인 동의를 받은 사진)와 노래 파일을 올려 립싱크 영상을 만듭니다.",
          prompt: "",
          output: "노래에 맞춰 입을 움직이는 캐릭터 영상",
        },
      ],
      tips: [
        "다른 사람 얼굴 사진은 꼭 본인 동의를 받고 사용하세요.",
        "개인 선물이면 완전 무료로 충분해요. 유튜브 등에 올려 수익을 낼 거라면 상업 이용이 되는 유료 플랜이 필요해요.",
      ],
    },
  },
  {
    icon: "⚙️",
    title: "반복 업무 자동화 · 챗봇",
    desc: "문서 기반 챗봇을 만들고 다른 앱과 연결",
    tags: ["자동화", "업무"],
    scope: {
      free: "Dify 무료로 챗봇을 만들고, n8n은 직접 설치하면 무료로 자동화 흐름을 만들 수 있어요. 대신 설치·관리를 직접 해야 해요.",
      part: "설치 없이 Make Core로 바로 자동화를 연결해요. 학과·동아리 단위 FAQ 챗봇 운영에 적당해요.",
      flex: "Dify Professional로 챗봇 사용 한도를 늘리고, Zapier로 많은 앱을 손쉽게 연결, Notion Business까지. 실제 업무에 상시 운영하는 수준이에요.",
    },
    steps: [
      {
        role: "우리 문서로 답하는 챗봇 만들기",
        base: { app: "Dify" },
        free: { app: "Dify", plan: "무료" },
        part: { app: "Dify", plan: "무료" },
        flex: { app: "Dify", plan: "Professional", cost: 49 },
      },
      {
        role: "챗봇·메일·시트를 흐름으로 연결",
        base: { app: "n8n" },
        free: { app: "n8n", plan: "자체 설치 무료" },
        part: { app: "Make", plan: "Core", cost: 12 },
        flex: { app: "Zapier", plan: "Professional", cost: 19.99 },
      },
      {
        role: "결과를 자동으로 기록",
        base: { app: "Notion" },
        free: { app: "Notion", plan: "무료" },
        part: { app: "Notion", plan: "무료" },
        flex: { app: "Notion", plan: "Business", cost: 20 },
      },
    ],
    example: {
      scenario: "학과 행사 FAQ 챗봇을 만들고, 챗봇이 못 답한 질문은 자동으로 모아 두는 상황",
      steps: [
        {
          how: "‘지식(Knowledge)’에 행사 안내문·FAQ 문서를 올리고 챗봇 앱을 만들어 지시문을 적어요.",
          prompt: "너는 학과 행사 안내 도우미야. 올린 문서에 있는 내용으로만 답하고, 모르면 ‘담당자에게 전달할게요’라고 답해.",
          output: "우리 문서로만 답하는 챗봇 + 공유 링크",
        },
        {
          how: "‘챗봇이 모른다고 답하면 → 그 질문을 저장’하는 흐름을 블록(노드)을 이어 만들어요.",
          prompt: "",
          output: "답 못 한 질문을 자동으로 넘겨주는 자동화 흐름",
        },
        {
          how: "자동화 도구가 넘겨준 질문을 노션 데이터베이스에 한 줄씩 쌓이게 연결합니다.",
          prompt: "",
          output: "담당자가 확인할 ‘미답변 질문’ 목록",
        },
      ],
      tips: [
        "처음엔 Dify 챗봇만 만들어도 충분해요. 자동화는 익숙해지면 하나씩 붙이세요.",
        "완전 무료 모드의 n8n은 내 컴퓨터·서버에 직접 설치해야 해요. 설치가 어렵다면 일부 유료 모드의 Make처럼 바로 쓰는 클라우드형이 편해요.",
      ],
    },
  },
  // 여기에 계속 추가
];
