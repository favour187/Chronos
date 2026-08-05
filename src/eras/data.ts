// Central data for all 12 eras in CHRONOS

export interface EraFact {
  label: string
  detail: string
}

export interface EraDef {
  id: string
  index: number
  name: string
  subtitle: string
  year: string
  tagline: string
  accent: string
  secondary: string
  sky: string
  fog: string
  ground: string
  artifact: {
    name: string
    emoji: string
    glow: string
  }
  narration: string
  facts: EraFact[]
}

export const ERAS: EraDef[] = [
  {
    id: 'birth-of-earth',
    index: 0,
    name: 'Birth of Earth',
    subtitle: 'The Primordial Cauldron',
    year: '4.5 Billion Years Ago',
    tagline: 'From stardust, a world is forged in fire.',
    accent: '#ff5a1f',
    secondary: '#ffb347',
    sky: '#1a0500',
    fog: '#3a0800',
    ground: '#2a0f00',
    artifact: { name: 'Proto-Mineral Shard', emoji: '🔥', glow: '#ff6a00' },
    narration:
      "4.5 billion years ago, a cloud of cosmic dust collapsed into a molten sphere. Volcanoes drowned the surface, lightning split the toxic sky, and asteroids delivered the water that would one day bear life.",
    facts: [
      { label: 'Formation', detail: 'Earth accreted from debris around the young Sun.' },
      { label: 'The Moon', detail: 'Formed by a giant impact with a Mars-sized body named Theia.' },
      { label: 'Water', detail: 'Delivered by asteroids and comets during the Late Heavy Bombardment.' },
      { label: 'Magnetism', detail: 'The iron core formed, generating Earth\u2019s protective magnetic field.' },
    ],
  },
  {
    id: 'dinosaur-age',
    index: 1,
    name: 'Dinosaur Age',
    subtitle: 'The Mesozoic Realm',
    year: '66 Million Years Ago',
    tagline: 'Giants walk a world of fern and fire.',
    accent: '#5fd14a',
    secondary: '#8fe07a',
    sky: '#0d2a18',
    fog: '#143d22',
    ground: '#163a1b',
    artifact: { name: 'Fossilized Tooth', emoji: '🦖', glow: '#66ff55' },
    narration:
      "For 165 million years, dinosaurs ruled every continent. Feathers and footprints, thundering herds and ocean giants\u2026 until a six-mile-wide asteroid ended their reign in a single day.",
    facts: [
      { label: 'Reign', detail: 'Non-avian dinosaurs ruled for ~165 million years.' },
      { label: 'Descendants', detail: 'Birds are theropod dinosaurs that survived the extinction.' },
      { label: 'Flowers', detail: 'The first flowering plants bloomed in the Cretaceous.' },
      { label: 'Extinction', detail: 'The Chicxulub impact triggered a global impact winter.' },
    ],
  },
  {
    id: 'early-humans',
    index: 2,
    name: 'Early Humans',
    subtitle: 'The First Fire',
    year: '200,000 Years Ago',
    tagline: 'A spark in the dark becomes a story.',
    accent: '#ffb066',
    secondary: '#ffd4a3',
    sky: '#0f0a1a',
    fog: '#2a1a0f',
    ground: '#1a1108',
    artifact: { name: 'Carved Hand-Axe', emoji: '🪨', glow: '#ffb066' },
    narration:
      "In the cold of an ancient night, our ancestors tamed fire. With flame came warmth, community, language, and art\u2014paintings on cave walls that still speak across 40,000 years.",
    facts: [
      { label: 'Control of Fire', detail: 'Hearth sites date back at least 1 million years.' },
      { label: 'Language', detail: 'Symbolic speech unlocked complex cooperation.' },
      { label: 'Tools', detail: 'Stone tools evolved into art, ritual, and technology.' },
      { label: 'Cave Art', detail: 'Paintings in Indonesia and France are over 40,000 years old.' },
    ],
  },
  {
    id: 'ancient-egypt',
    index: 3,
    name: 'Ancient Egypt',
    subtitle: 'Land of the Pharaohs',
    year: '3000 BCE',
    tagline: 'Monuments carved from eternity.',
    accent: '#ffd54a',
    secondary: '#ffe892',
    sky: '#201505',
    fog: '#3a2a0a',
    ground: '#2b1e08',
    artifact: { name: 'Golden Ankh', emoji: '☥', glow: '#ffd700' },
    narration:
      "Along the Nile, a civilization of scribes and builders erected mountains of stone. The pyramids rose to touch the gods, and hieroglyphs recorded three thousand years of human ambition.",
    facts: [
      { label: 'Great Pyramid', detail: 'Stood as the tallest structure on Earth for 3,800 years.' },
      { label: 'Writing', detail: 'Hieroglyphs combined pictograms and phonetics.' },
      { label: 'Medicine', detail: 'Surgical papyri describe sutures, stitches, and diagnoses.' },
      { label: 'Nile', detail: 'Annual floods deposited the fertile silt of an empire.' },
    ],
  },
  {
    id: 'ancient-greece',
    index: 4,
    name: 'Ancient Greece',
    subtitle: 'Birth of Reason',
    year: '500 BCE',
    tagline: 'Questions asked here still echo today.',
    accent: '#7aa2ff',
    secondary: '#c7d5ff',
    sky: '#0a1330',
    fog: '#1a2450',
    ground: '#0f1833',
    artifact: { name: 'Philosopher\u2019s Scroll', emoji: '📜', glow: '#7aa2ff' },
    narration:
      'Beneath marble colonnades, Socrates asked "why?" Pythagoras heard numbers in music. Democracy was born in the agora, and for the first time, human reason tried to map the cosmos.',
    facts: [
      { label: 'Democracy', detail: 'Born in Athens in 508 BCE under Cleisthenes.' },
      { label: 'Philosophy', detail: 'Socrates, Plato, Aristotle laid the foundations of Western thought.' },
      { label: 'Olympics', detail: 'First held in Olympia in 776 BCE.' },
      { label: 'Geometry', detail: 'Euclid\u2019s Elements was used as a textbook for 2,000 years.' },
    ],
  },
  {
    id: 'roman-empire',
    index: 5,
    name: 'Roman Empire',
    subtitle: 'The Eternal City',
    year: '100 CE',
    tagline: 'All roads lead through history.',
    accent: '#d64545',
    secondary: '#ff8f8f',
    sky: '#200608',
    fog: '#3a0e12',
    ground: '#1a0708',
    artifact: { name: 'Imperial Coin', emoji: '🪙', glow: '#ff5a5a' },
    narration:
      'Rome ruled a quarter of humanity from Scotland to Syria. Aqueducts carried water across valleys, concrete hardened into domes, and a legal system still shapes half the world.',
    facts: [
      { label: 'Scale', detail: '~70 million subjects at its peak, ~21% of the world population.' },
      { label: 'Law', detail: 'Roman law is the foundation of modern civil-law systems.' },
      { label: 'Concrete', detail: 'Opus caementicium allowed domes like the Pantheon.' },
      { label: 'Colosseum', detail: 'Could hold 50,000 spectators with 80 entrances.' },
    ],
  },
  {
    id: 'medieval',
    index: 6,
    name: 'Medieval World',
    subtitle: 'Cloaks, Castles & Cathedrals',
    year: '1200 CE',
    tagline: 'Stone, faith, and the long climb upward.',
    accent: '#b8a47a',
    secondary: '#ead7b2',
    sky: '#0e0e18',
    fog: '#242029',
    ground: '#111016',
    artifact: { name: 'Iron Key', emoji: '🗝', glow: '#d4b888' },
    narration:
      'Castles crowned the hills of Europe. Knights rode under banners, blacksmiths rang anvils, and masons raised cathedrals whose spires seemed to lean against the sky itself.',
    facts: [
      { label: 'Chivalry', detail: 'A code blending martial honor, piety, and courtly love.' },
      { label: 'Universities', detail: 'Bologna, Oxford, Paris founded in the 11th\u201312th centuries.' },
      { label: 'Cathedrals', detail: 'Many took centuries to finish; some still stand.' },
      { label: 'Plague', detail: 'The Black Death killed roughly one third of Europe in 1347\u201351.' },
    ],
  },
  {
    id: 'renaissance',
    index: 7,
    name: 'Renaissance',
    subtitle: 'The Rebirth of Wonder',
    year: '1500 CE',
    tagline: 'Art and science rediscover each other.',
    accent: '#c97b4a',
    secondary: '#ffc28f',
    sky: '#1a0f08',
    fog: '#301f12',
    ground: '#1d120a',
    artifact: { name: 'Da Vinci Blueprint', emoji: '📐', glow: '#e6a366' },
    narration:
      'In Florence workshops, artists became scientists and scientists became artists. Leonardo sketched flying machines, Michelangelo released statues from marble, and Gutenberg\u2019s press unchained knowledge.',
    facts: [
      { label: 'Leonardo', detail: 'Dissected over 30 human bodies to perfect his anatomy.' },
      { label: 'Printing Press', detail: 'Gutenberg\u2019s movable type reshaped Europe by 1500.' },
      { label: 'Perspective', detail: 'Brunelleschi formalized linear perspective in 1415.' },
      { label: 'Patronage', detail: 'The Medici of Florence funded a century of genius.' },
    ],
  },
  {
    id: 'industrial',
    index: 8,
    name: 'Industrial Revolution',
    subtitle: 'The Age of Steam',
    year: '1850 CE',
    tagline: 'The machine wakes.',
    accent: '#8ea8b0',
    secondary: '#cfdde0',
    sky: '#10151a',
    fog: '#2a3338',
    ground: '#0c1215',
    artifact: { name: 'Steam Core', emoji: '⚙', glow: '#8ea8b0' },
    narration:
      'Steam pistons hammered, locomotives roared across iron rails, and factory chimneys painted the sky. The world moved from muscle to machine, from fields to cities, in a single century.',
    facts: [
      { label: 'Steam', detail: 'Watt\u2019s improved engine (1775) powered factories, trains, ships.' },
      { label: 'Railways', detail: 'Connected continents and standardized time itself.' },
      { label: 'Telegraph', detail: 'Messages crossed oceans in seconds, not months.' },
      { label: 'Cost', detail: 'Industrialization was fueled by child labor and colonial extraction.' },
    ],
  },
  {
    id: 'digital',
    index: 9,
    name: 'Digital Revolution',
    subtitle: 'The Information Age',
    year: '1990 CE',
    tagline: 'Bits and light connect the planet.',
    accent: '#5cffb0',
    secondary: '#b0ffdf',
    sky: '#04140e',
    fog: '#0e3628',
    ground: '#041a10',
    artifact: { name: 'Silicon Chip', emoji: '💾', glow: '#3effa0' },
    narration:
      'From vacuum tubes to transistors, from ARPANET to the World Wide Web, humanity built a second world of light and code. Information now travels between any two points on Earth in milliseconds.',
    facts: [
      { label: 'ARPANET', detail: 'The first packet-switched network (1969) was the internet\u2019s seed.' },
      { label: 'First Email', detail: 'Sent by Ray Tomlinson in 1971.' },
      { label: 'Web', detail: 'Tim Berners-Lee launched the World Wide Web in 1991 at CERN.' },
      { label: 'Scale', detail: 'Today, over 5 billion people are online.' },
    ],
  },
  {
    id: 'future',
    index: 10,
    name: 'Future Civilization',
    subtitle: 'Horizon 2100',
    year: '2100 CE',
    tagline: 'Tomorrow is a draft we write together.',
    accent: '#5ee5ff',
    secondary: '#b0f0ff',
    sky: '#02101a',
    fog: '#0e3446',
    ground: '#041820',
    artifact: { name: 'Fusion Cell', emoji: '🛰', glow: '#5ee5ff' },
    narration:
      'Floating platforms ride clean fusion power; AI collaborates with human creativity; a space elevator hums above the equator. This is the future that remains possible, if we choose it.',
    facts: [
      { label: 'Fusion', detail: 'Net-energy-gain fusion is now a physics reality.' },
      { label: 'Space Elevator', detail: 'A tensile ribbon from equator to geostationary orbit.' },
      { label: 'AI', detail: 'General reasoning assistants augment every field of work.' },
      { label: 'Multiplanetary', detail: 'Permanent bases may exist on Mars, the Moon, and in orbit.' },
    ],
  },
  {
    id: 'cosmic',
    index: 11,
    name: 'Beyond Time',
    subtitle: 'The Cosmic Horizon',
    year: 'Eternal',
    tagline: 'We are the universe observing itself.',
    accent: '#c470ff',
    secondary: '#e7b5ff',
    sky: '#060010',
    fog: '#1a0a33',
    ground: '#0a0020',
    artifact: { name: 'Time Core', emoji: '⏳', glow: '#c470ff' },
    narration:
      'Beyond every galaxy, beyond the last star, time itself bends. Black holes spin like cosmic clocks, supernovae forge the atoms of our bodies, and the story continues - written by anyone who dares look up.',
    facts: [
      { label: 'Age', detail: 'The observable universe is ~13.8 billion years old.' },
      { label: 'Galaxies', detail: '~200 billion galaxies in the observable universe.' },
      { label: 'Stardust', detail: 'Every heavy atom in our bodies was forged inside stars.' },
      { label: 'You', detail: 'You are a way for the cosmos to know itself.' },
    ],
  },
]

export const TOTAL_ERAS = ERAS.length
export const ARTIFACT_REQUIRED = TOTAL_ERAS
