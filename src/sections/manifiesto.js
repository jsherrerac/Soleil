import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

// Manifiesto: las palabras se van "encendiendo" una por una mientras bajas,
// y los dibujos flotan a otra velocidad que el texto (profundidad).
export function initManifiesto() {
  const seccion = document.querySelector('.manifiesto')
  const texto = seccion.querySelector('.manifiesto__texto')
  const dibujos = gsap.utils.toArray('.manifiesto__dibujo')

  const split = SplitText.create(texto, { type: 'words' })
  gsap.fromTo(split.words, { opacity: 0.12 }, {
    opacity: 1,
    ease: 'none',
    stagger: 0.1,             // con scrub, el stagger reparte las palabras a lo largo del scroll
    scrollTrigger: { trigger: texto, start: 'top 75%', end: 'bottom 40%', scrub: true }
  })

  dibujos.forEach(function (dibujo, i) {
    const sentido = i % 2 === 0 ? 1 : -1
    gsap.fromTo(dibujo,
      { yPercent: 60 * sentido, rotation: 14 * sentido },
      {
        yPercent: -60 * sentido,
        rotation: -10 * sentido,
        ease: 'none',
        scrollTrigger: { trigger: seccion, start: 'top bottom', end: 'bottom top', scrub: true }
      })
  })
}
