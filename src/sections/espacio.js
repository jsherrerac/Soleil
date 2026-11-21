import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// El espacio: mientras bajas, la sección se queda quieta (pin)
// y la pista de fotos se corre hacia la izquierda.
export function initEspacio() {
  const seccion = document.querySelector('.espacio')
  const pista = seccion.querySelector('.espacio__pista')
  const fotos = gsap.utils.toArray('.espacio__foto')
  const actual = seccion.querySelector('.espacio__actual')

  // Cuánto tiene que viajar la pista: lo que mide de ancho menos lo que cabe en la pantalla
  function distancia() {
    return pista.scrollWidth - window.innerWidth
  }

  const viaje = gsap.to(pista, {
    x: function () { return -distancia() },
    ease: 'none',                        // lineal: cada píxel de scroll mueve lo mismo
    scrollTrigger: {
      trigger: seccion,
      start: 'top top',
      end: function () { return '+=' + distancia() },   // el pin dura lo que dura el viaje
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,         // si cambia el tamaño de la ventana, recalcula la distancia
      refreshPriority: 1                 // se mide primero: el pin alarga la página y los demás deben saberlo
    }
  })

  fotos.forEach(function (foto, i) {
    const marco = foto.querySelector('.espacio__marco')
    const img = foto.querySelector('img')

    // containerAnimation: estos triggers no miran el scroll de la página,
    // miran cuánto ha avanzado la pista horizontal ("left 95%" = el borde izquierdo de la foto
    // llega al 95 % del ancho de la pantalla)

    // 1. La foto se descubre al entrar
    gsap.fromTo(marco, { clipPath: 'inset(0% 0% 0% 100%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: foto, containerAnimation: viaje, start: 'left 95%', end: 'left 45%', scrub: true }
    })

    // 2. Profundidad: la imagen se corre más lento que su marco
    gsap.fromTo(img, { xPercent: -13 }, {
      xPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: foto, containerAnimation: viaje, start: 'left right', end: 'right left', scrub: true }
    })

    // 3. El contador 01 / 04 cambia cuando la foto pasa por el centro
    ScrollTrigger.create({
      trigger: foto,
      containerAnimation: viaje,
      start: 'left center',
      end: 'right center',
      onToggle: function (self) {
        if (self.isActive) actual.textContent = String(i + 1).padStart(2, '0')
      }
    })
  })
}
