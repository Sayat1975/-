export type Lang = 'kk' | 'ru' | 'en';

export type ZoneId =
  | 'courtyard'
  | 'corridor'
  | 'classroom-math'
  | 'classroom-science'
  | 'classroom-library'
  | 'classroom-it';

export type TimePreset = 'morning' | 'golden';

export interface TrilingualText {
  kk: string;
  ru: string;
  en: string;
}

export interface SchoolRule {
  id: string;
  title: TrilingualText;
  description: TrilingualText;
}

export interface ZoneConfig {
  id: ZoneId;
  code: string;
  name: TrilingualText;
  shortName: TrilingualText;
  subtitle: TrilingualText;
  accentHex: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  walkSpawn: [number, number, number];
  walkYaw: number;
  rules: SchoolRule[];
}

export interface QuizQuestion {
  id: string;
  zoneId: ZoneId;
  question: TrilingualText;
  options: TrilingualText[];
  correctIndex: number;
  explanation: TrilingualText;
}

export const LANG_LABELS: Record<Lang, string> = {
  kk: 'Қаз',
  ru: 'Рус',
  en: 'Eng',
};

export const UI_COPY = {
  appName: {
    kk: 'Bilim Мектебі 3D',
    ru: 'Школа Bilim 3D',
    en: 'Bilim School 3D',
  },
  facadeTitle: {
    kk: '№1 БІЛІМ МЕКТЕБІ',
    ru: 'ШКОЛА №1 «БІЛІМ»',
    en: 'BILIM SCHOOL №1',
  },
  facadeMotto: {
    kk: 'Білім · Тәртіп · Құрмет',
    ru: 'Знания · Порядок · Уважение',
    en: 'Knowledge · Order · Respect',
  },
  rulesButton: {
    kk: 'Мектеп ережелері',
    ru: 'Правила школы',
    en: 'School Rules',
  },
  walkMode: {
    kk: 'Жүру (WASD)',
    ru: 'Прогулка (WASD)',
    en: 'Walk (WASD)',
  },
  orbitMode: {
    kk: 'Шолу',
    ru: 'Обзор',
    en: 'Orbit',
  },
  cutawayRoof: {
    kk: 'Қабат жоспары',
    ru: 'План этажа',
    en: 'Floorplan',
  },
  morningLight: {
    kk: 'Таңғы жарық',
    ru: 'Утренний свет',
    en: 'Morning',
  },
  goldenLight: {
    kk: 'Кешкі күн',
    ru: 'Закатный свет',
    en: 'Golden Hour',
  },
  hideControls: {
    kk: 'Панельді жасыру',
    ru: 'Скрыть панель',
    en: 'Hide Controls',
  },
  showControls: {
    kk: 'Панельді көрсету',
    ru: 'Показать панель',
    en: 'Show Controls',
  },
  rulesModalTitle: {
    kk: 'Мектептегі тәртіп ережелері',
    ru: 'Правила поведения в школе',
    en: 'School Rules of Conduct',
  },
  tabCurrentZone: {
    kk: 'Осы аумақ',
    ru: 'Текущая зона',
    en: 'Current Area',
  },
  tabAllRules: {
    kk: 'Барлық ережелер',
    ru: 'Все правила',
    en: 'All Rules',
  },
  tabQuiz: {
    kk: 'Өзін-өзі тексеру',
    ru: 'Проверка знаний',
    en: 'Self-Check',
  },
  close: {
    kk: 'Жабу',
    ru: 'Закрыть',
    en: 'Close',
  },
  enterRoomPrompt: {
    kk: 'Кіру үшін басыңыз',
    ru: 'Нажмите, чтобы войти',
    en: 'Click to enter',
  },
  readBoardPrompt: {
    kk: 'Ережелер тақтасын ашу',
    ru: 'Открыть стенд правил',
    en: 'Open rules board',
  },
  walkHint: {
    kk: 'WASD / Бағыт пернелері — жүру · Тінтуірмен сүйреу — айналаға қарау · Есіктер автоматты ашылады',
    ru: 'WASD / Стрелки — ходьба · Зажмите мышь — поворот камеры · Двери открываются при подходе',
    en: 'WASD / Arrows — walk · Drag mouse — look around · Doors open automatically as you approach',
  },
  orbitHint: {
    kk: 'Тінтуірмен айналдырыңыз · Есіктер мен стендтерге басыңыз',
    ru: 'Вращайте камеру мышью · Нажимайте на двери и стенды правил',
    en: 'Drag to orbit · Click doors to enter or rule boards to read',
  },
  goToZone: {
    kk: 'Осы бөлмеге өту',
    ru: 'Перейти в эту зону',
    en: 'Go to this area',
  },
  quizReset: {
    kk: 'Қайта бастау',
    ru: 'Пройти заново',
    en: 'Try Again',
  },
  quizCorrect: {
    kk: 'Дұрыс жауап',
    ru: 'Верный ответ',
    en: 'Correct Answer',
  },
  quizIncorrect: {
    kk: 'Қайта ойланып көріңіз',
    ru: 'Подумайте ещё раз',
    en: 'Not quite right',
  },
  quizScore: {
    kk: 'Нәтиже',
    ru: 'Результат',
    en: 'Score',
  },
  boardHeader: {
    kk: 'ТӘРТІП ЕРЕЖЕЛЕРІ',
    ru: 'ПРАВИЛА ПОВЕДЕНИЯ',
    en: 'RULES OF CONDUCT',
  },
  boardFooter: {
    kk: 'Толығырақ оқу үшін басыңыз',
    ru: 'Нажмите, чтобы открыть',
    en: 'Click to read full rules',
  },
  entranceLabel: {
    kk: 'БАС КІРЕБЕРІС',
    ru: 'ГЛАВНЫЙ ВХОД',
    en: 'MAIN ENTRANCE',
  },
  exitToCourtyard: {
    kk: 'АУЛАҒА ШЫҒУ',
    ru: 'ВЫХОД ВО ДВОР',
    en: 'EXIT TO COURTYARD',
  },
  webglUnavailableTitle: {
    kk: '3D көрсетілім қолжетімсіз',
    ru: '3D-сцена временно недоступна',
    en: '3D Viewport Unavailable',
  },
  webglUnavailableDesc: {
    kk: 'Құрылғыңызда WebGL қолдауы өшірулі. Мектеп ережелерін төмендегі батырма арқылы оқи аласыз.',
    ru: 'WebGL отключён или контекст потерян. Вы всё равно можете открыть полный справочник школьных правил.',
    en: 'WebGL is unavailable or context was lost. You can still read the full trilingual school rules handbook.',
  },
  dockTabSpaces: {
    kk: 'Кабинеттер',
    ru: 'Кабинеты',
    en: 'Spaces',
  },
  dockTabCustomize: {
    kk: 'Интерьер және адамдар',
    ru: 'Интерьер и люди',
    en: 'Interior & People',
  },
  wallColorLabel: {
    kk: 'Қабырғалар',
    ru: 'Стены',
    en: 'Walls',
  },
  floorColorLabel: {
    kk: 'Еден',
    ru: 'Полы',
    en: 'Floors',
  },
  teachersLabel: {
    kk: 'Мұғалімдер',
    ru: 'Учителя',
    en: 'Teachers',
  },
  studentsLabel: {
    kk: 'Оқушылар',
    ru: 'Ученики',
    en: 'Students',
  },
  ambientSoundLabel: {
    kk: 'Мектеп дыбысы',
    ru: 'Звуки школы',
    en: 'Ambient Sound',
  },
  ambientSoundOn: {
    kk: 'Қосулы',
    ru: 'Вкл',
    en: 'On',
  },
  ambientSoundOff: {
    kk: 'Өшірулі',
    ru: 'Выкл',
    en: 'Off',
  },
} as const;

export type WallPaletteId = 'ivory' | 'sage' | 'sky' | 'sand' | 'peach' | 'mist';
export type FloorPaletteId = 'oak' | 'walnut' | 'maple' | 'terracotta' | 'slate';

export interface WallPalette {
  id: WallPaletteId;
  name: TrilingualText;
  wallHex: string;
  accentHex: string;
  swatchHex: string;
}

export interface FloorPalette {
  id: FloorPaletteId;
  name: TrilingualText;
  woodTintHex: string;
  corridorTintHex: string;
  labFloorHex: string;
  swatchHex: string;
}

export const WALL_PALETTES: WallPalette[] = [
  {
    id: 'ivory',
    name: { kk: 'Ақшыл піл сүйегі', ru: 'Тёплый белый', en: 'Warm Ivory' },
    wallHex: '#f1efe9',
    accentHex: '#d8e3e7',
    swatchHex: '#f1efe9',
  },
  {
    id: 'sage',
    name: { kk: 'Жұмсақ жасыл', ru: 'Мягкий шалфей', en: 'Soft Sage' },
    wallHex: '#d6e3d8',
    accentHex: '#bdd1c3',
    swatchHex: '#b7cfb9',
  },
  {
    id: 'sky',
    name: { kk: 'Ашық көгілдір', ru: 'Светло-голубой', en: 'Airy Sky' },
    wallHex: '#d9e7f3',
    accentHex: '#bed4e8',
    swatchHex: '#a7cae6',
  },
  {
    id: 'sand',
    name: { kk: 'Жылы құм түс', ru: 'Песочный беж', en: 'Warm Sand' },
    wallHex: '#ebe0cc',
    accentHex: '#dac8aa',
    swatchHex: '#dfd0b3',
  },
  {
    id: 'peach',
    name: { kk: 'Шабдалы реңк', ru: 'Тёплый персик', en: 'Soft Clay' },
    wallHex: '#efd9ce',
    accentHex: '#e1c1b2',
    swatchHex: '#e3b8a3',
  },
  {
    id: 'mist',
    name: { kk: 'Сұрғылт тұман', ru: 'Светлый графит', en: 'Cool Mist' },
    wallHex: '#dbe1e8',
    accentHex: '#c3ccd6',
    swatchHex: '#bac5d1',
  },
];

export const FLOOR_PALETTES: FloorPalette[] = [
  {
    id: 'oak',
    name: { kk: 'Табиғи емен', ru: 'Натуральный дуб', en: 'Natural Oak' },
    woodTintHex: '#ffffff',
    corridorTintHex: '#ffffff',
    labFloorHex: '#cbd5e1',
    swatchHex: '#c9a679',
  },
  {
    id: 'maple',
    name: { kk: 'Ашық үйеңкі', ru: 'Светлый клён', en: 'Light Maple' },
    woodTintHex: '#fff4e0',
    corridorTintHex: '#f7f8fa',
    labFloorHex: '#e2e8f0',
    swatchHex: '#e6cfa8',
  },
  {
    id: 'walnut',
    name: { kk: 'Қою жаңғақ', ru: 'Тёмный орех', en: 'Dark Walnut' },
    woodTintHex: '#8d6e53',
    corridorTintHex: '#b4bcc6',
    labFloorHex: '#94a3b8',
    swatchHex: '#73533b',
  },
  {
    id: 'terracotta',
    name: { kk: 'Терракота', ru: 'Тёплая терракота', en: 'Terracotta' },
    woodTintHex: '#d99a74',
    corridorTintHex: '#e4d5c7',
    labFloorHex: '#d3c1b2',
    swatchHex: '#c27b56',
  },
  {
    id: 'slate',
    name: { kk: 'Заманауи сұр', ru: 'Серый камень', en: 'Modern Slate' },
    woodTintHex: '#a9b5c2',
    corridorTintHex: '#b5c0cc',
    labFloorHex: '#98a6b5',
    swatchHex: '#7e8c9c',
  },
];

export const MAX_TEACHERS = 6;
export const MAX_STUDENTS = 24;

export const SCHOOL_ZONES: ZoneConfig[] = [
  {
    id: 'courtyard',
    code: '00',
    name: {
      kk: 'Мектеп ауласы',
      ru: 'Школьный двор',
      en: 'School Courtyard',
    },
    shortName: {
      kk: 'Аула',
      ru: 'Двор',
      en: 'Courtyard',
    },
    subtitle: {
      kk: 'Бас кіреберіс, спорт алаңы және демалыс аймағы',
      ru: 'Главный вход, баскетбольная площадка и зона отдыха',
      en: 'Main entrance, basketball half-court, and campus garden',
    },
    accentHex: '#0EA5E9',
    cameraPos: [0, 14.5, 31],
    cameraTarget: [0, 2.5, 4],
    walkSpawn: [0, 1.65, 22],
    walkYaw: 0,
    rules: [
      {
        id: 'cy-1',
        title: {
          kk: 'Тазалық пен көгалды сақтау',
          ru: 'Беречь чистоту и зелёные насаждения',
          en: 'Keep the Campus Clean & Green',
        },
        description: {
          kk: 'Қоқысты тек арнайы жәшіктерге тастаңыз. Гүлзарларды таптамаңыз және ағаш бұтақтарын сындырмаңыз.',
          ru: 'Выбрасывайте мусор только в урны, не ходите по газонам и клумбам, берегите деревья и скамейки.',
          en: 'Use litter bins for all waste, stay on paved walkways, and protect campus trees, flowerbeds, and benches.',
        },
      },
      {
        id: 'cy-2',
        title: {
          kk: 'Спорт алаңындағы қауіпсіздік',
          ru: 'Безопасность на спортивной площадке',
          en: 'Playground & Sports Court Safety',
        },
        description: {
          kk: 'Баскетбол алаңында адал ойнаңыз, итеріспеңіз және кіші сынып оқушыларына мұқият болыңыз.',
          ru: 'Играйте честно и аккуратно на площадке, не толкайтесь и уступайте место младшим школьникам.',
          en: 'Play fairly on the basketball court, avoid rough pushing, and stay mindful of younger students nearby.',
        },
      },
      {
        id: 'cy-3',
        title: {
          kk: 'Мектепке уақытылы келу',
          ru: 'Своевременный приход и внешний вид',
          en: 'Punctual Arrival & Readiness',
        },
        description: {
          kk: 'Сабақ басталуына 10–15 минут бұрын ұқыпты мектеп формасымен келіп, велосипедті тұраққа қойыңыз.',
          ru: 'Приходите за 10–15 минут до звонка в опрятной школьной форме; велосипеды и самокаты оставляйте на парковке.',
          en: 'Arrive 10–15 minutes before the bell in neat school attire, and park bicycles or scooters at the designated rack.',
        },
      },
      {
        id: 'cy-4',
        title: {
          kk: 'Аумақтағы жол тәртібі',
          ru: 'Осторожность у ворот и входа',
          en: 'Safe Entry & Gate Awareness',
        },
        description: {
          kk: 'Қақпа маңында жүгірмеңіз, көлік қозғалысына назар аударыңыз және қонақтармен сыпайы амандасыңыз.',
          ru: 'Не выбегайте резко за ворота, следите за движением транспорта и вежливо приветствуйте учителей и гостей.',
          en: 'Walk calmly near the main gates, watch for vehicles outside campus, and greet teachers and visitors politely.',
        },
      },
    ],
  },
  {
    id: 'corridor',
    code: '01',
    name: {
      kk: 'Мектеп дәлізі',
      ru: 'Школьный коридор',
      en: 'Main Hallway',
    },
    shortName: {
      kk: 'Дәліз',
      ru: 'Коридор',
      en: 'Hallway',
    },
    subtitle: {
      kk: '101–104 оқу кабинеттеріне апаратын орталық дәліз',
      ru: 'Центральный холл и переходы в кабинеты 101–104',
      en: 'Central foyer connecting classrooms 101 through 104',
    },
    accentHex: '#14B8A6',
    cameraPos: [0, 3.0, 1.4],
    cameraTarget: [0, 1.8, -3.5],
    walkSpawn: [0, 1.95, 1.0],
    walkYaw: 0,
    rules: [
      {
        id: 'cor-1',
        title: {
          kk: 'Оң жақпен сабырлы жүру',
          ru: 'Спокойное движение по правой стороне',
          en: 'Walk Calmly on the Right Side',
        },
        description: {
          kk: 'Дәлізде жүгірмеңіз және итеріспеңіз. Оң жақ бағытты сақтап, есік алдында тобыр жасамаңыз.',
          ru: 'Не бегайте и не толкайтесь на переменах. Держитесь правой стороны и не загораживайте проходы у дверей.',
          en: 'Never run or push during recess. Keep to the right side of the corridor and leave classroom doorways clear.',
        },
      },
      {
        id: 'cor-2',
        title: {
          kk: 'Дауыс деңгейін сақтау',
          ru: 'Умеренная громкость речи',
          en: 'Use Respectful Indoor Voices',
        },
        description: {
          kk: 'Үзіліс кезінде айқайламай сөйлесіңіз — көрші кабинеттерде сабақ немесе дайындық өтіп жатуы мүмкін.',
          ru: 'Разговаривайте спокойно, без криков и громкой музыки на телефоне, чтобы не мешать другим классам.',
          en: 'Speak in calm indoor voices without shouting or playing loud audio so nearby classes stay undisturbed.',
        },
      },
      {
        id: 'cor-3',
        title: {
          kk: 'Шкафтар мен мүлікке ұқыптылық',
          ru: 'Порядок у шкафчиков и стендов',
          en: 'Care for Lockers & Displays',
        },
        description: {
          kk: 'Жеке шкафыңызды таза ұстаңыз, қабырғаларға сурет салмаңыз және ақпараттық стендтерді бүлдірмеңіз.',
          ru: 'Содержите личные шкафчики в порядке, не портите стены, витрины с наградами и информационные стенды.',
          en: 'Keep lockers neat and closed, and respect hallway walls, trophy cases, plants, and notice boards.',
        },
      },
      {
        id: 'cor-4',
        title: {
          kk: 'Үлкенге құрмет, кішіге ізет',
          ru: 'Взаимное уважение и вежливость',
          en: 'Courtesy & Mutual Respect',
        },
        description: {
          kk: 'Мұғалімдер мен қонақтарға жол беріңіз, қажет болғанда кіші сынып оқушыларына көмектесіңіз.',
          ru: 'Уступайте дорогу учителям и взрослым, помогайте младшим ученикам и решайте споры словами.',
          en: 'Give way to teachers and guests, help younger students when needed, and resolve disagreements respectfully.',
        },
      },
    ],
  },
  {
    id: 'classroom-math',
    code: '101',
    name: {
      kk: '101-кабинет · Математика',
      ru: 'Кабинет 101 · Математика',
      en: 'Room 101 · Mathematics',
    },
    shortName: {
      kk: '101 Матем.',
      ru: '101 Матем.',
      en: '101 Math',
    },
    subtitle: {
      kk: 'Негізгі оқу сыныбы мен сабақ үстіндегі тәртіп',
      ru: 'Учебный класс и правила поведения на уроке',
      en: 'General classroom & active lesson etiquette',
    },
    accentHex: '#2563EB',
    cameraPos: [-18.8, 3.0, -4.8],
    cameraTarget: [-14.8, 1.7, -11.2],
    walkSpawn: [-15.5, 1.95, -4.6],
    walkYaw: 0,
    rules: [
      {
        id: 'math-1',
        title: {
          kk: 'Сабаққа толық дайындық',
          ru: 'Готовность к началу урока',
          en: 'Be Prepared Before the Bell',
        },
        description: {
          kk: 'Қоңырау соғылғанға дейін орныңызға отырып, оқулық, дәптер мен қаламсабыңызды дайындап қойыңыз.',
          ru: 'Займите своё место до звонка и заранее приготовьте учебник, тетрадь, ручку и чертёжные принадлежности.',
          en: 'Take your seat before the bell rings with your textbook, notebook, and writing tools ready on the desk.',
        },
      },
      {
        id: 'math-2',
        title: {
          kk: 'Қол көтеріп сөйлеу мәдениеті',
          ru: 'Правило поднятой руки',
          en: 'Raise Your Hand to Speak',
        },
        description: {
          kk: 'Сұрақ қою немесе жауап беру үшін қолыңызды көтеріңіз. Мұғалім мен сыныптастардың сөзін бөлмеңіз.',
          ru: 'Поднимайте руку, чтобы задать вопрос или ответить. Не перебивайте учителя и одноклассников.',
          en: 'Raise your hand before speaking or asking questions, and listen attentively without interrupting others.',
        },
      },
      {
        id: 'math-3',
        title: {
          kk: 'Телефонды дыбыссыз режимге қою',
          ru: 'Тихий режим мобильных устройств',
          en: 'Keep Phones Silent & Away',
        },
        description: {
          kk: 'Сабақ кезінде телефонды дыбыссыз режимге қойып, сөмкеде сақтаңыз (тек мұғалім рұқсатымен қолданылады).',
          ru: 'Переведите телефон в беззвучный режим и уберите в рюкзак на время урока, если он не нужен для задания.',
          en: 'Switch phones to silent and keep them stored in your bag unless explicitly permitted for a class activity.',
        },
      },
      {
        id: 'math-4',
        title: {
          kk: 'Оқу орнын таза ұстау',
          ru: 'Бережное отношение к партам и доске',
          en: 'Leave Your Desk Clean & Neat',
        },
        description: {
          kk: 'Партаға жазбаңыз, сабақ аяқталғанда орындықты жинап, тақта мен кабинетті келесі сыныпқа таза қалдырыңыз.',
          ru: 'Не рисуйте на партах, задвигайте стул после урока и оставляйте рабочее место чистым для следующего класса.',
          en: 'Never write on desks, tuck in your chair when leaving, and keep the classroom spotless for the next group.',
        },
      },
    ],
  },
  {
    id: 'classroom-science',
    code: '102',
    name: {
      kk: '102-кабинет · Химия зертханасы',
      ru: 'Кабинет 102 · Лаборатория',
      en: 'Room 102 · Science Lab',
    },
    shortName: {
      kk: '102 Зертх.',
      ru: '102 Лаб.',
      en: '102 Lab',
    },
    subtitle: {
      kk: 'Тәжірибелік сабақтар мен зертханалық қауіпсіздік',
      ru: 'Химия, биология и техника безопасности в лаборатории',
      en: 'Chemistry & biology lab safety procedures',
    },
    accentHex: '#10B981',
    cameraPos: [-8.6, 3.0, -4.8],
    cameraTarget: [-4.4, 1.7, -11.2],
    walkSpawn: [-5.5, 1.95, -4.6],
    walkYaw: 0,
    rules: [
      {
        id: 'sci-1',
        title: {
          kk: 'Тәжірибені тек рұқсатпен бастау',
          ru: 'Работа строго по инструкции учителя',
          en: 'Follow Teacher Instructions First',
        },
        description: {
          kk: 'Мұғалімнің нұсқауынсыз реактивтерді, колбаларды немесе микроскоптарды өз бетінше қолданбаңыз.',
          ru: 'Не прикасайтесь к реактивам, горелкам и приборам до получения чёткого инструктажа от преподавателя.',
          en: 'Never touch chemicals, glassware, or instruments until your teacher explains the procedure and gives permission.',
        },
      },
      {
        id: 'sci-2',
        title: {
          kk: 'Қорғаныш құралдарын пайдалану',
          ru: 'Использование средств защиты',
          en: 'Wear Protective Lab Gear',
        },
        description: {
          kk: 'Практикалық жұмыс кезінде қорғаныш көзілдірігі мен халат киіп, ұзын шашты жинап алыңыз.',
          ru: 'Во время опытов надевайте защитные очки и халат, убирайте длинные волосы и свободные рукава.',
          en: 'Wear safety goggles and lab coats during experiments, tie back long hair, and secure loose sleeves.',
        },
      },
      {
        id: 'sci-3',
        title: {
          kk: 'Заттардың дәмін татпау және иіскемеу',
          ru: 'Запрет на пробу веществ и еду в кабинете',
          en: 'Never Taste, Smell, or Eat in Lab',
        },
        description: {
          kk: 'Зертханада тамақ ішуге, су ішуге немесе белгісіз сұйықтықтарды тікелей иіскеуге қатаң тыйым салынады.',
          ru: 'В лаборатории запрещено есть, пить, пробовать вещества на вкус или вдыхать пары напрямую из сосуда.',
          en: 'Food and drinks are strictly forbidden in the lab. Never taste chemicals or inhale vapors directly from flasks.',
        },
      },
      {
        id: 'sci-4',
        title: {
          kk: 'Төтенше жағдайда дереу хабарлау',
          ru: 'Немедленно сообщать о проливах и поломках',
          en: 'Report Spills & Breakage Immediately',
        },
        description: {
          kk: 'Ыдыс сынса немесе сұйықтық төгілсе, жалаңаш қолмен жинамай, бірден мұғалімге хабарлаңыз.',
          ru: 'Если разбилась пробирка или пролился раствор, не убирайте голыми руками — сразу сообщите учителю.',
          en: 'If glassware breaks or a liquid spills, do not touch it bare-handed—alert the teacher immediately.',
        },
      },
    ],
  },
  {
    id: 'classroom-library',
    code: '103',
    name: {
      kk: '103-кабинет · Кітапхана',
      ru: 'Кабинет 103 · Библиотека',
      en: 'Room 103 · School Library',
    },
    shortName: {
      kk: '103 Кітапх.',
      ru: '103 Библ.',
      en: '103 Library',
    },
    subtitle: {
      kk: 'Оқу залы, тыныштық аймағы және кітап қоры',
      ru: 'Читальный зал, тихая работа и бережное отношение к книгам',
      en: 'Quiet reading room & book stewardship',
    },
    accentHex: '#D97706',
    cameraPos: [2.4, 3.0, -4.8],
    cameraTarget: [6.6, 1.7, -11.2],
    walkSpawn: [5.5, 1.95, -4.6],
    walkYaw: 0,
    rules: [
      {
        id: 'lib-1',
        title: {
          kk: 'Тыныштық режимін сақтау',
          ru: 'Соблюдение тишины в читальном зале',
          en: 'Maintain Quiet Study Atmosphere',
        },
        description: {
          kk: 'Оқу залында сыбырлап сөйлесіңіз және басқа оқырмандардың зейінін бөлмеу үшін гаджет дыбысын өшіріңіз.',
          ru: 'Говорите шёпотом и отключайте звук устройств, чтобы каждый мог спокойно читать и готовиться к урокам.',
          en: 'Speak in whispers and mute all devices so everyone can read, research, and focus undisturbed.',
        },
      },
      {
        id: 'lib-2',
        title: {
          kk: 'Кітаптарды ұқыпты ұстау',
          ru: 'Бережное обращение с книгами',
          en: 'Handle Books with Clean Hands',
        },
        description: {
          kk: 'Беттерді бүктемеңіз, кітап ішіне белгі салмаңыз — арнайы бетбелгі (закладка) қолданыңыз.',
          ru: 'Не загибайте уголки страниц и не делайте пометок ручкой — пользуйтесь закладками и берегите переплёт.',
          en: 'Use bookmarks instead of folding pages, never write inside library books, and keep spines intact.',
        },
      },
      {
        id: 'lib-3',
        title: {
          kk: 'Уақытылы қайтару және тіркеу',
          ru: 'Своевременный возврат литературы',
          en: 'Check Out & Return on Time',
        },
        description: {
          kk: 'Үйге алатын кітапты кітапханашыға тіркетіп, белгіленген мерзімде қайтарыңыз.',
          ru: 'Обязательно записывайте взятые издания у библиотекаря и возвращайте их в срок для других учеников.',
          en: 'Always register borrowed books at the librarian desk and return them by the due date for classmates.',
        },
      },
      {
        id: 'lib-4',
        title: {
          kk: 'Тағам мен сусынсыз оқу залы',
          ru: 'Без еды и напитков у книжных полок',
          en: 'No Food or Drinks Near Books',
        },
        description: {
          kk: 'Кітаптарды бүлдіріп алмау үшін оқу залына тамақ пен ашық сусындарды алып кірмеңіз.',
          ru: 'Не приносите еду и открытые напитки в читальный зал, чтобы случайно не испачкать редкие книги.',
          en: 'Keep snacks and open drinks outside the library to protect books, tables, and study materials.',
        },
      },
    ],
  },
  {
    id: 'classroom-it',
    code: '104',
    name: {
      kk: '104-кабинет · Информатика',
      ru: 'Кабинет 104 · Информатика',
      en: 'Room 104 · Computer & IT Lab',
    },
    shortName: {
      kk: '104 Информ.',
      ru: '104 Информ.',
      en: '104 IT Lab',
    },
    subtitle: {
      kk: 'Цифрлық сауаттылық, техника қауіпсіздігі және желі этикасы',
      ru: 'Компьютерный класс, электробезопасность и цифровая этика',
      en: 'Workstation safety & responsible digital citizenship',
    },
    accentHex: '#6366F1',
    cameraPos: [19.2, 3.0, -4.8],
    cameraTarget: [15.0, 1.7, -11.2],
    walkSpawn: [15.5, 1.95, -4.6],
    walkYaw: 0,
    rules: [
      {
        id: 'it-1',
        title: {
          kk: 'Техника мен кабельдер қауіпсіздігі',
          ru: 'Аккуратная работа с техникой и проводами',
          en: 'Respect Equipment & Cables',
        },
        description: {
          kk: 'Электр сымдарына, розеткаларға тиіспеңіз, монитор экранын саусақпен баспаңыз және сусын қоймаңыз.',
          ru: 'Не трогайте разъёмы и сетевые провода, не нажимайте на экраны мониторов и не ставьте воду рядом с ПК.',
          en: 'Never pull power cords or ports, keep hands off monitor screens, and keep liquids well away from workstations.',
        },
      },
      {
        id: 'it-2',
        title: {
          kk: 'Тек оқу мақсатында қолдану',
          ru: 'Использование ПК для учебных задач',
          en: 'Use Computers for Learning Tasks',
        },
        description: {
          kk: 'Компьютерге рұқсатсыз бағдарлама орнатпаңыз және сабақ кезінде бөгде сайттар мен ойындар ашпаңыз.',
          ru: 'Не устанавливайте сторонние программы, не меняйте системные настройки и работайте только по теме урока.',
          en: 'Do not install unauthorized software, alter system settings, or open unrelated games during lessons.',
        },
      },
      {
        id: 'it-3',
        title: {
          kk: 'Жеке деректер мен құпиясөзді қорғау',
          ru: 'Защита паролей и личных данных',
          en: 'Protect Passwords & Privacy',
        },
        description: {
          kk: 'Өз логиніңіз бен құпиясөзіңізді бөліспеңіз, сабақ соңында аккаунтыңыздан міндетті түрде шығыңыз.',
          ru: 'Храните свои пароли в секрете, не заходите в чужие профили и выходите из аккаунтов в конце урока.',
          en: 'Keep passwords private, never access another student’s account, and sign out before leaving your station.',
        },
      },
      {
        id: 'it-4',
        title: {
          kk: 'Цифрлық мәдениет және көзді қорғау',
          ru: 'Цифровая этика и правильная осанка',
          en: 'Digital Ethics & Healthy Posture',
        },
        description: {
          kk: 'Онлайн ортада сыпайы болыңыз, арқаңызды түзу ұстап, монитордан 50–60 см қашықтықты сақтаңыз.',
          ru: 'Общайтесь уважительно в школьной сети, держите спину ровно и соблюдайте дистанцию 50–60 см до экрана.',
          en: 'Practice respectful online communication, sit with straight posture, and keep 50–60 cm distance from the screen.',
        },
      },
    ],
  },
];

export const CUTAWAY_CAMERA = {
  pos: [0, 29, 21] as [number, number, number],
  target: [0, 0.5, -5.5] as [number, number, number],
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    zoneId: 'corridor',
    question: {
      kk: 'Үзіліс кезінде мектеп дәлізінде қалай қозғалу дұрыс?',
      ru: 'Как правильно передвигаться по школьному коридору на перемене?',
      en: 'What is the right way to move through the school hallway during recess?',
    },
    options: [
      {
        kk: 'Сыныпқа тез жету үшін жүгіріп өту',
        ru: 'Бежать бегом, чтобы быстрее успеть в кабинет',
        en: 'Run quickly to reach the next classroom first',
      },
      {
        kk: 'Оң жақпен сабырлы жүріп, есік алдын бос қалдыру',
        ru: 'Спокойно идти по правой стороне, не загораживая двери',
        en: 'Walk calmly on the right side without blocking doorways',
      },
      {
        kk: 'Дәліздің ортасында үлкен топпен тұру',
        ru: 'Собраться большой группой прямо в центре прохода',
        en: 'Stand in a large group blocking the center of the hall',
      },
    ],
    correctIndex: 1,
    explanation: {
      kk: 'Оң жақпен сабырлы жүру соқтығысудың алдын алады және барлық оқушылар үшін қауіпсіз.',
      ru: 'Спокойное правостороннее движение предотвращает столкновения и делает коридор безопасным для всех.',
      en: 'Calmly walking on the right prevents collisions and keeps hallways safe for everyone.',
    },
  },
  {
    id: 'q2',
    zoneId: 'classroom-science',
    question: {
      kk: 'Химия зертханасында пробирка сынып, сұйықтық төгілсе не істеу керек?',
      ru: 'Что нужно сделать, если в химической лаборатории разбилась пробирка и пролился раствор?',
      en: 'What should you do if a test tube breaks and spills liquid in the science lab?',
    },
    options: [
      {
        kk: 'Жалаңаш қолмен тез жинап тастау',
        ru: 'Быстро собрать осколки голыми руками',
        en: 'Quickly pick up the glass pieces bare-handed',
      },
      {
        kk: 'Ештеңе айтпай басқа үстелге ауысу',
        ru: 'Никому не говорить и пересесть за другой стол',
        en: 'Move quietly to another bench without saying anything',
      },
      {
        kk: 'Қол тигізбей, бірден мұғалімге хабарлау',
        ru: 'Не прикасаться руками и сразу сообщить учителю',
        en: 'Do not touch it bare-handed and inform the teacher immediately',
      },
    ],
    correctIndex: 2,
    explanation: {
      kk: 'Шыны мен химиялық ерітінділер жарақат пен күйік әкелуі мүмкін, сондықтан бірден мұғалімге хабарлау қажет.',
      ru: 'Осколки и реактивы опасны для кожи — учитель безопасно организует уборку специальными средствами.',
      en: 'Broken glass and chemical spills can cause injury; teachers have proper safety gear to handle cleanup.',
    },
  },
  {
    id: 'q3',
    zoneId: 'classroom-library',
    question: {
      kk: 'Кітапхана кітабында оқып жатқан бетті қалай белгілеу керек?',
      ru: 'Как правильно отмечать нужную страницу в библиотечной книге?',
      en: 'How should you mark your place in a school library book?',
    },
    options: [
      {
        kk: 'Арнайы бетбелгі (закладка) қою',
        ru: 'Использовать специальную закладку',
        en: 'Use a proper bookmark',
      },
      {
        kk: 'Беттің бұрышын бүктеп қою',
        ru: 'Загнуть уголок страницы',
        en: 'Fold down the corner of the page',
      },
      {
        kk: 'Қаламмен сызып белгілеу',
        ru: 'Сделать пометку ручкой на полях',
        en: 'Mark the margin with a pen',
      },
    ],
    correctIndex: 0,
    explanation: {
      kk: 'Бетбелгі кітапты таза күйінде сақтайды, сонда оны басқа оқушылар да қуана оқи алады.',
      ru: 'Закладка сохраняет страницы аккуратными, чтобы книгой могли пользоваться следующие читатели.',
      en: 'Bookmarks keep pages crisp and undamaged so future readers can enjoy the book too.',
    },
  },
  {
    id: 'q4',
    zoneId: 'classroom-it',
    question: {
      kk: 'Информатика сабағы аяқталған соң компьютерде нені ұмытпау керек?',
      ru: 'Что важно сделать за компьютером в конце урока информатики?',
      en: 'What should you remember to do on your workstation at the end of an IT lesson?',
    },
    options: [
      {
        kk: 'Жеке аккаунттан шығып, жұмыс орнын ретке келтіру',
        ru: 'Выйти из личного аккаунта и оставить рабочее место в порядке',
        en: 'Sign out of your personal account and tidy the workstation',
      },
      {
        kk: 'Қуат сымын розеткадан тартып суыру',
        ru: 'Выдернуть кабель питания из розетки',
        en: 'Pull the power cord straight out of the wall socket',
      },
      {
        kk: 'Бағдарламалар мен құпиясөздерді ашық қалдыру',
        ru: 'Оставить все личные профили открытыми',
        en: 'Leave all personal profiles logged in for the next student',
      },
    ],
    correctIndex: 0,
    explanation: {
      kk: 'Аккаунттан шығу жеке деректерді қорғайды және келесі оқушыға таза орта дайындайды.',
      ru: 'Выход из профиля защищает ваши данные и готовит компьютер к следующему уроку.',
      en: 'Signing out protects your privacy and leaves the workstation ready for the next class.',
    },
  },
];

export function getZoneById(id: ZoneId): ZoneConfig {
  return SCHOOL_ZONES.find((z) => z.id === id) ?? SCHOOL_ZONES[0];
}
