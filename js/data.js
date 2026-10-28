/* =========================================================
   data.js — 韩语内容数据层
   ========================================================= */
window.KC = window.KC || {};
(function (KC) {
  'use strict';

  /* ---------------- 1. 韩文字母表 ---------------- */
  KC.ALPHABET = {
    vowel: [
      { ch: 'ㅏ', s: 'a', ex: '아이' }, { ch: 'ㅐ', s: 'ae', ex: '애기' },
      { ch: 'ㅑ', s: 'ya', ex: '야자' }, { ch: 'ㅒ', s: 'yae', ex: '얘기' },
      { ch: 'ㅓ', s: 'eo', ex: '어른' }, { ch: 'ㅔ', s: 'e', ex: '에너지' },
      { ch: 'ㅕ', s: 'yeo', ex: '여자' }, { ch: 'ㅖ', s: 'ye', ex: '예술' },
      { ch: 'ㅗ', s: 'o', ex: '오이' }, { ch: 'ㅘ', s: 'wa', ex: '과일' },
      { ch: 'ㅙ', s: 'wae', ex: '돼지' }, { ch: 'ㅚ', s: 'oe', ex: '외국' },
      { ch: 'ㅛ', s: 'yo', ex: '요리' }, { ch: 'ㅜ', s: 'u', ex: '우유' },
      { ch: 'ㅝ', s: 'wo', ex: '워낙' }, { ch: 'ㅞ', s: 'we', ex: '웨딩' },
      { ch: 'ㅟ', s: 'wi', ex: '위치' }, { ch: 'ㅠ', s: 'yu', ex: '유리' },
      { ch: 'ㅡ', s: 'eu', ex: '음악' }, { ch: 'ㅢ', s: 'ui', ex: '의자' },
      { ch: 'ㅣ', s: 'i', ex: '이름' }
    ],
    consonant: [
      { ch: 'ㄱ', s: 'g/k', ex: '가다' }, { ch: 'ㄲ', s: 'kk', ex: '까치' },
      { ch: 'ㄴ', s: 'n', ex: '나비' }, { ch: 'ㄷ', s: 'd/t', ex: '다리' },
      { ch: 'ㄸ', s: 'tt', ex: '따다' }, { ch: 'ㄹ', s: 'r/l', ex: '라디오' },
      { ch: 'ㅁ', s: 'm', ex: '모자' }, { ch: 'ㅂ', s: 'b/p', ex: '바다' },
      { ch: 'ㅃ', s: 'pp', ex: '빠르다' }, { ch: 'ㅅ', s: 's', ex: '사자' },
      { ch: 'ㅆ', s: 'ss', ex: '싸다' }, { ch: 'ㅇ', s: 'ng', ex: '안녕' },
      { ch: 'ㅈ', s: 'j', ex: '자동차' }, { ch: 'ㅉ', s: 'jj', ex: '짜다' },
      { ch: 'ㅊ', s: 'ch', ex: '차표' }, { ch: 'ㅋ', s: 'k', ex: '카메라' },
      { ch: 'ㅌ', s: 't', ex: '토마토' }, { ch: 'ㅍ', s: 'p', ex: '파티' },
      { ch: 'ㅎ', s: 'h', ex: '하늘' }
    ],
    final: [
      { ch: 'ㄱ', s: '[k] ㄲ ㅋ', ex: '국·밖·부엌' },
      { ch: 'ㄴ', s: '[n]', ex: '산·눈' },
      { ch: 'ㄷ', s: '[t] ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ', ex: '낮·꽃' },
      { ch: 'ㄹ', s: '[l]', ex: '물·별' },
      { ch: 'ㅁ', s: '[m]', ex: '마음·봄' },
      { ch: 'ㅂ', s: '[p] ㅍ', ex: '밥·잎' },
      { ch: 'ㅇ', s: '[ng]', ex: '사랑·서울' }
    ]
  };

  /* ---------------- 2. 分级会话课程 ---------------- */
  KC.LESSONS = [
    {
      id: 'l1', level: 'beginner', ko: '인사하기', cn: '问候用语',
      sentences: [
        { ko: '안녕하세요.', rom: 'annyeonghaseyo.', zh: '你好。（最常用的敬语问候）' },
        { ko: '안녕!', rom: 'annyeong!', zh: '嗨！（对朋友的非敬语）' },
        { ko: '처음 뵙겠습니다.', rom: 'cheoeum boepgesseumnida.', zh: '初次见面，请多关照。' },
        { ko: '만나서 반가워요.', rom: 'mannaseo bangawoyo.', zh: '很高兴见到你。' },
        { ko: '이름이 뭐예요?', rom: 'ireumi mwoyeyo?', zh: '你叫什么名字？' },
        { ko: '저는 민서예요.', rom: 'jeoneun minseoyeyo.', zh: '我叫敏书。' },
        { ko: '잘 부탁드립니다.', rom: 'jal butakdeureumnida.', zh: '请多多关照。' },
        { ko: '안녕히 가세요.', rom: 'annyeonghi gaseyo.', zh: '再见。（对离开的人说）' },
        { ko: '안녕히 계세요.', rom: 'annyeonghi gyeseyo.', zh: '再见。（自己离开时说）' },
        { ko: '오랜만이에요.', rom: 'oraenmanieyo.', zh: '好久不见。' }
      ]
    },
    {
      id: 'l2', level: 'beginner', ko: '자기소개', cn: '自我介绍',
      sentences: [
        { ko: '저는 한국어를 공부해요.', rom: 'jeoneun hangugeoreul gongbuhaeyo.', zh: '我在学习韩语。' },
        { ko: '저는 학생이에요.', rom: 'jeoneun haksaengieyo.', zh: '我是学生。' },
        { ko: '서울에 살아요.', rom: 'seoure sarayo.', zh: '我住在首尔。' },
        { ko: '취미는 음악 감상이에요.', rom: 'chwimineun eumak gamsangieyo.', zh: '我的爱好是听音乐。' },
        { ko: '스무 살이에요.', rom: 'seumu sarieyo.', zh: '我二十岁。' },
        { ko: '한국 음식을 좋아해요.', rom: 'hanguk eumsigeul joahaeyo.', zh: '我喜欢韩国菜。' },
        { ko: '회사원이에요.', rom: 'hoesawonieyo.', zh: '我是公司职员。' },
        { ko: '중국에서 왔어요.', rom: 'jungugeseo wasseoyo.', zh: '我来自中国。' },
        { ko: '잘 부탁해요.', rom: 'jal butakhaeyo.', zh: '请多关照。' },
        { ko: '그쪽은요?', rom: 'geujjogeunyo?', zh: '你呢？' }
      ]
    },
    {
      id: 'l3', level: 'beginner', ko: '카페에서', cn: '在咖啡厅',
      sentences: [
        { ko: '아메리카노 한 잔 주세요.', rom: 'amerikano han jan juseyo.', zh: '请给我一杯美式咖啡。' },
        { ko: '메뉴판 좀 주세요.', rom: 'menyupanjom juseyo.', zh: '请给我看一下菜单。' },
        { ko: '아이스로 할게요.', rom: 'aiseuro halkkeyo.', zh: '我要冰的。' },
        { ko: '뜨거운 걸로 주세요.', rom: 'tteugeoun geollo juseyo.', zh: '请给我热的。' },
        { ko: '여기서 마실게요.', rom: 'yeogiseo masilkkeyo.', zh: '我在这里喝。' },
        { ko: '얼마예요?', rom: 'eolmayeyo?', zh: '多少钱？' },
        { ko: '카드로 계산할게요.', rom: 'kadeuro gyesanhalkkeyo.', zh: '我用卡结账。' },
        { ko: '맛있어요!', rom: 'masisseoyo!', zh: '好喝！/好吃！' },
        { ko: '여기요!', rom: 'yeogiyo!', zh: '不好意思，这里！（叫服务员）' },
        { ko: '조금만 덜 달게 해 주세요.', rom: 'jogeumman deol dalge hae juseyo.', zh: '请少放点糖。' }
      ]
    },
    {
      id: 'l4', level: 'beginner', ko: '음식과 식사', cn: '美食与用餐',
      sentences: [
        { ko: '배고파요.', rom: 'baegopayo.', zh: '我饿了。' },
        { ko: '잘 먹겠습니다.', rom: 'jal meokgesseumnida.', zh: '我开动了。（用餐前）' },
        { ko: '잘 먹었습니다.', rom: 'jal meogeotseumnida.', zh: '我吃好了。（用餐后）' },
        { ko: '이거 뭐예요?', rom: 'igeo mwoyeyo?', zh: '这是什么？' },
        { ko: '매운 거 좋아해요?', rom: 'maeun geo joahaeyo?', zh: '你喜欢辣的吗？' },
        { ko: '물 좀 주세요.', rom: 'mul jom juseyo.', zh: '请给我点水。' },
        { ko: '조금만 주세요.', rom: 'jogeumman juseyo.', zh: '请给我一点点。' },
        { ko: '맛이 어때요?', rom: 'masi eottaeyo?', zh: '味道怎么样？' },
        { ko: '너무 맛있어요.', rom: 'neomu masisseoyo.', zh: '太好吃了。' },
        { ko: '배불러요.', rom: 'baebulleoyo.', zh: '我吃饱了。' }
      ]
    },
    {
      id: 'l5', level: 'intermediate', ko: '쇼핑하기', cn: '购物逛街',
      sentences: [
        { ko: '이거 얼마예요?', rom: 'igeo eolmayeyo?', zh: '这个多少钱？' },
        { ko: '다른 색깔 있어요?', rom: 'dareun saekkkal isseoyo?', zh: '有其他颜色吗？' },
        { ko: '입어 봐도 돼요?', rom: 'ibeo bwado dwaeyo?', zh: '我可以试穿吗？' },
        { ko: '사이즈 있어요?', rom: 'saijeu isseoyo?', zh: '有我的尺码吗？' },
        { ko: '좀 깎아 주세요.', rom: 'jom kkakka juseyo.', zh: '请便宜一点吧。' },
        { ko: '너무 비싸요.', rom: 'neomu bissayo.', zh: '太贵了。' },
        { ko: '이걸로 할게요.', rom: 'igeollo halkkeyo.', zh: '我要这个。' },
        { ko: '선물 포장해 주세요.', rom: 'seonmul pojanghae juseyo.', zh: '请帮我礼品包装。' },
        { ko: '현금으로 낼게요.', rom: 'hyeongeumeuro naelkkeyo.', zh: '我付现金。' },
        { ko: '그냥 구경할게요.', rom: 'geunyang gugyeonghalkkeyo.', zh: '我只是随便看看。' }
      ]
    },
    {
      id: 'l6', level: 'intermediate', ko: '길 묻기', cn: '问路交通',
      sentences: [
        { ko: '실례합니다.', rom: 'silryehamnida.', zh: '打扰一下。' },
        { ko: '지하철역이 어디예요?', rom: 'jihacheolyeogi eodiyeyo?', zh: '地铁站在哪里？' },
        { ko: '여기서 멀어요?', rom: 'yeogiseo meoreoyo?', zh: '离这里远吗？' },
        { ko: '어떻게 가요?', rom: 'eotteoke gayo?', zh: '该怎么走？' },
        { ko: '쪽으로 가세요.', rom: 'jjogeuro gaseyo.', zh: '请往那边走。' },
        { ko: '왼쪽으로 가세요.', rom: 'oenjjogeuro gaseyo.', zh: '请往左走。' },
        { ko: '오른쪽에 있어요.', rom: 'oreunjjoge isseoyo.', zh: '在右边。' },
        { ko: '버스로 갈 수 있어요.', rom: 'beoseuro gal su isseoyo.', zh: '可以坐公交去。' },
        { ko: '감사합니다!', rom: 'gamsahamnida!', zh: '非常感谢！' },
        { ko: '지도 좀 보여 주세요.', rom: 'jido jom boyeo juseyo.', zh: '请给我看一下地图。' }
      ]
    },
    {
      id: 'l7', level: 'intermediate', ko: '일상과 감정', cn: '日常与情绪',
      sentences: [
        { ko: '오늘 기분이 좋아요.', rom: 'oneul gibuni joayo.', zh: '今天心情很好。' },
        { ko: '조금 피곤해요.', rom: 'jogeum pigonhaeyo.', zh: '有点累。' },
        { ko: '괜찮아요?', rom: 'gwaenchanayo?', zh: '你还好吗？' },
        { ko: '보고 싶어요.', rom: 'bogo sipeoyo.', zh: '我想你了。' },
        { ko: '축하해요!', rom: 'chukhahaeyo!', zh: '恭喜！' },
        { ko: '화이팅!', rom: 'hwaiting!', zh: '加油！' },
        { ko: '놀랐어요!', rom: 'nollasseoyo!', zh: '吓我一跳！' },
        { ko: '정말 재미있어요.', rom: 'jeongmal jaemiisseoyo.', zh: '真的很有意思。' },
        { ko: '조금 걱정돼요.', rom: 'jogeum geokjeongdwaeyo.', zh: '有点担心。' },
        { ko: '행복해 보여요.', rom: 'haengbokhae boyeoyo.', zh: '看起来很幸福。' }
      ]
    },
    {
      id: 'l8', level: 'intermediate', ko: '시간과 약속', cn: '时间与约定',
      sentences: [
        { ko: '지금 몇 시예요?', rom: 'jigeum myeot siyeyo?', zh: '现在几点？' },
        { ko: '내일 만날까요?', rom: 'naeil mannalkkayo?', zh: '明天见面好吗？' },
        { ko: '몇 시가 좋아요?', rom: 'myeot siga joayo?', zh: '几点合适？' },
        { ko: '일곱 시에 만나요.', rom: 'ilgop sie mannayo.', zh: '我们七点见。' },
        { ko: '조금 늦을 것 같아요.', rom: 'jogeum neujeul geot gatayo.', zh: '我可能会晚一点。' },
        { ko: '토요일은 어때요?', rom: 'toyoireun eottaeyo?', zh: '周六怎么样？' },
        { ko: '괜찮아요, 천천히 오세요.', rom: 'gwaenchanayo, cheoncheonhi oseyo.', zh: '没关系，慢慢来。' },
        { ko: '다음 주에 시간 있어요?', rom: 'daeum jue sigan isseoyo?', zh: '下周有时间吗？' },
        { ko: '약속 잊지 마세요.', rom: 'yaksok itji maseyo.', zh: '别忘了约定哦。' },
        { ko: '그때 봐요!', rom: 'geuttae bwayo!', zh: '到时候见！' }
      ]
    },
    {
      id: 'l9', level: 'advanced', ko: '취미 생활', cn: '兴趣生活',
      sentences: [
        { ko: '요즘 사진 찍는 데 빠졌어요.', rom: 'yojeum sajin jjikneun de ppajyeosseoyo.', zh: '最近迷上了拍照。' },
        { ko: '주말마다 등산을 가요.', rom: 'jumalmada deungsaneul gayo.', zh: '每个周末都去爬山。' },
        { ko: '한국 노래를 자주 들어요.', rom: 'hanguk noraereul jaju deureoyo.', zh: '经常听韩国歌。' },
        { ko: '영화 보는 걸 좋아해요.', rom: 'yeonghwa boneun geol joahaeyo.', zh: '喜欢看电影。' },
        { ko: '배우는 게 많아서 즐거워요.', rom: 'baeuneun ge manaseo jeulgeowoyo.', zh: '能学的东西很多，很开心。' },
        { ko: '책 읽는 걸 좋아해요.', rom: 'chaek ingneun geol joahaeyo.', zh: '喜欢读书。' },
        { ko: '친구들이랑 같이 배워요.', rom: 'chingudeurang gachi baewoyo.', zh: '和朋友一起学。' },
        { ko: '실력이 늘고 있어요.', rom: 'sillyeogi neulgo isseoyo.', zh: '实力在提升。' }
      ]
    },
    {
      id: 'l10', level: 'advanced', ko: '한국 문화', cn: '韩国文化',
      sentences: [
        { ko: '한국 음식은 매운 게 많아요.', rom: 'hanguk eumsigeun maeun ge manayo.', zh: '韩国菜辣的比较多。' },
        { ko: '한복을 입고 사진을 찍었어요.', rom: 'hanbogeul ipgo sajineul jjigeosseoyo.', zh: '穿着韩服拍了照。' },
        { ko: '서울의 봄이 정말 예뻐요.', rom: 'seourui bomi jeongmal yeppeoyo.', zh: '首尔的春天很美。' },
        { ko: '한국 드라마를 자주 봐요.', rom: 'hanguk deuramareul jaju bwayo.', zh: '经常看韩剧。' },
        { ko: '추석에는 가족이 모여요.', rom: 'chuseogeneun gajogi moyeoyo.', zh: '中秋时节家人团聚。' },
        { ko: '문화가 비슷해서 이해가 쉬워요.', rom: 'munhwaga biseutaeseo ihaega swiwoyo.', zh: '文化相近，容易理解。' },
        { ko: '직접 가 보고 싶어요.', rom: 'jikjeop ga bogo sipeoyo.', zh: '想亲自去看看。' },
        { ko: '한국어로 꿈을 꿨어요.', rom: 'hangugeoro kkumeul kkweosseoyo.', zh: '我梦见自己在说韩语。' }
      ]
    }
  ];

  KC.LEVEL_NAME = { beginner: '初级 입문', intermediate: '中级 중급', advanced: '高级 고급' };

  /* ---------------- 3. 核心词汇 ---------------- */
  KC.WORDS = [
    { ko: '사랑', rom: 'sarang', zh: '爱', lv: 'beginner' },
    { ko: '친구', rom: 'chingu', zh: '朋友', lv: 'beginner' },
    { ko: '가족', rom: 'gajok', zh: '家人', lv: 'beginner' },
    { ko: '학교', rom: 'hakgyo', zh: '学校', lv: 'beginner' },
    { ko: '회사', rom: 'hoesa', zh: '公司', lv: 'beginner' },
    { ko: '음식', rom: 'eumsik', zh: '食物', lv: 'beginner' },
    { ko: '물', rom: 'mul', zh: '水', lv: 'beginner' },
    { ko: '밥', rom: 'bap', zh: '饭', lv: 'beginner' },
    { ko: '커피', rom: 'keopi', zh: '咖啡', lv: 'beginner' },
    { ko: '노래', rom: 'norae', zh: '歌曲', lv: 'beginner' },
    { ko: '음악', rom: 'eumak', zh: '音乐', lv: 'beginner' },
    { ko: '영화', rom: 'yeonghwa', zh: '电影', lv: 'beginner' },
    { ko: '책', rom: 'chaek', zh: '书', lv: 'beginner' },
    { ko: '시간', rom: 'sigan', zh: '时间', lv: 'beginner' },
    { ko: '오늘', rom: 'oneul', zh: '今天', lv: 'beginner' },
    { ko: '내일', rom: 'naeil', zh: '明天', lv: 'beginner' },
    { ko: '어제', rom: 'eoje', zh: '昨天', lv: 'beginner' },
    { ko: '주말', rom: 'jumal', zh: '周末', lv: 'beginner' },
    { ko: '날씨', rom: 'nalssi', zh: '天气', lv: 'beginner' },
    { ko: '고양이', rom: 'goyangi', zh: '猫', lv: 'beginner' },
    { ko: '강아지', rom: 'gangaji', zh: '小狗', lv: 'beginner' },
    { ko: '꽃', rom: 'kkot', zh: '花', lv: 'beginner' },
    { ko: '하늘', rom: 'haneul', zh: '天空', lv: 'beginner' },
    { ko: '바다', rom: 'bada', zh: '大海', lv: 'beginner' },
    { ko: '여행', rom: 'yeohaeng', zh: '旅行', lv: 'intermediate' },
    { ko: '공부', rom: 'gongbu', zh: '学习', lv: 'beginner' },
    { ko: '선생님', rom: 'seonsaengnim', zh: '老师', lv: 'beginner' },
    { ko: '학생', rom: 'haksaeng', zh: '学生', lv: 'beginner' },
    { ko: '지하철', rom: 'jihacheol', zh: '地铁', lv: 'intermediate' },
    { ko: '병원', rom: 'byeongwon', zh: '医院', lv: 'intermediate' },
    { ko: '시장', rom: 'sijang', zh: '市场', lv: 'intermediate' },
    { ko: '돈', rom: 'don', zh: '钱', lv: 'intermediate' },
    { ko: '가격', rom: 'gagyeok', zh: '价格', lv: 'intermediate' },
    { ko: '선물', rom: 'seonmul', zh: '礼物', lv: 'intermediate' },
    { ko: '약속', rom: 'yaksok', zh: '约定', lv: 'intermediate' },
    { ko: '취미', rom: 'chwimi', zh: '爱好', lv: 'intermediate' },
    { ko: '운동', rom: 'undong', zh: '运动', lv: 'intermediate' },
    { ko: '휴대폰', rom: 'hyudaepon', zh: '手机', lv: 'intermediate' },
    { ko: '사진', rom: 'sajin', zh: '照片', lv: 'intermediate' },
    { ko: '추억', rom: 'chueok', zh: '回忆', lv: 'advanced' },
    { ko: '기억', rom: 'gieok', zh: '记忆', lv: 'advanced' },
    { ko: '행복', rom: 'haengbok', zh: '幸福', lv: 'intermediate' },
    { ko: '마음', rom: 'maeum', zh: '心意/心', lv: 'intermediate' },
    { ko: '눈물', rom: 'nunmul', zh: '眼泪', lv: 'advanced' },
    { ko: '미소', rom: 'miso', zh: '微笑', lv: 'advanced' },
    { ko: '별', rom: 'byeol', zh: '星星', lv: 'intermediate' },
    { ko: '달', rom: 'dal', zh: '月亮', lv: 'intermediate' },
    { ko: '햇살', rom: 'haessal', zh: '阳光', lv: 'advanced' },
    { ko: '그리움', rom: 'geurium', zh: '思念', lv: 'advanced' },
    { ko: '기회', rom: 'gihoe', zh: '机会', lv: 'intermediate' },
    { ko: '시작', rom: 'sijak', zh: '开始', lv: 'intermediate' },
    { ko: '끝', rom: 'kkeut', zh: '结束/尽头', lv: 'intermediate' },
    { ko: '처음', rom: 'cheoeum', zh: '最初/第一次', lv: 'beginner' },
    { ko: '세상', rom: 'sesang', zh: '世界', lv: 'advanced' },
    { ko: '무대', rom: 'mudae', zh: '舞台', lv: 'advanced' },
    { ko: '관심', rom: 'gwansim', zh: '关心/兴趣', lv: 'intermediate' },
    { ko: '분위기', rom: 'bunwigi', zh: '氛围', lv: 'intermediate' },
    { ko: '일상', rom: 'ilsang', zh: '日常', lv: 'intermediate' },
    { ko: '습관', rom: 'seupgwan', zh: '习惯', lv: 'advanced' },
    { ko: '노력', rom: 'noryeok', zh: '努力', lv: 'advanced' },
    { ko: '연습', rom: 'yeonseup', zh: '练习', lv: 'intermediate' },
    { ko: '발음', rom: 'bareum', zh: '发音', lv: 'intermediate' },
    { ko: '얼굴', rom: 'eolgul', zh: '脸', lv: 'intermediate' },
    { ko: '목소리', rom: 'moksori', zh: '嗓音/声音', lv: 'intermediate' },
    { ko: '이름', rom: 'ireum', zh: '名字', lv: 'beginner' },
    { ko: '나라', rom: 'nara', zh: '国家', lv: 'intermediate' },
    { ko: '고향', rom: 'gohyang', zh: '故乡', lv: 'advanced' },
    { ko: '친절', rom: 'chinjeol', zh: '亲切', lv: 'advanced' },
    { ko: '축하', rom: 'chukha', zh: '祝贺', lv: 'intermediate' },
    { ko: '감동', rom: 'gamdong', zh: '感动', lv: 'advanced' },
    { ko: '소중함', rom: 'sojungham', zh: '珍贵', lv: 'advanced' },
    { ko: '꿈', rom: 'kkum', zh: '梦想', lv: 'intermediate' },
    { ko: '희망', rom: 'huimang', zh: '希望', lv: 'advanced' },
    { ko: '봄', rom: 'bom', zh: '春天', lv: 'beginner' },
    { ko: '여름', rom: 'yeoreum', zh: '夏天', lv: 'beginner' },
    { ko: '가을', rom: 'gaeul', zh: '秋天', lv: 'beginner' },
    { ko: '겨울', rom: 'gyeoul', zh: '冬天', lv: 'beginner' },
    { ko: '눈', rom: 'nun', zh: '雪/眼睛', lv: 'beginner' },
    { ko: '비', rom: 'bi', zh: '雨', lv: 'beginner' },
    { ko: '눈빛', rom: 'nunbit', zh: '眼神', lv: 'advanced' },
    { ko: '무대 인사', rom: 'mudae insa', zh: '舞台问候', lv: 'advanced' },
    { ko: '응원법', rom: 'eungwonbeop', zh: '应援法', lv: 'advanced' },
    { ko: '첫사랑', rom: 'cheotsarang', zh: '初恋', lv: 'intermediate' }
  ];

  /* ---------------- 4. 数字 ---------------- */
  KC.NUM_NATIVE = [
    { ko: '하나', rom: 'hana', zh: '1（固有词）' }, { ko: '둘', rom: 'dul', zh: '2（固有词）' },
    { ko: '셋', rom: 'set', zh: '3（固有词）' }, { ko: '넷', rom: 'net', zh: '4（固有词）' },
    { ko: '다섯', rom: 'daseot', zh: '5（固有词）' }, { ko: '여섯', rom: 'yeoseot', zh: '6（固有词）' },
    { ko: '일곱', rom: 'ilgop', zh: '7（固有词）' }, { ko: '여덟', rom: 'yeodeol', zh: '8（固有词）' },
    { ko: '아홉', rom: 'ahop', zh: '9（固有词）' }, { ko: '열', rom: 'yeol', zh: '10（固有词）' },
    { ko: '스무', rom: 'seumu', zh: '20（固有词）' }, { ko: '서른', rom: 'seoreun', zh: '30（固有词）' }
  ];
  KC.NUM_SINO = [
    { ko: '일', rom: 'il', zh: '1（汉字词）' }, { ko: '이', rom: 'i', zh: '2（汉字词）' },
    { ko: '삼', rom: 'sam', zh: '3（汉字词）' }, { ko: '사', rom: 'sa', zh: '4（汉字词）' },
    { ko: '오', rom: 'o', zh: '5（汉字词）' }, { ko: '육', rom: 'yuk', zh: '6（汉字词）' },
    { ko: '칠', rom: 'chil', zh: '7（汉字词）' }, { ko: '팔', rom: 'pal', zh: '8（汉字词）' },
    { ko: '구', rom: 'gu', zh: '9（汉字词）' }, { ko: '십', rom: 'sip', zh: '10（汉字词）' },
    { ko: '백', rom: 'baek', zh: '100（汉字词）' }, { ko: '천', rom: 'cheon', zh: '1000（汉字词）' }
  ];

  /* ---------------- 5. 发音易混对比 ---------------- */
  KC.PRON_PAIRS = [
    { a: '불', b: '풀', note: 'ㅂ vs ㅍ：嘴唇放松 vs 送气，불(火) / 풀(草)' },
    { a: '달', b: '탈', note: 'ㄷ vs ㅌ：달(月亮) / 탈(面具)' },
    { a: '자다', b: '차다', note: 'ㅈ vs ㅊ：자다(睡觉) / 차다(踢、冰冷)' },
    { a: '가다', b: '카다', note: 'ㄱ vs ㅋ：가다(去) / 카드(卡片)' },
    { a: '살', b: '쌀', note: 'ㅅ vs ㅆ：살(肉/岁) / 쌀(米)' },
    { a: '굴', b: '쿨', note: 'ㄱ vs ㅋ 在元音 우 前，注意口型' },
    { a: '벼', b: '비어', note: 'ㅕ vs ㅣ+ㅓ：嘴唇扁平，舌位稍后' },
    { a: '오늘', b: '우늘', note: 'ㅗ vs ㅜ：오늘(今天)，嘴唇圆且小' },
    { a: '밥', b: '밥빠', note: '받침 ㅂ 不爆破，只做口型' },
    { a: '한국', b: '한구', note: '받침 ㅇ [ŋ] 是后鼻音，别读成 구' },
    { a: '일', b: '닐', note: '일(一/工作) 开头无声，别加 n 音' },
    { a: '여자', b: '요자', note: '여 [yeo] 的口型，双唇扁平拉开' }
  ];

  /* ---------------- 6. 助词/语法填空 ---------------- */
  KC.PARTICLE_QUIZ = [
    { q: '저___ 학생이에요.', a: '는', opts: ['는', '이', '을', '의'], note: '저는 = 我（主格强调），는 用于无韵尾的词后。' },
    { q: '이거___ 뭐예요?', a: '은', opts: ['은', '는', '이', '를'], note: '이거 有韵尾？没有韵尾→는；但标准常用「이거는」。此处练 은/는 区分示例。' },
    { q: '한국어___ 공부해요.', a: '를', opts: ['를', '가', '는', '에'], note: '宾语 + 을/를，한국어 无韵尾用 를。' },
    { q: '학교___ 가요.', a: '에', opts: ['에', '에서', '의', '를'], note: '에 表示方向目的地；에서 表示在某地做某事。' },
    { q: '서울___ 살아요.', a: '에서', opts: ['에서', '에', '에게', '한테'], note: '살다 是持续动作，地点用 에서。' },
    { q: '친구___ 같이 가요.', a: '와', opts: ['와', '과', '의', '이랑'], note: '와/과 = 和；무韵尾用 와，有韵尾用 과。' },
    { q: '이것___ 제 책이에요.', a: '은', opts: ['은', '는', '을', '이'], note: '이것 有韵尾 ㅅ → 은。' },
    { q: '한국___ 왔어요.', a: '에서', opts: ['에서', '에', '로', '의'], note: '에서 = 从（某地）来。' },
    { q: '물___ 주세요.', a: '을', opts: ['을', '를', '이', '는'], note: '물 有韵尾 ㄹ → 을。' },
    { q: '지금 뭐___ 해요?', a: '를', opts: ['를', '을', '는', '가'], note: '뭐(무엇) 无韵尾 → 를，但口语常说 뭐 해요。' }
  ];

  /* ---------------- 7. 每日一句 ---------------- */
  KC.DAILY = [
    { ko: '오늘도 화이팅!', rom: 'oneuldo hwaiting!', zh: '今天也加油！' },
    { ko: '천천히 해도 괜찮아요.', rom: 'cheoncheonhi haedo gwaenchanayo.', zh: '慢慢来也没关系。' },
    { ko: '노력하는 당신이 멋져요.', rom: 'noryeokhaneun dangsini meotjyeoyo.', zh: '努力的你很帅气。' },
    { ko: '하루에 한 문장만 외워 봐요.', rom: 'harue han munjangman oewo bwayo.', zh: '一天背一句试试看。' },
    { ko: '한국어는 재미있어요.', rom: 'hangugeoneun jaemiisseoyo.', zh: '韩语很有趣。' },
    { ko: '꾸준함이 실력이 돼요.', rom: 'kkujunhami sillyeogi dwaeyo.', zh: '坚持就是实力。' },
    { ko: '좋아하는 일을 하세요.', rom: 'joahaneun ireul haseyo.', zh: '去做你喜欢的事吧。' },
    { ko: '오늘도 수고했어요.', rom: 'oneuldo sugohaesseoyo.', zh: '今天也辛苦了。' },
    { ko: '노래하면서 배워 봐요.', rom: 'noraehamyeonseo baewo bwayo.', zh: '一边唱歌一边学吧。' },
    { ko: '실수해도 괜찮아요.', rom: 'silsuhaedo gwaenchanayo.', zh: '犯错也没关系。' },
    { ko: '소리 내어 읽어 보세요.', rom: 'sori naeeo ilgeo boseyo.', zh: '请大声朗读试试。' },
    { ko: '조금씩 늘고 있어요.', rom: 'jogeumssik neulgo isseoyo.', zh: '正在一点一点进步。' }
  ];

  /* ---------------- 8. 音色预设 ---------------- */
  KC.VOICE_PRESETS = [
    { id: 'sweet', name: '사랑스러운 여동생', cn: '甜美妹妹音', pitch: 1.55, rate: 1.08, desc: '高音活泼，适合撒娇台词' },
    { id: 'clear', name: '청량 메인보컬', cn: '清亮主唱音', pitch: 1.28, rate: 1.0, desc: '干净透亮，唱跳舞台感' },
    { id: 'calm', name: '차분한 배우톤', cn: '沉稳演员音', pitch: 1.0, rate: 0.9, desc: '低缓叙述，适合读台词' },
    { id: 'senpai', name: '부드러운 선배', cn: '温柔学长音', pitch: 0.82, rate: 0.93, desc: '磁性好听，适合对话' },
    { id: 'rapper', name: '낮은 래퍼톤', cn: '低沉Rapper音', pitch: 0.55, rate: 0.86, desc: '低音酷感，适合verse' },
    { id: 'news', name: '뉴스 아나운서', cn: '播音员标准音', pitch: 1.0, rate: 1.08, desc: '清晰标准，适合精听' }
  ];

  /* ---------------- 9. 爱豆角色（虚构） ---------------- */
  KC.IDOLS = [
    {
      id: 'seoyeon', name: '서연', rom: 'Seo-yeon', av: '서',
      color: 'linear-gradient(135deg,#FF8FB1,#C86DD7)',
      desc: '女团主唱 · 甜美活泼', tags: ['女团主唱', '活泼', '撒娇满满'],
      pitch: 1.32, rate: 1.0,
      persona: '你是韩国女团主唱「서연」，性格活泼可爱、爱撒娇，喜欢和练习生说话，说话时偶尔用可爱的感叹词（어머! 대박! 진짜?）。',
      greet: [{ ko: '안녕! 드디어 만났어. 오늘도 같이 한국어 연습하자!', rom: 'annyeong! deudieo mannasseo. oneuldo gachi hangugeo yeonseuphaja!', zh: '你好呀！终于见面了，今天也一起练韩语吧！' }]
    },
    {
      id: 'haeun', name: '하은', rom: 'Ha-eun', av: '하',
      color: 'linear-gradient(135deg,#7E8CE0,#5B63C4)',
      desc: '演员系 · 温柔成熟', tags: ['演员', '温柔', '敬语达人'],
      pitch: 1.05, rate: 0.88,
      persona: '你是韩国演员「하은」，说话温柔有礼貌，喜欢用敬语，会细心纠正对方的韩语语法，鼓励多于批评。',
      greet: [{ ko: '안녕하세요. 만나서 반가워요. 오늘 기분은 어때요?', rom: 'annyeonghaseyo. mannaseo bangawoyo. oneul gibuneun eottaeyo?', zh: '你好，很高兴见到你。今天心情怎么样？' }]
    },
    {
      id: 'jihoo', name: '지후', rom: 'Ji-hoo', av: '지',
      color: 'linear-gradient(135deg,#45A9E6,#3B7DD8)',
      desc: '男团队长 · 清冷少年感', tags: ['男团队长', '话少', '守护型'],
      pitch: 0.85, rate: 0.95,
      persona: '你是韩国男团队长「지후」，话不多但很可靠，说话简短冷静，喜欢反问对方，偶尔会夸奖对方「잘했어」。',
      greet: [{ ko: '안녕. 기다렸어. 오늘은 뭐 배우고 싶어?', rom: 'annyeong. gidaryeosseo. oneureun mwo baeugo sipeo?', zh: '你好，等你很久了。今天想学什么？' }]
    },
    {
      id: 'doyoon', name: '도윤', rom: 'Do-yoon', av: '도',
      color: 'linear-gradient(135deg,#37C39A,#2A9E7C)',
      desc: 'rapper · 低沉慵懒', tags: ['Rapper', '低音', '幽默'],
      pitch: 0.6, rate: 0.88,
      persona: '你是韩国rapper「도윤」，嗓音很低，喜欢开玩笑，说话带一点慵懒的长音「~」，会教对方rap式韩语节奏。',
      greet: [{ ko: 'yo~ 왔어? 오늘은 한국어로 랩 한번 해볼래?', rom: 'yo~ wasseo? oneureun hangugeoro raep hanbeon haebollae?', zh: '哟~来了？今天要不要用韩语来段rap？' }]
    },
    {
      id: 'naeun', name: '나은', rom: 'Na-eun', av: '나',
      color: 'linear-gradient(135deg,#F2A33C,#F2724C)',
      desc: '忙内忙内 · 元气满满', tags: ['忙内', '元气', '话痨'],
      pitch: 1.55, rate: 1.12,
      persona: '你是女团忙内「나은」，元气爆棚，话很多，喜欢用最新流行语（대박, ㅋㅋ, 완전, 킹받아 之类），追星话题停不下来。',
      greet: [{ ko: '안녕!! 진짜 반가워. 우리 오늘 뭐부터 해볼까?', rom: 'annyeong!! jinjja bangawo. uri oneul mwobuteo haebolkka?', zh: '你好呀！！真的好开心。我们今天从什么开始？' }]
    },
    {
      id: 'siwoo', name: '시우', rom: 'Si-woo', av: '시',
      color: 'linear-gradient(135deg,#9B7BFF,#6E56CF)',
      desc: '温暖学长 · 耐心陪练', tags: ['学长', '耐心', '纠音专家'],
      pitch: 0.92, rate: 0.92,
      persona: '你是韩国大学的韩语助教「시우」，非常有耐心，擅长解释语法和发音，会逐词分析对方的句子，适合精进语言。',
      greet: [{ ko: '안녕하세요. 오늘은 발음부터 천천히 볼까요?', rom: 'annyeonghaseyo. oneureun bareumbuteo cheoncheonhi bolkkayo?', zh: '你好，今天我们从发音开始慢慢看，好吗？' }]
    }
  ];

  /* ---------------- 10. 示范曲库 ---------------- */
  /* 说明：为避免版权风险，内置的均为「学习示范歌词」（原创练习文本）与传统民谣。
     你可以在「音乐」页粘贴自己在 QQ 音乐复制的歌词生成学习计划。 */
  KC.SONGS = [
    {
      id: 'arirang', title: '아리랑', artist: '전통 민요 (Traditional)',
      tags: ['公有领域', '传统民谣', '初级'],
      lines: [
        { t: 0, ko: '아리랑 아리랑 아라리요', zh: '阿里郎 阿里郎 阿拉里哟' },
        { t: 6, ko: '아리랑 고개를 넘어간다', zh: '越过阿里郎山岗' },
        { t: 12, ko: '나를 버리고 가시는 님은', zh: '抛弃我而离去的那位' },
        { t: 18, ko: '십리도 못 가서 발병 난다', zh: '走不到十里路就会脚痛' },
        { t: 24, ko: '아리랑 아리랑 아라리요', zh: '阿里郎 阿里郎 阿拉里哟' },
        { t: 30, ko: '아리랑 고개를 넘어간다', zh: '越过阿里郎山岗' },
        { t: 36, ko: '청청하늘엔 별도 많고', zh: '晴朗的天空星星多' },
        { t: 42, ko: '우리네 가슴엔 꿈도 많고', zh: '我们的心里梦也多' }
      ]
    },
    {
      id: 'cheonnun', title: '첫눈이 내리면', artist: '练习曲 (原创示范歌词)',
      tags: ['原创示范', '中级', '抒情'],
      lines: [
        { t: 0, ko: '창밖을 보니 눈이 내려요', zh: '望向窗外，雪落了下来' },
        { t: 5, ko: '너를 닮은 하얀 눈꽃이', zh: '像你一样的白色雪花' },
        { t: 10, ko: '조용히 내 맘에 쌓여가요', zh: '静静地堆积在我的心上' },
        { t: 15, ko: '오늘은 조금 보고 싶어요', zh: '今天有点想你了' },
        { t: 20, ko: '첫눈이 내리면 전화할게요', zh: '初雪落下时我会打电话给你' },
        { t: 25, ko: '따뜻한 목소리로 안녕, 하고', zh: '用温暖的声音说一声你好' },
        { t: 30, ko: '이 겨울이 지나도', zh: '即使这个冬天过去' },
        { t: 35, ko: '우리 이야기는 계속될 거예요', zh: '我们的故事也会继续' },
        { t: 40, ko: '눈처럼 쌓이는 기억들', zh: '如雪般堆积的回忆' },
        { t: 45, ko: '하나하나 소중해요', zh: '每一个都很珍贵' }
      ]
    },
    {
      id: 'byeolbit', title: '별빛 소녀', artist: '练习曲 (原创示范歌词)',
      tags: ['原创示范', '中级', '轻快'],
      lines: [
        { t: 0, ko: '있는 그대로 괜찮아요', zh: '做自己就很好' },
        { t: 5, ko: '반짝이는 별빛처럼', zh: '像闪烁的星光一样' },
        { t: 10, ko: '어두운 밤에도 빛날 거예요', zh: '即使在黑夜也会发光' },
        { t: 15, ko: '무대 위에서 노래할 때', zh: '站在舞台上唱歌时' },
        { t: 20, ko: '내 마음은 자유로워요', zh: '我的心是自由的' },
        { t: 25, ko: '지금 이 순간을 기억해 줘요', zh: '请记住现在这一刻' },
        { t: 30, ko: '우리 함께 부르는 이 노래', zh: '我们一起唱的这首歌' },
        { t: 35, ko: '별이 되어 오래 남을 거예요', zh: '会变成星星长久留存' },
        { t: 40, ko: '사랑해요, 나의 별빛', zh: '我爱你，我的星光' }
      ]
    },
    {
      id: 'seoulnight', title: '서울의 밤', artist: '练习曲 (原创示范歌词)',
      tags: ['原创示范', '中高级', '都市'],
      lines: [
        { t: 0, ko: '서울의 밤은 참 복잡해요', zh: '首尔的夜晚真复杂' },
        { t: 5, ko: '불빛은 많은데 마음은 외로워', zh: '灯光很多，心却孤独' },
        { t: 10, ko: '한강에 앉아 바람을 마셔요', zh: '坐在汉江边喝着风' },
        { t: 15, ko: '오늘 하루도 수고했어', zh: '今天一天也辛苦了' },
        { t: 20, ko: '사람들 사이를 지나면서', zh: '穿过人群的时候' },
        { t: 25, ko: '나를 찾는 중이에요', zh: '我正在寻找自己' },
        { t: 30, ko: '내일은 조금 더 따뜻하길', zh: '希望明天能更温暖一些' },
        { t: 35, ko: '그게 나의 작은 소원이에요', zh: '那就是我小小的心愿' }
      ]
    },
    {
      id: 'bombaram', title: '봄바람', artist: '练习曲 (原创示范歌词)',
      tags: ['原创示范', '初级', '轻快'],
      lines: [
        { t: 0, ko: '봄바람이 불어와요', zh: '春风吹来了' },
        { t: 5, ko: '벚꽃이 흩날려요', zh: '樱花纷飞' },
        { t: 10, ko: '손을 잡고 걷고 싶어요', zh: '想牵着手一起走' },
        { t: 15, ko: '이 길을 따라서', zh: '沿着这条路' },
        { t: 20, ko: '따뜻한 햇살 아래서', zh: '在温暖的阳光下' },
        { t: 25, ko: '노래를 부를게요', zh: '我来唱首歌' },
        { t: 30, ko: '봄이 오면 기분이 좋아요', zh: '春天来了心情就好' },
        { t: 35, ko: '모든 게 새로워요', zh: '一切都焕然一新' }
      ]
    }
  ];

  /* ---------------- 11. 纠错规则 ---------------- */
  /* type: spell(拼写) / spacing(隔写) / grammar(语法) / honorific(敬语) / particle(助词) */
  KC.FIX_RULES = [
    // 隔写
    { re: /안 ?되요/, to: '안 돼요', type: 'spacing', why: '되다 的活用是「돼요」；否定副词「안」要与后面的词分开写。' },
    { re: /안 ?됀다|안 ?됀데/, to: '안 돼는데', type: 'spacing', why: '否定+되다 组合需要隔写：안 돼요 / 안 돼는데。' },
    { re: /하고 ?싶/, to: '하고 싶', type: 'spacing', why: '-고 싶다 表示「想做某事」，必须隔写。' },
    { re: /할수 ?있/, to: '할 수 있', type: 'spacing', why: '「할 수 있다」三個部分要分开写：수 是依存名词。' },
    { re: /할수 ?없/, to: '할 수 없', type: 'spacing', why: '「할 수 없다」同理，需要隔写。' },
    { re: /될수 ?있/, to: '될 수 있', type: 'spacing', why: '「될 수 있다」需要隔写。' },
    { re: /갈 ?거예요|갈거예요/, to: '갈 거예요', type: 'spacing', why: '将来时「-(으)ㄹ 것이에요」缩写时必须隔写：갈 거예요。' },
    { re: /몇 ?일/, to: '며칠', type: 'spell', why: '询问日期要用「며칠」，而不是「몇 일」。' },
    { re: /몇 ?개/, to: '몇 개', type: 'spacing', why: '「몇 개」需要隔写。' },
    { re: /한번더|한 번 더/, to: '한 번 더', type: 'spacing', why: '表示「再一次」是名词短语「한 번」，要隔写。' },
    { re: /잘 ?부탁 ?드립니다/, to: '잘 부탁드립니다', type: 'spacing', why: '「부탁드리다」已固化为惯用语，通常连写。' },
    { re: /어떻게 ?해/, to: '어떡해', type: 'spell', why: '感叹「怎么办」是缩写词「어떡해」；「어떻게 해」用于「怎么做」的字面义。' },
    { re: /어떡 ?하게/, to: '어떻게', type: 'spell', why: '询问方式要用副词「어떻게」。' },

    // 拼写
    { re: /할께요/, to: '할게요', type: 'spell', why: '表示约定的「-(으)ㄹ게요」写作 게，不是 께。' },
    { re: /할껀데/, to: '할 건데', type: 'spell', why: '「-(으)ㄹ 건데」是 것인데 的缩写，写作 건데。' },
    { re: /있슴니다/, to: '있습니다', type: 'spell', why: '标准敬语语尾是 -습니다，不是 -슴니다。' },
    { re: /되요(?!\s*$)/, to: '돼요', type: 'spell', why: '되다 + 아/어요 → 돼요（되어요 的缩写）。' },
    { re: /됄 ?것/, to: '될 것', type: 'spell', why: '되다 的将来形是「될」，不是「됄」。' },
    { re: /오랫만/, to: '오랜만', type: 'spell', why: '正确拼写是「오랜만」（오래간만의 준말）。' },
    { re: /금새/, to: '금세', type: 'spell', why: '「금세」是「금시에」的缩写，表示「立刻」。' },
    { re: /바램/, to: '바람', type: 'spell', why: '名词是「바람」(愿望)，바램 不是标准语。' },
    { re: /웬지/, to: '왠지', type: 'spell', why: '「왠지」是「왜인지」的缩写，写成 왠지。' },
    { re: /왠일/, to: '웬일', type: 'spell', why: '「웬일」意为「什么事」，写作 웬일。' },
    { re: /거 ?같아|거 ?같애/, to: '것 같아', type: 'spell', why: '标准语是「것 같다」；거 같아 是口语非标准形。' },
    { re: /졸라|존나/, to: '정말', type: 'spell', why: '这是粗俗表达，请改用「정말 / 되게 / 엄청」。' },
    { re: /맛잇다|맛있다$/, to: '맛있다', type: 'spell', why: '「맛있다」的收音是 ㅅ + 이 → 맛이 있다。' },
    { re: /끝네요/, to: '끝났어요', type: 'spell', why: '过去时要用「끝났어요」。' },
    { re: /읽어 ?주세여/, to: '읽어 주세요', type: 'spell', why: '请愿形是 -세요/-주세요。' },

    // 敬语 / 语体
    { re: /^저는\s.*(이다|한다|했다|간다|왔다)$/, to: null, type: 'honorific', why: '「저는」是谦语主语，句末应配合요/습니다 体，如「저는 가요 / 저는 갔어요」。' },
    { re: /선생님,?\s*밥\s*먹었어/, to: '선생님, 밥 먹었어요?', type: 'honorific', why: '对长辈/老师要用요体或敬语形式。' },
    { re: /엄마,?\s*뭐해/, to: '어머니, 뭐 하세요?', type: 'honorific', why: '对父母也要用敬语语尾 -(으)세요。' },
    { re: /주세여|주세용/, to: '주세요', type: 'spell', why: '请愿形的标准写法是「주세요」。' }
  ];

  /* ---------------- 12. 聊天对话脚本 ---------------- */
  KC.CHAT_RULES = [
    {
      re: /안녕(하세요)?|hi|hello|你好|哈喽/i,
      replies: [
        { ko: '안녕! 오늘도 왔구나. 기분은 어때요?', rom: 'annyeong! oneuldo watguna. gibuneun eottaeyo?', zh: '你好呀！今天也来啦，心情怎么样？' },
        { ko: '안녕하세요! 반가워요. 오늘은 뭐 배우고 싶어요?', rom: 'annyeonghaseyo! bangawoyo. oneureun mwo baeugo sipeoyo?', zh: '你好！很高兴。今天想学点什么？' }
      ]
    },
    {
      re: /(뭐\s*해|모해|뭐해\?)|做什么|在干嘛/,
      replies: [
        { ko: '지금은 연습실에서 노래 연습하고 있어요. 너는?', rom: 'jigeumeun yeonseupsireseo norae yeonseuphago isseoyo. neoneun?', zh: '现在在练习室练歌呢。你呢？' },
        { ko: '방금 한국어 문장을 읽고 있었어. 같이 해볼래?', rom: 'banggeum hangugeo munjangeul ilgo isseosseo. gachi haebollae?', zh: '刚刚在读韩语句子，要一起吗？' }
      ]
    },
    {
      re: /(이름|누구)|名字|叫什/,
      replies: [
        { ko: '내 이름은 서연이야. 너 이름은 뭐예요?', rom: 'nae ireumeun seoyeoniya. neo ireumeun mwoyeyo?', zh: '我叫瑞妍（서연），你叫什么名字？' }
      ]
    },
    {
      re: /(공부|학습|배우)|学习|学韩语/,
      replies: [
        { ko: '한국어 공부가 제일 재미있지! 오늘 한 문장만 같이 외워 볼까?', rom: 'hangugeo gongbuga jeil jaemiitji! oneul han munjangman gachi oewo bolkka?', zh: '学韩语最有趣了！今天一起背一句话怎么样？' },
        { ko: '꾸준히 하면 늘어요. 매일 십 분만 투자해 봐요.', rom: 'kkujunhi hamyeon neureoyo. maeil sip bunman tujahae bwayo.', zh: '坚持就会进步，每天投资十分钟试试。' }
      ]
    },
    {
      re: /(노래|음악|kpop|케이팝)|歌|音乐/,
      replies: [
        { ko: '음악으로 배우면 발음이 진짜 빨리 늘어! 좋아하는 노래 있어?', rom: 'eumageuro baeumyeon bareumi jinjja ppalli neureo! joahaneun norae isseo?', zh: '用音乐学的话发音进步特别快！有喜欢的歌吗？' },
        { ko: '이번에 새 노래 연습 중이야. 가사 읽어 줄까?', rom: 'ibone sae norae yeonseup jungiya. gasa ilgeo julkka?', zh: '最近在练新歌，要我给你读歌词吗？' }
      ]
    },
    {
      re: /(한국)|韩国/,
      replies: [
        { ko: '한국 음식 중에 뭐가 제일 좋아? 나는 떡볶이!', rom: 'hanguk eumsik junge mwoga jeil joa? naneun tteokbokki!', zh: '韩国菜里你最喜欢什么？我最爱炒年糕！' }
      ]
    },
    {
      re: /(발음|发音|朗读)/,
      replies: [
        { ko: '발음은 소리 내서 읽는 게 제일 중요해. 따라 읽어 봐: 한국어', rom: 'bareumeun sori naeseo ingneun ge jeil jungyohae. ttara ilgeo bwa: hangugeo', zh: '发音最重要的是大声读出来。跟我念：한국어（韩语）。' }
      ]
    },
    {
      re: /(배고프|먹|밥|음식)|饿|吃|饭/,
      replies: [
        { ko: '배고파? 나는 떡볶이가 먹고 싶어. 같이 먹자!', rom: 'baegopa? naneun tteokbokkiga meokgo sipeo. gachi meokja!', zh: '饿了吗？我想吃炒年糕，一起去吃吧！' }
      ]
    },
    {
      re: /(고마워|감사|땡큐)|谢谢/,
      replies: [
        { ko: '천만에요! 더 도와줄까?', rom: 'cheonmaneyo! deo dowajulkka?', zh: '不客气！还要我帮忙吗？' }
      ]
    },
    {
      re: /(잘자|안녕히|잘\s*가)|再见|晚安/,
      replies: [
        { ko: '잘 자! 내일 또 봐. 꿈 꿔~', rom: 'jal ja! naeil tto bwa. kkum kkwo~', zh: '晚安！明天见，做个好梦~' }
      ]
    },
    {
      re: /(피곤|힘들|지쳤)|累|辛苦/,
      replies: [
        { ko: '수고했어. 오늘은 푹 쉬고 내일 다시 해요.', rom: 'sugohaesseo. oneureun puk swigo naeil dasi haeyo.', zh: '辛苦了，今天好好休息，明天再继续吧。' }
      ]
    },
    {
      re: /(화이팅|파이팅|加油)/,
      replies: [
        { ko: '화이팅! 넌 할 수 있어!', rom: 'hwaiting! neon hal su isseo!', zh: '加油！你可以的！' }
      ]
    },
    {
      re: /(날씨|weather)|天气/,
      replies: [
        { ko: '오늘 날씨 진짜 좋아! 같이 산책할래?', rom: 'oneul nalssi jinjja joa! gachi sanchaekhallae?', zh: '今天天气真好！要一起散步吗？' }
      ]
    },
    {
      re: /(취미|좋아하는)|爱好|喜欢/,
      replies: [
        { ko: '내 취미는 노래랑 사진 찍기야. 너는 무슨 취미 있어?', rom: 'nae chwimineun noraerang sajin jjikgiya. neoneun museun chwimi isseo?', zh: '我的爱好是唱歌和拍照，你有什么爱好？' }
      ]
    },
    {
      re: /(오빠|언니|귀엽|사랑)|喜欢你|爱你/,
      replies: [
        { ko: '어머~ 고마워! 한국어로 더 많이 말해 줘.', rom: 'eomeo~ gomawo! hangugeoro deo mani malhae jwo.', zh: '哎呀~谢谢！再多用韩语跟我说说话吧。' }
      ]
    },
    {
      re: /(몰라|어려워|힘들어)|难|不会/,
      replies: [
        { ko: '괜찮아, 처음엔 다 그래. 한 번 더 같이 읽어 보자!', rom: 'gwaenchana, cheoeumen da geurae. han beon deo gachi ilgeo boja!', zh: '没关系，一开始都这样，我们再一起读一遍吧！' }
      ]
    },
    {
      re: /(잘했|맞았|정답)|对了吗/,
      replies: [
        { ko: '정말 잘했어! 완벽해.', rom: 'jeongmal jalhaesseo! wanbyeokhae.', zh: '做得真好！完美。' }
      ]
    }
  ];

  KC.CHAT_FALLBACK = [
    { ko: '오, 재미있는 이야기네! 한국어로 한 번 더 말해 볼래?', rom: 'o, jaemiinneun iyagine! hangugeoro han beon deo malhae bollae?', zh: '哦，听起来很有意思！再用韩语说一次好吗？' },
    { ko: '그렇구나. 그럼 이렇게 말해 보면 어때? "정말 재미있어요."', rom: 'geureokuna. geureom ireoke malhae bomyeon eottae? "jeongmal jaemiisseoyo."', zh: '原来如此。那这样说怎么样？"真的很有意思。"' },
    { ko: '조금 어려웠어. 다시 한 번 천천히 말해 줄래?', rom: 'jogeum eoryeowosseo. dasi han beon cheoncheonhi malhae jullae?', zh: '有点没听懂，能再说一遍慢一点吗？' },
    { ko: '대화가 즐거워! 한국어 실력이 늘고 있는 것 같아.', rom: 'daehwaga jeulgeowo! hangugeo sillyeogi neulgo inneun geot gata.', zh: '聊天真开心！感觉你韩语在进步呢。' },
    { ko: '그거 완전 공감! 우리 계속 이야기하자.', rom: 'geugeo wanjeon gonggam! uri gyesok iyagihaja.', zh: '这个我超级有共鸣！我们继续聊吧。' }
  ];

  KC.CHAT_SCENES = [
    { id: 'free', ko: '자유 대화', cn: '自由闲聊' },
    { id: 'cafe', ko: '카페에서 주문하기', cn: '咖啡厅点单' },
    { id: 'shop', ko: '쇼핑하기', cn: '购物逛街' },
    { id: 'concert', ko: '콘서트 후 만남', cn: '演唱会后偶遇' },
    { id: 'school', ko: '학교 첫날', cn: '开学第一天' },
    { id: 'travel', ko: '서울 여행', cn: '首尔旅行' },
    { id: 'practice', ko: '한국어 연습실', cn: '韩语练习室' }
  ];

  KC.SUGGESTIONS = [
    '안녕! 오늘 기분 어때?',
    '한국어 공부하고 싶어.',
    '노래 추천해 줘.',
    '배고파.',
    '내 발음 어때?',
    '오늘 날씨 좋아요.',
    '화이팅!',
    '이거 한국어로 뭐예요?'
  ];

})(window.KC);
