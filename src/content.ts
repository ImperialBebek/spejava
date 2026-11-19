const legacyOrigin = 'https://spejava.com'
export const legacyUrl = (path: string) => `${legacyOrigin}${path}`

export const navigation = [
  { label: 'Events', path: '/events', children: [{ label: 'Annual Energy Symposium', url: 'https://spejava.com/articles/aes' }] },
  { label: 'Blog', path: '/blog' },
  { label: 'Students', path: '/student-chapter', children: [{ label: 'Students Chapter', url: 'https://spejava.com/student-chapter' }, { label: 'Scholarship', url: 'https://spejava.com/articles/scholarship-program-2025' }] },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export const sponsors = [
  { name: 'Pertamina Hulu Energi', image: 'pertamina.png' },
  { name: 'NESR', image: 'nesr.png' },
  { name: 'Baker Hughes', image: 'baker-hughes.png' },
  { name: 'SKK Migas', image: 'skk-migas.png' },
  { name: 'IOG', image: 'iog.png' },
  { name: 'ExxonMobil', image: 'exxonmobil.png' },
  { name: 'bp', image: 'bp.png' },
]

export const articles = [
  {
    title: 'Kemitraan Jadi Kunci, IPA Siap Dukung Agenda Percepatan Peningkatan Produksi Migas Pemerintah',
    slug: 'kemitraan-jadi-kunci-ipa-siap-dukung-agenda-percepatan-peningkatan-produksi-migas-pemerintah',
    image: 'ipa.webp',
    alt: 'Energy industry representatives at a gas commercial agreement signing ceremony',
  },
  {
    title: 'SPE ITB SC Marks 37 Years of Excellence with a Special Edition Magazine and a Year of Record Achievements',
    slug: 'spe-itb-sc-marks-37-years-of-excellence-with-a-special-edition-magazine-and-a-year-of-record-achievements',
    image: 'itb.webp',
    alt: 'SPE Bandung Institute of Technology student chapter members celebrating together',
  },
  {
    title: 'Multiplier Effect Industri Hulu Migas, Dukung Perekonomian Daerah',
    slug: 'multiplier-effect-industri-hulu-migas-dukung-perekonomian-daerah',
    image: 'migas.webp',
    alt: 'Oil and gas professionals attending an industry meeting',
  },
  {
    title: 'Celebrating Student Excellence: SPE Java Chapters Shine at the Asia Pacific Student Paper Contest 2025',
    slug: 'celebrating-student-excellence-spe-java-chapters-shine-at-the-asia-pacific-student-paper-contest-2025',
    image: 'students.webp',
    alt: 'SPE student paper contest participants and award winners on stage',
  },
]

export const events = [
  {
    title: 'SPE WORKSHOP: HPHT and Deepwater Wells: Drilling Challenges, Technologies and Applications',
    image: 'workshop.webp',
    alt: 'SPE Workshop: HPHT and Deepwater Wells, 23–24 June 2026, Jakarta',
    path: '/events',
    date: 'Jun 23, 2026',
    dateTime: '2026-06-23T09:00:00+07:00',
    time: '09:00 AM',
    location: 'Sheraton Grand Gandaria Jakarta City Hotel, Jakarta, Indonesia',
  },
  {
    ...articles[0],
    path: `/articles/${articles[0].slug}`,
    date: 'Jun 3, 2026',
    dateTime: '2026-06-03T10:45:00+07:00',
    time: '10:45 AM',
    location: 'ICE BSD, Tangerang, Indonesia',
  },
  {
    ...articles[1],
    path: `/articles/${articles[1].slug}`,
    date: 'May 12, 2026',
    dateTime: '2026-05-12T19:05:00+07:00',
    time: '07:05 PM',
    location: '',
  },
]
