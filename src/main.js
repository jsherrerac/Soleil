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
import './styles/cursor.css'
import './styles/espacio.css'
import './styles/linterna.css'
import './styles/barra.css'
import './styles/manifiesto.css'
import './styles/dia.css'
import './styles/reserva.css'
import './styles/noche.css'
import { initSol } from './sections/sol.js'
import { initHero } from './sections/hero.js'
import { initPreloader } from './sections/preloader.js'
import { initArrastre } from './sections/arrastre.js'
import { initCursor } from './sections/cursor.js'
import { initEspacio } from './sections/espacio.js'
import { initManifiesto } from './sections/manifiesto.js'
import { initDia } from './sections/dia.js'
import { initReserva } from './sections/reserva.js'
import { initNoche } from './sections/noche.js'
import { initBarra } from './sections/barra.js'
import { initHoras } from './sections/horas.js'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin)

// ScrollTrigger, al arrancar, anota cómo restaura el navegador el scroll al recargar
// y lo vuelve a poner en cada refresh. Le decimos 'manual': dónde arranca la página
// lo decidimos nosotros (ver preloader.js).
ScrollTrigger.clearScrollMemory('manual')

// --- Scroll suave ---
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// --- Secciones (en el orden en que aparecen en la página) ---
const sol = initSol()
const hero = initHero()
initArrastre(sol, hero.letras)
initManifiesto()
initDia()
initEspacio()
initReserva()
initNoche()

// --- Lo que recorre toda la página: la barra con su reloj y las horas del día ---
// (van después de las secciones: horas.js necesita los pins de El espacio ya creados)
const barra = initBarra(lenis)
const horas = initHoras(sol, barra)
initCursor(sol)
initPreloader(lenis, hero.entrada, sol, horas)
