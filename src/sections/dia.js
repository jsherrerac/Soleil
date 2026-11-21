import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Lo que servimos: cada momento del día se "prende" cuando pasa por el centro de la pantalla.
// El CSS hace el resto con la clase .activo (opacidad y el rebote del dibujo).
export function initDia() {
  gsap.utils.toArray('.momento').forEach(function (momento) {
    ScrollTrigger.create({
      trigger: momento,
      start: 'top 62%',
      end: 'bottom 38%',
      toggleClass: 'activo'
    })

    // La hora grande entra deslizándose desde la izquierda
    gsap.from(momento.querySelector('.momento__hora'), {
      xPercent: -30,
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: momento, start: 'top 95%', end: 'top 60%', scrub: true }
    })
  })
}
