import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './styles/variables.css'
import './styles/base.css'

gsap.registerPlugin(ScrollTrigger)

// --- Scroll suave ---
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// --- Prueba: el día avanza con el scroll ---
const css = getComputedStyle(document.documentElement)
const terracota = css.getPropertyValue('--terracota').trim()
const espresso = css.getPropertyValue('--espresso').trim()

gsap.timeline({
  scrollTrigger: {
    trigger: 'main',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true
  }
})
  .to('body', { backgroundColor: terracota })
  .to('body', { backgroundColor: espresso, color: '#F4EADC' })