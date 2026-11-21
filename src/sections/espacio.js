import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// El espacio: mientras bajas, la sección se queda quieta (pin)
// y la pista de fotos se corre hacia la izquierda.
export function initEspacio() {
  const seccion = document.querySelector('.espacio')
  const pista = seccion.querySelector('.espacio__pista')
  const fotos = gsap.utils.toArray('.espacio__foto')
  const actual = seccion.querySelector('.espacio__actual')
  const fijo = seccion.querySelector('.espacio__fijo')

  // Cuánto tiene que viajar la pista: lo que mide de ancho menos lo que cabe en la pantalla
  function distancia() {
    return pista.scrollWidth - window.innerWidth
  }

  let recorrido = distancia()

  const viaje = gsap.to(pista, {
    x: function () { return -distancia() },
    ease: 'none',                        // lineal: cada píxel de scroll mueve lo mismo
    // El patrón de atrás se corre solo el 15 % de lo que se corren las fotos: eso da profundidad
    onUpdate: function () {
      fijo.style.setProperty('--patron-x', (-recorrido * 0.15 * this.progress()) + 'px')
    },
    scrollTrigger: {
      trigger: seccion,
      start: 'top top',
      end: function () { return '+=' + distancia() },   // el pin dura lo que dura el viaje
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,         // si cambia el tamaño de la ventana, recalcula la distancia
      refreshPriority: 1,                // se mide primero: el pin alarga la página y los demás deben saberlo
      onRefresh: function () { recorrido = distancia() }
    }
  })

  // --- La linterna: el mouse ilumina los dibujos del patrón (solo en computador) ---
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const luz = { x: 0, y: 0, radio: 0 }
    function pintarLuz() {
      fijo.style.setProperty('--luz-x', luz.x + 'px')
      fijo.style.setProperty('--luz-y', luz.y + 'px')
      fijo.style.setProperty('--luz-radio', luz.radio + 'px')
    }
    // La luz sigue al mouse con un poquito de retraso, como si pesara
    const irAX = gsap.quickTo(luz, 'x', { duration: 0.6, ease: 'power3.out', onUpdate: pintarLuz })
    const irAY = gsap.quickTo(luz, 'y', { duration: 0.6, ease: 'power3.out', onUpdate: pintarLuz })

    seccion.addEventListener('pointerenter', function (e) {
      const caja = fijo.getBoundingClientRect()
      gsap.set(luz, { x: e.clientX - caja.left, y: e.clientY - caja.top })
      gsap.to(luz, { radio: 230, duration: 0.7, ease: 'power2.out', overwrite: 'auto', onUpdate: pintarLuz })   // se prende
    })
    seccion.addEventListener('pointermove', function (e) {
      const caja = fijo.getBoundingClientRect()
      irAX(e.clientX - caja.left)
      irAY(e.clientY - caja.top)
    })
    seccion.addEventListener('pointerleave', function () {
      gsap.to(luz, { radio: 0, duration: 0.7, ease: 'power2.out', overwrite: 'auto', onUpdate: pintarLuz })    // se apaga
    })
  }

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
