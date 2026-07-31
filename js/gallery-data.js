/**
 * gallery-data.js — Centralized Gallery Event Data
 * Ashraf Islamia Model Public Secondary School
 *
 * ARCHITECTURE NOTE:
 * All gallery event data is centralized here so it can later be
 * replaced by API / database data without rebuilding the UI.
 *
 * Data shape (each event):
 * {
 *   id:          string  — URL-safe slug
 *   name:        string  — Display name
 *   date:        string  — Display date string
 *   year:        string  — Year (for filter)
 *   category:    string  — Category slug for filtering
 *   description: string  — Short description shown on card & event page
 *   coverImage:  string  — Cover image URL
 *   coverAlt:    string  — Accessible alt text for cover image
 *   photoCount:  number  — Number of demo photos
 *   videoCount:  number  — Number of demo videos
 *   photos:      Photo[] — Array of photo objects
 *   videos:      Video[] — Array of video objects
 * }
 *
 * Photo shape:
 * { id, src, alt, width, height }
 *
 * Video shape:
 * { id, thumbnail, thumbnailAlt, title, duration }
 */

/* ───────────────────────────────────────────────────────────────
   UNSPLASH IMAGE SOURCES
   These are publicly accessible placeholder images.
   Replace with real school media via Admin Panel later.
   ─────────────────────────────────────────────────────────────── */

const GALLERY_EVENTS = [

  // ── Event 1: Annual Sports Day 2026 ──────────────────────────
  {
    id:          'sports-day-2026',
    name:        'Annual Sports Day 2026',
    date:        'March 2026',
    year:        '2026',
    category:    'sports',
    description: 'A vibrant celebration of teamwork, determination, and school spirit. Students competed across disciplines showcasing sportsmanship and unity.',
    coverImage:  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Students participating in school sports activities on a sunny day',
    photoCount:  12,
    videoCount:  2,
    photos: [
      { id: 'sp1',  src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=70&auto=format&fit=crop', alt: 'Students in athletic formation during sports day', width: 4, height: 3 },
      { id: 'sp2',  src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=70&auto=format&fit=crop', alt: 'Young students running a race on a school track', width: 3, height: 2 },
      { id: 'sp3',  src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=70&auto=format&fit=crop', alt: 'Students warming up before a sporting event', width: 3, height: 4 },
      { id: 'sp4',  src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=70&auto=format&fit=crop', alt: 'Students cheering for their teammates', width: 16, height: 9 },
      { id: 'sp5',  src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=70&auto=format&fit=crop', alt: 'Students competing in a relay race', width: 4, height: 3 },
      { id: 'sp6',  src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=70&auto=format&fit=crop', alt: 'School sports event with a large crowd of students', width: 3, height: 2 },
      { id: 'sp7',  src: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600&q=70&auto=format&fit=crop', alt: 'Students engaging in team sports activities', width: 4, height: 3 },
      { id: 'sp8',  src: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=70&auto=format&fit=crop', alt: 'Award presentation during sports day ceremony', width: 3, height: 4 },
      { id: 'sp9',  src: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=70&auto=format&fit=crop', alt: 'Students celebrating their sports day victory', width: 16, height: 9 },
      { id: 'sp10', src: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=600&q=70&auto=format&fit=crop', alt: 'A student receiving a sports trophy at school', width: 4, height: 3 },
      { id: 'sp11', src: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=70&auto=format&fit=crop', alt: 'Students marching in opening ceremony of sports day', width: 3, height: 2 },
      { id: 'sp12', src: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=70&auto=format&fit=crop', alt: 'Students in colorful uniforms participating in school games', width: 4, height: 3 },
    ],
    videos: [
      { id: 'sv1', thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video thumbnail showing students at sports day', title: 'Opening Ceremony Highlights', duration: '3:24' },
      { id: 'sv2', thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video thumbnail showing sports events and students', title: 'Race Finals & Prize Distribution', duration: '5:12' },
    ],
  },

  // ── Event 2: Independence Day 2026 ───────────────────────────
  {
    id:          'independence-day-2026',
    name:        'Independence Day 2026',
    date:        'August 2026',
    year:        '2026',
    category:    'celebrations',
    description: "Marking Pakistan's Independence Day with patriotic performances, flag hoisting, and a proud assembly celebrating national heritage and unity.",
    coverImage:  'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Students gathered at a patriotic school ceremony during Independence Day',
    photoCount:  10,
    videoCount:  2,
    photos: [
      { id: 'id1', src: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=70&auto=format&fit=crop', alt: 'Students at a national flag ceremony at school', width: 4, height: 3 },
      { id: 'id2', src: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=70&auto=format&fit=crop', alt: 'School assembly celebrating national Independence Day', width: 16, height: 9 },
      { id: 'id3', src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=70&auto=format&fit=crop', alt: 'Students in patriotic attire at school celebration', width: 3, height: 4 },
      { id: 'id4', src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=70&auto=format&fit=crop', alt: 'School building decorated for Independence Day', width: 4, height: 3 },
      { id: 'id5', src: 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=70&auto=format&fit=crop', alt: 'Students performing at Independence Day event', width: 3, height: 2 },
      { id: 'id6', src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=70&auto=format&fit=crop', alt: 'Students engaged in patriotic activities at school', width: 4, height: 3 },
      { id: 'id7', src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70&auto=format&fit=crop', alt: 'National flag raised at school during independence ceremony', width: 3, height: 4 },
      { id: 'id8', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=70&auto=format&fit=crop', alt: 'School ceremony with students in orderly rows', width: 16, height: 9 },
      { id: 'id9', src: 'https://images.unsplash.com/photo-1532618500676-2e0cbf7ba8b8?w=600&q=70&auto=format&fit=crop', alt: 'Student presenting a patriotic speech at school event', width: 4, height: 3 },
      { id: 'id10', src: 'https://images.unsplash.com/photo-1583394293253-8ce6e277b01b?w=600&q=70&auto=format&fit=crop', alt: 'Group of students celebrating Independence Day together', width: 3, height: 2 },
    ],
    videos: [
      { id: 'idv1', thumbnail: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video thumbnail of flag hoisting ceremony', title: 'Flag Hoisting Ceremony', duration: '2:45' },
      { id: 'idv2', thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video thumbnail of patriotic performances', title: 'Student Patriotic Performances', duration: '7:18' },
    ],
  },

  // ── Event 3: Annual Function 2026 ────────────────────────────
  {
    id:          'annual-function-2026',
    name:        'Annual Function 2026',
    date:        'February 2026',
    year:        '2026',
    category:    'events',
    description: 'Our flagship annual celebration featuring cultural performances, student achievements, and a grand gathering of the entire school community.',
    coverImage:  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Students performing on stage during the school annual function event',
    photoCount:  14,
    videoCount:  3,
    photos: [
      { id: 'af1',  src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70&auto=format&fit=crop', alt: 'Large school auditorium decorated for annual function', width: 16, height: 9 },
      { id: 'af2',  src: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70&auto=format&fit=crop', alt: 'Students performing a cultural dance on stage', width: 4, height: 3 },
      { id: 'af3',  src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=70&auto=format&fit=crop', alt: 'School stage beautifully decorated for a grand ceremony', width: 3, height: 4 },
      { id: 'af4',  src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=70&auto=format&fit=crop', alt: 'Students engaged in a school theatre performance', width: 4, height: 3 },
      { id: 'af5',  src: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=70&auto=format&fit=crop', alt: 'Teachers and guests seated at a school ceremony', width: 16, height: 9 },
      { id: 'af6',  src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&q=70&auto=format&fit=crop', alt: 'Beautiful lights and decorations at a school event', width: 3, height: 2 },
      { id: 'af7',  src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70&auto=format&fit=crop', alt: 'Students in formal uniforms at an annual ceremony', width: 4, height: 3 },
      { id: 'af8',  src: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=600&q=70&auto=format&fit=crop', alt: 'Stage performance with colourful lighting at school function', width: 3, height: 4 },
      { id: 'af9',  src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=70&auto=format&fit=crop', alt: 'Children enjoying a school cultural celebration', width: 4, height: 3 },
      { id: 'af10', src: 'https://images.unsplash.com/photo-1526328828355-69b01701ca6a?w=600&q=70&auto=format&fit=crop', alt: 'A student giving a speech on stage at the annual function', width: 16, height: 9 },
      { id: 'af11', src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=70&auto=format&fit=crop', alt: 'Music performance by students at the annual event', width: 4, height: 3 },
      { id: 'af12', src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=70&auto=format&fit=crop', alt: 'Students and teachers gathered at school annual celebration', width: 3, height: 2 },
      { id: 'af13', src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=70&auto=format&fit=crop', alt: 'Group photo of students at the annual school function', width: 4, height: 3 },
      { id: 'af14', src: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&q=70&auto=format&fit=crop', alt: 'Staff and students celebrating after annual function', width: 3, height: 4 },
    ],
    videos: [
      { id: 'afv1', thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of school annual function highlights', title: 'Annual Function Highlights Reel', duration: '8:30' },
      { id: 'afv2', thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of cultural performances at annual function', title: 'Cultural Performances', duration: '12:05' },
      { id: 'afv3', thumbnail: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Opening address video from annual function', title: 'Welcome Address & Opening', duration: '4:52' },
    ],
  },

  // ── Event 4: Prize Distribution Ceremony 2026 ────────────────
  {
    id:          'prize-distribution-2026',
    name:        'Prize Distribution Ceremony 2026',
    date:        'January 2026',
    year:        '2026',
    category:    'events',
    description: 'Honouring academic excellence, sporting achievement, and character. Students who distinguished themselves received recognition before the entire school.',
    coverImage:  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Student receiving an award at a school prize distribution ceremony',
    photoCount:  9,
    videoCount:  1,
    photos: [
      { id: 'pd1', src: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=70&auto=format&fit=crop', alt: 'Principal presenting a certificate to an outstanding student', width: 4, height: 3 },
      { id: 'pd2', src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=70&auto=format&fit=crop', alt: 'Students lined up to receive awards at prize ceremony', width: 16, height: 9 },
      { id: 'pd3', src: 'https://images.unsplash.com/photo-1564565418-d7db8e02df6d?w=600&q=70&auto=format&fit=crop', alt: 'Trophy presentation at school prize distribution event', width: 3, height: 4 },
      { id: 'pd4', src: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=70&auto=format&fit=crop', alt: 'Academic achievers displaying their certificates proudly', width: 4, height: 3 },
      { id: 'pd5', src: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&q=70&auto=format&fit=crop', alt: 'Student shaking hands with the principal at prize ceremony', width: 3, height: 2 },
      { id: 'pd6', src: 'https://images.unsplash.com/photo-1576017083093-5429e32d22f9?w=600&q=70&auto=format&fit=crop', alt: 'Hall decorated with trophies and certificates at prize day', width: 4, height: 3 },
      { id: 'pd7', src: 'https://images.unsplash.com/photo-1500099817043-86d46000d58f?w=600&q=70&auto=format&fit=crop', alt: 'Students and teachers at a prize giving event', width: 16, height: 9 },
      { id: 'pd8', src: 'https://images.unsplash.com/photo-1612810806695-30f7a8258391?w=600&q=70&auto=format&fit=crop', alt: 'Happy student receiving sports achievement trophy', width: 4, height: 3 },
      { id: 'pd9', src: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&q=70&auto=format&fit=crop', alt: 'Group of award winning students at school ceremony', width: 3, height: 4 },
    ],
    videos: [
      { id: 'pdv1', thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of prize distribution ceremony', title: 'Prize Distribution Ceremony 2026', duration: '18:40' },
    ],
  },

  // ── Event 5: Teachers' Day 2026 ──────────────────────────────
  {
    id:          'teachers-day-2026',
    name:        "Teachers' Day 2026",
    date:        'October 2026',
    year:        '2026',
    category:    'events',
    description: 'A heartfelt tribute to the educators who shape minds and inspire futures. Students organised a special programme to honour their teachers.',
    coverImage:  'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Teacher being appreciated by students in a classroom setting',
    photoCount:  8,
    videoCount:  1,
    photos: [
      { id: 'td1', src: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=70&auto=format&fit=crop', alt: 'Teacher smiling with students at Teachers Day celebration', width: 4, height: 3 },
      { id: 'td2', src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=70&auto=format&fit=crop', alt: 'Students presenting flowers to their teachers', width: 16, height: 9 },
      { id: 'td3', src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=70&auto=format&fit=crop', alt: 'Teacher receiving an appreciation award from students', width: 3, height: 4 },
      { id: 'td4', src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=70&auto=format&fit=crop', alt: 'Students performing for their teachers on special day', width: 4, height: 3 },
      { id: 'td5', src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=70&auto=format&fit=crop', alt: 'Classroom decorated for Teachers Day with banners', width: 3, height: 2 },
      { id: 'td6', src: 'https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=600&q=70&auto=format&fit=crop', alt: 'Group photo of teachers and students on Teachers Day', width: 4, height: 3 },
      { id: 'td7', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=70&auto=format&fit=crop', alt: 'Students sharing handmade cards with their favourite teachers', width: 16, height: 9 },
      { id: 'td8', src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=70&auto=format&fit=crop', alt: 'A young student expressing gratitude to a teacher', width: 3, height: 4 },
    ],
    videos: [
      { id: 'tdv1', thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of Teachers Day celebration at school', title: "Teachers' Day Special Programme", duration: '6:14' },
    ],
  },

  // ── Event 6: Educational Activities 2026 ─────────────────────
  {
    id:          'educational-activities-2026',
    name:        'Educational Activities 2026',
    date:        'April 2026',
    year:        '2026',
    category:    'academic',
    description: 'Highlights of classroom projects, science exhibitions, library sessions, and co-curricular activities that make learning come alive.',
    coverImage:  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Students engaged in educational classroom activities and group projects',
    photoCount:  11,
    videoCount:  2,
    photos: [
      { id: 'ea1',  src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=70&auto=format&fit=crop', alt: 'Students engaged in group learning activity in a classroom', width: 4, height: 3 },
      { id: 'ea2',  src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=70&auto=format&fit=crop', alt: 'Students working on a science project in a school lab', width: 16, height: 9 },
      { id: 'ea3',  src: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=70&auto=format&fit=crop', alt: 'Student reading books in school library setting', width: 3, height: 4 },
      { id: 'ea4',  src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=70&auto=format&fit=crop', alt: 'Student drawing on a whiteboard during a class activity', width: 4, height: 3 },
      { id: 'ea5',  src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=70&auto=format&fit=crop', alt: 'Children working on educational puzzles and projects', width: 3, height: 2 },
      { id: 'ea6',  src: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&q=70&auto=format&fit=crop', alt: 'Young student working on a science model in class', width: 4, height: 3 },
      { id: 'ea7',  src: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=70&auto=format&fit=crop', alt: 'Teacher demonstrating an experiment to curious students', width: 16, height: 9 },
      { id: 'ea8',  src: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=600&q=70&auto=format&fit=crop', alt: 'Students collaborating on a project in their classroom', width: 3, height: 4 },
      { id: 'ea9',  src: 'https://images.unsplash.com/photo-1548449112-96a38a643324?w=600&q=70&auto=format&fit=crop', alt: 'School science exhibition with student-made models', width: 4, height: 3 },
      { id: 'ea10', src: 'https://images.unsplash.com/photo-1598897516650-b0d31b6dc2e5?w=600&q=70&auto=format&fit=crop', alt: 'Students taking notes during an interactive lesson', width: 3, height: 2 },
      { id: 'ea11', src: 'https://images.unsplash.com/photo-1536148935331-408321065b18?w=600&q=70&auto=format&fit=crop', alt: 'Students presenting their educational project to classmates', width: 4, height: 3 },
    ],
    videos: [
      { id: 'eav1', thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of classroom educational activities', title: 'Classroom Highlights 2026', duration: '4:30' },
      { id: 'eav2', thumbnail: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of science exhibition', title: 'Science Exhibition 2026', duration: '5:55' },
    ],
  },

  // ── Event 7: Convocation Ceremony 2025 ───────────────────────
  {
    id:          'convocation-2025',
    name:        'Convocation Ceremony 2025',
    date:        'November 2025',
    year:        '2025',
    category:    'events',
    description: 'Celebrating the graduating class of 2025. A proud milestone for students, families, and the entire AIMPS community.',
    coverImage:  'https://images.unsplash.com/photo-1627556704302-624286467c65?w=800&q=75&auto=format&fit=crop',
    coverAlt:    'Students in graduation attire celebrating their academic achievement',
    photoCount:  10,
    videoCount:  2,
    photos: [
      { id: 'cv1',  src: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=600&q=70&auto=format&fit=crop', alt: 'Graduate students in caps and gowns at convocation', width: 4, height: 3 },
      { id: 'cv2',  src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=600&q=70&auto=format&fit=crop', alt: 'Students receiving diplomas at graduation ceremony', width: 16, height: 9 },
      { id: 'cv3',  src: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=600&q=70&auto=format&fit=crop', alt: 'Proud students celebrating at their convocation day', width: 3, height: 4 },
      { id: 'cv4',  src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=70&auto=format&fit=crop', alt: 'Close-up of graduation caps thrown in the air at ceremony', width: 4, height: 3 },
      { id: 'cv5',  src: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=70&auto=format&fit=crop', alt: 'Teacher and student in a meaningful graduation moment', width: 3, height: 2 },
      { id: 'cv6',  src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=70&auto=format&fit=crop', alt: 'Family cheering for graduates at school convocation', width: 4, height: 3 },
      { id: 'cv7',  src: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=70&auto=format&fit=crop', alt: 'Proud student holding graduation certificate at ceremony', width: 16, height: 9 },
      { id: 'cv8',  src: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=70&auto=format&fit=crop', alt: 'Group of graduating students smiling at ceremony', width: 4, height: 3 },
      { id: 'cv9',  src: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=600&q=70&auto=format&fit=crop', alt: 'Students and teachers posing after convocation ceremony', width: 3, height: 4 },
      { id: 'cv10', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70&auto=format&fit=crop', alt: 'Hall decorated for school convocation celebration', width: 4, height: 3 },
    ],
    videos: [
      { id: 'cvv1', thumbnail: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of convocation ceremony highlights', title: 'Convocation Ceremony 2025', duration: '15:22' },
      { id: 'cvv2', thumbnail: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=600&q=70&auto=format&fit=crop', thumbnailAlt: 'Video of diploma distribution', title: 'Diploma Distribution', duration: '9:08' },
    ],
  },

];

/* ───────────────────────────────────────────────────────────────
   CATEGORY DEFINITIONS
   ─────────────────────────────────────────────────────────────── */

const GALLERY_CATEGORIES = [
  { id: 'all',          label: 'All Events' },
  { id: 'events',       label: 'Events'     },
  { id: 'sports',       label: 'Sports'     },
  { id: 'celebrations', label: 'Celebrations' },
  { id: 'academic',     label: 'Academic'   },
];

/* ───────────────────────────────────────────────────────────────
   EXPORT (accessible globally — no module bundler)
   ─────────────────────────────────────────────────────────────── */

window.GALLERY_EVENTS     = GALLERY_EVENTS;
window.GALLERY_CATEGORIES = GALLERY_CATEGORIES;
