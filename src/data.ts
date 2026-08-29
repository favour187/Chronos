
export interface Era {
  id: string
  name: string
  subtitle: string
  year: string
  tagline: string
  accent: string
  image: string
  quote: string
}

export const ERAS: Era[] = [
  {
    id: 'birth-of-earth', name: 'Birth of Earth', subtitle: 'THE PRIMORDIAL CAULDRON',
    year: '4.5 BILLION YEARS AGO', tagline: 'From stardust, a world is forged in fire.',
    accent: '#ff5a1f', image: '/images/era-birth-of-earth.jpg',
    quote: 'Fire made rock, rock made oceans, oceans made us.',
  },
  {
    id: 'dinosaur-age', name: 'Dinosaur Age', subtitle: 'THE MESOZOIC REALM',
    year: '66 MILLION YEARS AGO', tagline: 'Giants walked a world of fern and fire.',
    accent: '#66d870', image: '/images/era-dinosaur-age.jpg',
    quote: 'For 165 million years, this was their planet.',
  },
  {
    id: 'early-humans', name: 'Early Humans', subtitle: 'THE FIRST FIRE',
    year: '200,000 YEARS AGO', tagline: 'A spark in the dark becomes a story.',
    accent: '#ffb066', image: '/images/era-early-humans.jpg',
    quote: 'Flame extended the day, and language extended the mind.',
  },
  {
    id: 'ancient-egypt', name: 'Ancient Egypt', subtitle: 'LAND OF THE PHARAOHS',
    year: '3000 BCE', tagline: 'Monuments carved from eternity.',
    accent: '#ffd54a', image: '/images/era-ancient-egypt.jpg',
    quote: 'They built mountains to outlast time itself.',
  },
  {
    id: 'ancient-greece', name: 'Ancient Greece', subtitle: 'BIRTH OF REASON',
    year: '500 BCE', tagline: 'Questions asked here still echo today.',
    accent: '#7aa2ff', image: '/images/era-ancient-greece.jpg',
    quote: 'They first asked why — and we are still answering.',
  },
  {
    id: 'roman-empire', name: 'Roman Empire', subtitle: 'THE ETERNAL CITY',
    year: '100 CE', tagline: 'All roads lead through history.',
    accent: '#d66060', image: '/images/era-roman-empire.jpg',
    quote: 'They engineered a world in stone and law.',
  },
  {
    id: 'medieval', name: 'Medieval World', subtitle: 'AGE OF KNIGHTS',
    year: '1200 CE', tagline: 'Stone, faith, and the long climb upward.',
    accent: '#d4b888', image: '/images/era-medieval.jpg',
    quote: 'Cathedrals took centuries, and still they built them.',
  },
  {
    id: 'renaissance', name: 'Renaissance', subtitle: 'REBIRTH OF WONDER',
    year: '1500 CE', tagline: 'Art and science rediscover each other.',
    accent: '#e6a366', image: '/images/era-renaissance.jpg',
    quote: 'They painted, they dissected, they flew — on paper.',
  },
  {
    id: 'industrial', name: 'Industrial Revolution', subtitle: 'THE AGE OF STEAM',
    year: '1850 CE', tagline: 'The machine wakes.',
    accent: '#b8c8cc', image: '/images/era-industrial.jpg',
    quote: 'Muscle gave way to metal. The world would never slow again.',
  },
  {
    id: 'digital', name: 'Digital Revolution', subtitle: 'THE INFORMATION AGE',
    year: '1990 CE', tagline: 'Bits and light connect the planet.',
    accent: '#3effa0', image: '/images/digital.jpg',
    quote: 'We wired the world together in a single lifetime.',
  },
  {
    id: 'future', name: 'Future Civilization', subtitle: 'HORIZON 2100',
    year: '2100 CE', tagline: 'Tomorrow is a draft we write together.',
    accent: '#5ee5ff', image: '/images/future.jpg',
    quote: 'The future arrives one choice at a time.',
  },
  {
    id: 'cosmic', name: 'Beyond Time', subtitle: 'THE COSMIC HORIZON',
    year: 'ETERNAL', tagline: 'We are the universe observing itself.',
    accent: '#c470ff', image: '/images/cosmic.jpg',
    quote: 'We are made of stars — and we are looking back at them.',
  },
]
