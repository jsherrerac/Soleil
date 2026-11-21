import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

// Prepara la entrada del hero y la devuelve en pausa.
// El preloader la reproduce cuando termina de amanecer.
export function initHero() {
  const titulo = document.querySelector('.hero__titulo')
  const hora = document.querySelector('.hero__hora')

  // Parte el título en letras sueltas para animarlas una por una
  const split = SplitText.create(titulo, { type: 'chars' })

  const tl = gsap.timeline({ paused: true })
  tl.from(split.chars, {
    yPercent: 120,        // cada letra arranca escondida debajo de su línea
    rotation: 8,
    duration: 1.3,
    stagger: 0.03,
    ease: 'expo.out'
  })
    .from(hora, { autoAlpha: 0, y: 12, duration: 0.9, ease: 'power2.out' }, 0.4)

  return tl
}
