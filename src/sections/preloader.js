import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Preloader: la noche antes de abrir Soleil.
// La espiral se dibuja al ritmo de la carga, salen los rayos y amanece.
export function initPreloader(lenis, entradaHero) {
  const pre = document.querySelector('.preloader')
  const numero = pre.querySelector('.preloader__numero')
  const hora = pre.querySelector('.preloader__texto--hora')
  const solPre = pre.querySelector('.preloader__sol')
  const espiral = solPre.querySelector('.sol__espiral')
  const rayos = solPre.querySelectorAll('.sol__rayos line')
  const amanecer = pre.querySelector('.preloader__amanecer')
  const textos = pre.querySelectorAll('.preloader__texto')

  // 1. Siempre arranca arriba y sin poder hacer scroll
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  lenis.stop()

  // 2. Hora real de Bogotá en la esquina
  const formato = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota'
  })
  hora.textContent = 'Bogotá · ' + formato.format(new Date())

  // 3. Estado inicial: nada dibujado
  gsap.set([espiral, rayos], { drawSVG: '0%' })
  gsap.set(solPre, { transformOrigin: '50% 50%' })

  // 4. La página está lista cuando cargó todo Y las fuentes
  const paginaCargada = new Promise(function (resolver) {
    if (document.readyState === 'complete') resolver()
    else window.addEventListener('load', resolver, { once: true })
  })
  const listo = Promise.all([paginaCargada, document.fonts.ready])

  // 5. Un solo número de 0 a 100 mueve el contador y la espiral a la vez
  const carga = { p: 0 }
  function pintarCarga() {
    numero.textContent = String(Math.round(carga.p)).padStart(3, '0')
    gsap.set(espiral, { drawSVG: '0% ' + carga.p + '%' })  // del centro hacia afuera
  }

  // Si el sistema pide menos movimiento, todo corre 6 veces más rápido
  const pocoMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const rapidez = pocoMovimiento ? 6 : 1

  // 6. Entrada: aparecen los textos y la carga avanza hasta 85 (no a 100: falta que la página confirme)
  const entrada = gsap.timeline()
  entrada
    .from(textos, { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.08, ease: 'power3.out' })
    .to(carga, { p: 85, duration: 1.6, ease: 'power2.inOut', onUpdate: pintarCarga }, 0.2)
  entrada.timeScale(rapidez)

  const entradaTerminada = new Promise(function (resolver) {
    entrada.eventCallback('onComplete', resolver)
  })

  // La salida espera las dos cosas: la animación mínima y la carga real
  Promise.all([listo, entradaTerminada]).then(salir)

  // 7. Salida: 85 → 100, salen los rayos, el sol respira y amanece
  function salir() {
    const tl = gsap.timeline({ onComplete: terminar })
    tl.to(carga, { p: 100, duration: 0.6, ease: 'power2.out', onUpdate: pintarCarga })
      .to(rayos, { drawSVG: '100%', duration: 0.45, stagger: 0.05, ease: 'power2.out' }, '-=0.15')
      .to(solPre, { scale: 1.12, duration: 0.3, ease: 'power2.out' })
      .to(solPre, { scale: 1, duration: 0.4, ease: 'power2.inOut' })
      .to(textos, { autoAlpha: 0, y: -16, duration: 0.5, stagger: 0.04, ease: 'power2.in' }, '<')
      .fromTo(amanecer,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(75% at 50% 50%)', duration: 1.4, ease: 'expo.inOut' })
      .to(solPre, { scale: 0.4, rotation: 120, autoAlpha: 0, duration: 1.1, ease: 'expo.inOut' }, '<0.2')
    tl.timeScale(rapidez)
  }

  // 8. Se quita el preloader (marfil sobre marfil: no se nota) y arranca el hero
  function terminar() {
    pre.style.display = 'none'
    lenis.start()
    ScrollTrigger.refresh()   // recalcula posiciones ya con las fuentes cargadas
    entradaHero.play()
    gsap.to('.cielo .sol', { autoAlpha: 1, duration: 1.2, ease: 'power2.out', delay: 0.3 })
  }
}
