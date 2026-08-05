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
  /** AI-generated backdrop image path (skybox) */
  image: string
  artifact: { name: string; emoji: string; glow: string }
  narration: string
  facts: EraFact[]
}

export const ERAS: EraDef[] = [
  {
    id: 'birth-of-earth', index: 0,
    name: 'Birth of Earth', subtitle: 'The Primordial Cauldron', year: '4.5 Billion Years Ago',
    tagline: 'From stardust, a world is forged in fire.',
    accent: '#ff6a2a', secondary: '#ffb347', sky: '#1a0500', fog: '#3a0800', ground: '#2a0f00',
    image: '/images/era-birth-of-earth.jpg',
    artifact: { name: 'Proto-Mineral Shard', emoji: '🔥', glow: '#ff6a00' },
    narration: "4.5 billion years ago, a cloud of cosmic dust collapsed into a molten sphere. Volcanoes drowned the surface, lightning split the toxic sky, and asteroids delivered the water that would one day bear life.",
    facts: [
      { label: 'Formation', detail: 'Earth accreted from debris around the young Sun.' },
      { label: 'The Moon', detail: 'Formed by a giant impact with a Mars-sized body named Theia.' },
      { label: 'Water', detail: 'Delivered by asteroids and comets during the Late Heavy Bombardment.' },
      { label: 'Magnetism', detail: "The iron core formed, generating Earth’s protective magnetic field." },
    ],
  },
  {
    id: 'dinosaur-age', index: 1,
    name: 'Dinosaur Age', subtitle: 'The Mesozoic Realm', year: '66 Million Years Ago',
    tagline: 'Giants walk a world of fern and fire.',
    accent: '#66d870', secondary: '#8fe07a', sky: '#0d2a18', fog: '#143d22', ground: '#163a1b',
    image: '/images/era-dinosaur-age.jpg',
    artifact: { name: 'Fossilized Tooth', emoji: '🦖', glow: '#66ff55' },
    narration: "For 165 million years, dinosaurs ruled every continent until a six-mile-wide asteroid ended their reign in a single day.",
    facts: [
      { label: 'Reign', detail: 'Non-avian dinosaurs ruled for ~165 million years.' },
      { label: 'Descendants', detail: 'Birds are theropod dinosaurs that survived the extinction.' },
      { label: 'Flowers', detail: 'The first flowering plants bloomed in the Cretaceous.' },
      { label: 'Extinction', detail: 'The Chicxulub impact triggered a global impact winter.' },
    ],
  },
  {
    id: 'early-humans', index: 2,
    name: 'Early Humans', subtitle: 'The First Fire', year: '200,000 Years Ago',
    tagline: 'A spark in the dark becomes a story.',
    accent: '#ffb066', secondary: '#ffd4a3', sky: '#0f0a1a', fog: '#2a1a0f', ground: '#1a1108',
    image: '/images/era-early-humans.jpg',
    artifact: { name: 'Carved Hand-Axe', emoji: '🪨', glow: '#ffb066' },
    narration: "With fire came warmth, community, language, and art — paintings on cave walls that still speak across 40,000 years.",
    facts: [
      { label: 'Control of Fire', detail: 'Hearth sites date back at least 1 million years.' },
      { label: 'Language', detail: 'Symbolic speech unlocked complex cooperation.' },
      { label: 'Tools', detail: 'Stone tools evolved into art, ritual, and technology.' },
      { label: 'Cave Art', detail: 'Paintings in Indonesia and France are over 40,000 years old.' },
    ],
  },
  {
    id: 'ancient-egypt', index: 3,
    name: 'Ancient Egypt', subtitle: "Land of the Pharaohs", year: '3000 BCE',
    tagline: 'Monuments carved from eternity.',
    accent: '#ffd54a', secondary: '#ffe892', sky: '#201505', fog: '#3a2a0a', ground: '#2b1e08',
    image: '/images/era-ancient-egypt.jpg',
    artifact: { name: 'Golden Ankh', emoji: '☥', glow: '#ffd700' },
    narration: "The pyramids rose to touch the gods, and hieroglyphs recorded three thousand years of human ambition.",
    facts: [
      { label: 'Great Pyramid', detail: 'Stood as the tallest structure on Earth for 3,800 years.' },
      { label: 'Writing', detail: 'Hieroglyphs combined pictograms and phonetics.' },
      { label: 'Medicine', detail: 'Surgical papyri describe sutures, stitches, and diagnoses.' },
      { label: 'Nile', detail: 'Annual floods deposited the fertile silt of an empire.' },
    ],
  },
  {
    id: 'ancient-greece', index: 4,
    name: 'Ancient Greece', subtitle: 'Birth of Reason', year: '500 BCE',
    tagline: 'Questions asked here still echo today.',
    accent: '#7aa2ff', secondary: '#c7d5ff', sky: '#0a1330', fog: '#1a2450', ground: '#0f1833',
    image: '/images/era-ancient-greece.jpg',
    artifact: { name: 'Philosopher’s Scroll', emoji: '📜', glow: '#7aa2ff' },
    narration: 'Beneath marble colonnades, Socrates asked "why?" Democracy was born in the agora, and human reason tried to map the cosmos.',
    facts: [
      { label: 'Democracy', detail: 'Born in Athens in 508 BCE under Cleisthenes.' },
      { label: 'Philosophy', detail: 'Socrates, Plato, Aristotle laid Western thought’s foundations.' },
      { label: 'Olympics', detail: 'First held in Olympia in 776 BCE.' },
      { label: 'Geometry', detail: 'Euclid’s Elements was used as a textbook for 2,000 years.' },
    ],
  },
  {
    id: 'roman-empire', index: 5,
    name: 'Roman Empire', subtitle: 'The Eternal City', year: '100 CE',
    tagline: 'All roads lead through history.',
    accent: '#d66060', secondary: '#ff8f8f', sky: '#200608', fog: '#3a0e12', ground: '#1a0708',
    image: '/images/era-roman-empire.jpg',
    artifact: { name: 'Imperial Coin', emoji: '🪙', glow: '#ff5a5a' },
    narration: 'Rome ruled a quarter of humanity. Aqueducts carried water across valleys, concrete hardened into domes, and law still shapes half the world.',
    facts: [
      { label: 'Scale', detail: '~70 million subjects at its peak, ~21% of world population.' },
      { label: 'Law', detail: 'Roman law is the foundation of modern civil-law systems.' },
      { label: 'Concrete', detail: 'Opus caementicium allowed domes like the Pantheon.' },
      { label: 'Colosseum', detail: 'Could hold 50,000 spectators with 80 entrances.' },
    ],
  },
  {
    id: 'medieval', index: 6,
    name: 'Medieval World', subtitle: 'Age of Knights', year: '1200 CE',
    tagline: 'Stone, faith, and the long climb upward.',
    accent: '#d4b888', secondary: '#ead7b2', sky: '#0e0e18', fog: '#242029', ground: '#111016',
    image: '/images/era-medieval.jpg',
    artifact: { name: 'Iron Key', emoji: '🗝', glow: '#d4b888' },
    narration: 'Castles crowned the hills. Knights rode under banners, and masons raised cathedrals whose spires leaned against the sky.',
    facts: [
      { label: 'Chivalry', detail: 'A code blending martial honor, piety, and courtly love.' },
      { label: 'Universities', detail: 'Bologna, Oxford, Paris founded 11th–12th centuries.' },
      { label: 'Cathedrals', detail: 'Many took centuries to finish; some still stand.' },
      { label: 'Plague', detail: 'The Black Death killed ~1/3 of Europe in 1347–51.' },
    ],
  },
  {
    id: 'renaissance', index: 7,
    name: 'Renaissance', subtitle: 'Rebirth of Wonder', year: '1500 CE',
    tagline: 'Art and science rediscover each other.',
    accent: '#e6a366', secondary: '#ffc28f', sky: '#1a0f08', fog: '#301f12', ground: '#1d120a',
    image: '/images/era-renaissance.jpg',
    artifact: { name: 'Da Vinci Blueprint', emoji: '📐', glow: '#e6a366' },
    narration: 'Leonardo sketched flying machines, Michelangelo released statues from marble, and Gutenberg’s press unchained knowledge.',
    facts: [
      { label: 'Leonardo', detail: 'Dissected over 30 human bodies to perfect anatomy.' },
      { label: 'Printing Press', detail: 'Gutenberg’s movable type reshaped Europe by 1500.' },
      { label: 'Perspective', detail: 'Brunelleschi formalized linear perspective in 1415.' },
      { label: 'Patronage', detail: 'The Medici of Florence funded a century of genius.' },
    ],
  },
  {
    id: 'industrial', index: 8,
    name: 'Industrial Revolution', subtitle: 'The Age of Steam', year: '1850 CE',
    tagline: 'The machine wakes.',
    accent: '#b8c8cc', secondary: '#cfdde0', sky: '#10151a', fog: '#2a3338', ground: '#0c1215',
    image: '/images/era-industrial.jpg',
    artifact: { name: 'Steam Core', emoji: '⚙', glow: '#8ea8b0' },
    narration: 'Steam pistons hammered, locomotives roared across iron rails, and the world moved from muscle to machine in a single century.',
    facts: [
      { label: 'Steam', detail: 'Watt’s improved engine (1775) powered factories, trains, ships.' },
      { label: 'Railways', detail: 'Connected continents and standardized time itself.' },
      { label: 'Telegraph', detail: 'Messages crossed oceans in seconds, not months.' },
      { label: 'Cost', detail: 'Industrialization was fueled by child labor and colonial extraction.' },
    ],
  },
  {
    id: 'digital', index: 9,
    name: 'Digital Revolution', subtitle: 'The Information Age', year: '1990 CE',
    tagline: 'Bits and light connect the planet.',
    accent: '#3effa0', secondary: '#b0ffdf', sky: '#04140e', fog: '#0e3628', ground: '#041a10',
    image: '/images/digital.jpg',
    artifact: { name: 'Silicon Chip', emoji: '💾', glow: '#3effa0' },
    narration: 'Humanity built a second world of light and code. Information now travels between any two points on Earth in milliseconds.',
    facts: [
      { label: 'ARPANET', detail: 'The first packet-switched network (1969) was the internet’s seed.' },
      { label: 'First Email', detail: 'Sent by Ray Tomlinson in 1971.' },
      { label: 'Web', detail: 'Tim Berners-Lee launched the WWW in 1991 at CERN.' },
      { label: 'Scale', detail: 'Today, over 5 billion people are online.' },
    ],
  },
  {
    id: 'future', index: 10,
    name: 'Future Civilization', subtitle: 'Horizon 2100', year: '2100 CE',
    tagline: 'Tomorrow is a draft we write together.',
    accent: '#5ee5ff', secondary: '#b0f0ff', sky: '#02101a', fog: '#0e3446', ground: '#041820',
    image: '/images/future.jpg',
    artifact: { name: 'Fusion Cell', emoji: '🛰', glow: '#5ee5ff' },
    narration: 'Floating platforms ride clean fusion power; AI collaborates with human creativity; a space elevator hums above the equator.',
    facts: [
      { label: 'Fusion', detail: 'Net-energy-gain fusion is now a physics reality.' },
      { label: 'Space Elevator', detail: 'A tensile ribbon from equator to geostationary orbit.' },
      { label: 'AI', detail: 'General reasoning assistants augment every field of work.' },
      { label: 'Multiplanetary', detail: 'Permanent bases may exist on Mars, the Moon, and in orbit.' },
    ],
  },
  {
    id: 'cosmic', index: 11,
    name: 'Beyond Time', subtitle: 'The Cosmic Horizon', year: 'Eternal',
    tagline: 'We are the universe observing itself.',
    accent: '#c470ff', secondary: '#e7b5ff', sky: '#060010', fog: '#1a0a33', ground: '#0a0020',
    image: '/images/cosmic.jpg',
    artifact: { name: 'Time Core', emoji: '⏳', glow: '#c470ff' },
    narration: 'Black holes spin like cosmic clocks, supernovae forge the atoms of our bodies, and the story continues — written by anyone who dares look up.',
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
