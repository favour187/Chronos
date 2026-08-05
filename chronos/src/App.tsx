import { useState, useEffect, useRef } from 'react'

interface Era {
  id: string
  name: string
  subtitle: string
  year: string
  image: string
  description: string
  facts: string[]
  accentColor: string
}

const eras: Era[] = [
  {
    id: 'birth-of-earth',
    name: 'Birth of Earth',
    subtitle: 'The Primordial Cauldron',
    year: '4.5 Billion Years Ago',
    image: '/images/birth-of-earth.jpg',
    description: 'From cosmic dust to a molten world, Earth was born in fire. Volcanoes raged across the surface, oceans of magma churned, and lightning cracked through the toxic atmosphere.',
    facts: [
      'Earth formed from debris orbiting the young Sun',
      'The Moon was likely created by a giant impact',
      'Water arrived on asteroids and comets',
      'The core separated creating Earth\'s magnetic field'
    ],
    accentColor: '#ff4500'
  },
  {
    id: 'dinosaur-age',
    name: 'Dinosaur Age',
    subtitle: 'The Mesozoic Era',
    year: '66 Million Years Ago',
    image: '/images/dinosaur-age.jpg',
    description: 'Magnificent creatures ruled the Earth for over 160 million years. From tiny raptors to massive sauropods, dinosaurs dominated every ecosystem on the planet.',
    facts: [
      'Dinosaurs ruled Earth for 165 million years',
      'Birds evolved from small feathered dinosaurs',
      'The first flowers appeared during this era',
      'A meteor impact ended the age of giants'
    ],
    accentColor: '#228b22'
  },
  {
    id: 'early-humans',
    name: 'Early Humans',
    subtitle: 'The Dawn of Humanity',
    year: '200,000 Years Ago',
    image: '/images/early-humans.jpg',
    description: 'Against the cold night, our ancestors discovered fire. With this single breakthrough, humanity began its incredible journey from cave dwellers to cosmic explorers.',
    facts: [
      'Fire extended productive hours and scared predators',
      'Language evolved enabling complex cooperation',
      'Tools transformed from survival to art',
      'Cave paintings preserved stories for millennia'
    ],
    accentColor: '#cd853f'
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    subtitle: 'Civilization\'s Dawn',
    year: '3000 BCE',
    image: '/images/ancient-egypt.jpg',
    description: 'Giant pyramids rose from the desert, built by a civilization of extraordinary ingenuity. The Nile\'s annual floods created the breadbasket of the ancient world.',
    facts: [
      'The Great Pyramid stood tallest for 3,800 years',
      'Egyptians pioneered medicine, mathematics, and writing',
      'The Sphinx has a secret chamber never opened',
      'Hieroglyphics recorded 3,000 years of history'
    ],
    accentColor: '#ffd700'
  },
  {
    id: 'ancient-greece',
    name: 'Ancient Greece',
    subtitle: 'The Birth of Reason',
    year: '500 BCE',
    image: '/images/ancient-greece.jpg',
    description: 'Philosophy, democracy, and art flourished in the city-states of Greece. Great minds asked questions that would shape human thinking for millennia.',
    facts: [
      'Democracy was born in Athens',
      'Greek philosophers asked fundamental questions',
      'The Olympics began in 776 BCE',
      'Greek architecture influenced the world forever'
    ],
    accentColor: '#4169e1'
  },
  {
    id: 'roman-empire',
    name: 'Roman Empire',
    subtitle: 'The Eternal City',
    year: '100 CE',
    image: '/images/roman-empire.jpg',
    description: 'The greatest empire the world had known stretched from Britain to Persia. Roman engineering created roads, aqueducts, and buildings that still stand today.',
    facts: [
      'Rome ruled 70 million people at its peak',
      'Roman law forms the basis of modern legal systems',
      'Concrete allowed unprecedented construction',
      'The Colosseum held 50,000 spectators'
    ],
    accentColor: '#8b0000'
  },
  {
    id: 'medieval',
    name: 'Medieval World',
    subtitle: 'Age of Knights',
    year: '1200 CE',
    image: '/images/medieval.jpg',
    description: 'Castles rose on hillsides and knights served their lords. An era of feudalism, crusades, and great cathedrals that would define Europe for centuries.',
    facts: [
      'Knights followed a strict code of chivalry',
      'Cathedrals took centuries to complete',
      'Universities were founded during this era',
      'Black Death killed one-third of Europe'
    ],
    accentColor: '#708090'
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    subtitle: 'Rebirth of Wonder',
    year: '1500 CE',
    image: '/images/renaissance.jpg',
    description: 'Art and science exploded in a flowering of human creativity. Masters like da Vinci bridged art and science, proving they are two sides of the same coin.',
    facts: [
      'Leonardo da Vinci dissected 30 human bodies',
      'Gutenberg\'s printing press spread knowledge',
      'The Mona Lisa took 4 years to paint',
      'Florence became the cradle of Renaissance art'
    ],
    accentColor: '#8b4513'
  },
  {
    id: 'industrial',
    name: 'Industrial Revolution',
    subtitle: 'Age of Machines',
    year: '1850 CE',
    image: '/images/industrial.jpg',
    description: 'Steam transformed society as factories replaced workshops. Railways connected continents, and for the first time, more people lived in cities than countryside.',
    facts: [
      'Steam engines powered the first locomotives',
      'Factory towns grew around machinery',
      'The telegraph connected continents instantly',
      'Child labor drove industrial profits'
    ],
    accentColor: '#2f4f4f'
  },
  {
    id: 'digital',
    name: 'Digital Revolution',
    subtitle: 'The Information Age',
    year: '1990 CE',
    image: '/images/digital.jpg',
    description: 'The world connected like never before. Information flowed at the speed of light, and the digital frontier exploded with possibilities that changed everything.',
    facts: [
      'The internet started as a military network',
      'The first email was sent in 1971',
      'Google processes 8.5 billion searches daily',
      'More data created in last 2 years than history'
    ],
    accentColor: '#00ff7f'
  },
  {
    id: 'future',
    name: 'Future Civilization',
    subtitle: 'Tomorrow\'s World',
    year: '2100 CE',
    image: '/images/future.jpg',
    description: 'Clean energy powers floating cities above the clouds. AI companions assist daily life, and humanity reaches for the stars with space elevators and colony ships.',
    facts: [
      'Fusion reactors may provide unlimited clean energy',
      'Space elevators could make orbit accessible to all',
      'AI may achieve human-level intelligence',
      'Humanity may become a multi-planetary species'
    ],
    accentColor: '#00ffff'
  },
  {
    id: 'cosmic',
    name: 'Beyond Time',
    subtitle: 'The Cosmic Frontier',
    year: 'Eternal',
    image: '/images/cosmic.jpg',
    description: 'Beyond history, beyond Earth. The universe reveals its deepest secrets - galaxies spinning, black holes bending spacetime, and time itself flowing in mysterious ways.',
    facts: [
      'The universe is 13.8 billion years old',
      'There are 200 billion galaxies in the observable universe',
      'Black holes slow time to a crawl',
      'We are made of star dust from ancient supernovae'
    ],
    accentColor: '#9400d3'
  }
]

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [collectedCount, setCollectedCount] = useState(0)
  const [visibleEras, setVisibleEras] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)

      // Check which eras are visible
      eras.forEach(era => {
        const element = document.getElementById(era.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.8) {
            setVisibleEras(prev => new Set([...prev, era.id]))
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTimeline = () => {
    document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div ref={containerRef}>
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Artifact Counter */}
      <div className="artifact-counter">
        <svg className="artifact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span>{collectedCount} / {eras.length} ERAS EXPLORED</span>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-bg">
          <img src="/images/hero.jpg" alt="Time Portal" />
        </div>
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <h1 className="hero-title">CHRONOS</h1>
          <p className="hero-subtitle">The Living Timeline</p>
          <p className="hero-tagline">
            "An immersive journey through 13.8 billion years of cosmic history,
            <br />from the birth of Earth to the edge of time itself."
          </p>
          <button className="finale-cta" onClick={scrollToTimeline}>
            BEGIN THE JOURNEY
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </header>

      {/* Timeline */}
      <main id="timeline" className="timeline-container">
        <div className="timeline-line" />
        
        <div className="era-gallery">
          {eras.map((era, index) => (
            <article
              key={era.id}
              id={era.id}
              className={`era-card scroll-reveal ${visibleEras.has(era.id) ? 'visible' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                ['--accent' as string]: era.accentColor 
              }}
            >
              <div className="era-image-wrapper">
                <img 
                  src={era.image} 
                  alt={era.name}
                  className="era-image"
                  loading="lazy"
                />
                <div className="era-image-overlay" />
              </div>

              <div className="era-content">
                <span className="era-year">{era.year}</span>
                <h2 className="era-title">{era.name}</h2>
                <p className="era-subtitle">{era.subtitle}</p>
                <div 
                  className="era-accent-line" 
                  style={{ background: `linear-gradient(90deg, ${era.accentColor}, var(--accent-cyan))` }}
                />
                <p className="era-description">{era.description}</p>
                
                <div className="era-facts">
                  {era.facts.map((fact, i) => (
                    <div key={i} className="era-fact">
                      <svg className="era-fact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                      <p className="era-fact-text">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Finale */}
      <section className="finale">
        <div className="finale-bg">
          <img src="/images/earth-solar.jpg" alt="Earth from Space" />
        </div>
        
        <div className="finale-content">
          <p className="finale-quote">
            "The future is built by those who learn from the past."
          </p>
          
          <button className="finale-cta" onClick={scrollToTop}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            JOURNEY COMPLETE
          </button>
        </div>
      </section>

      {/* Credits */}
      <footer className="credits">
        <h2 className="credits-title">CHRONOS</h2>
        <p className="credits-subtitle">An Interactive Journey Through Time</p>
        
        <div className="credits-tech">
          <span>React</span>
          <span>Three.js</span>
          <span>Framer Motion</span>
          <span>AI-Generated Images</span>
        </div>
      </footer>
    </div>
  )
}

export default App
