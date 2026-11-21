import gsap from 'gsap'
import { initLinterna } from './linterna.js'
import { zonaDe } from './horas.js'

// La barra: el reloj marca la hora del día según el scroll (horas.js lo actualiza)
// y, al tocarlo, abre el menú para navegar por horas.
export function initBarra(lenis) {
  const boton = document.querySelector('.barra__reloj')
  const hora = document.querySelector('.barra__hora')
  const marca = document.querySelector('.barra__marca')
  const menu = document.querySelector('.menu-horas')
  const enlaces = gsap.utils.toArray('.menu-horas__lista a')
  const raiz = document.documentElement
  let abierto = false
  let animacion = null

  initLinterna(menu)

  function abrir() {
    abierto = true
    menu.hidden = false
    raiz.classList.add('menu-abierto')
    boton.setAttribute('aria-expanded', 'true')
    lenis.stop()                                  // la página de atrás no se mueve
    if (animacion) animacion.kill()
    animacion = gsap.timeline()
      // El menú se abre en círculo desde el reloj (esquina de arriba a la derecha)
      .fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.9, ease: 'expo.inOut' })
      .fromTo(enlaces, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out' }, '-=0.45')
    enlaces[0].focus({ preventScroll: true })
  }

  function cerrar(despues) {
    abierto = false
    raiz.classList.remove('menu-abierto')
    boton.setAttribute('aria-expanded', 'false')
    if (animacion) animacion.kill()
    animacion = gsap.timeline({
      onComplete: function () {
        menu.hidden = true
        lenis.start()
        if (despues) despues()
      }
    })
      .to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.7, ease: 'expo.inOut' })
  }

  boton.addEventListener('click', function () {
    if (abierto) cerrar()
    else abrir()
  })

  // Escape cierra el menú y devuelve el foco al reloj
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && abierto) {
      cerrar()
      boton.focus()
    }
  })

  // Cada opción cierra el menú y viaja suave hasta su hora
  enlaces.forEach(function (enlace) {
    enlace.addEventListener('click', function (e) {
      e.preventDefault()
      // Si la sección tiene pin, se va a donde EMPIEZA el pin (el pin-spacer), no a donde quedó
      const destino = zonaDe(document.querySelector(enlace.getAttribute('href')))
      cerrar(function () {
        lenis.scrollTo(destino, { duration: 1.8 })
      })
    })
  })

  // La marca lleva al principio
  marca.addEventListener('click', function (e) {
    e.preventDefault()
    lenis.scrollTo(0, { duration: 1.8 })
  })

  return {
    marcarHora: function (texto) {
      if (hora.textContent !== texto) hora.textContent = texto
    }
  }
}
