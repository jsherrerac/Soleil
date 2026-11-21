import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './styles/variables.css'
import './styles/base.css'
import './styles/sol.css'
import './styles/preloader.css'
import './styles/hero.css'
import { initSol } from './sections/sol.js'
import { initHero } from './sections/hero.js'
import { initPreloader } from './sections/preloader.js'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin)

// --- Scroll suave ---
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// --- Prueba: el día avanza con el scroll ---
const css = getComputedStyle(document.documentElement)
const terracotaClaro = css.getPropertyValue('--terracota-claro').trim()
const espresso = css.getPropertyValue('--espresso').trim()

gsap.timeline({
  scrollTrigger: {
    trigger: 'main',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true
  }
})
  .to('body', { backgroundColor: terracotaClaro })
  .to('body', { backgroundColor: espresso, color: '#F4EADC' })

// --- Secciones ---
initSol()
const entradaHero = initHero()
initPreloader(lenis, entradaHero)
