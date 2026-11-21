import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { medirO } from './sol.js'

// Dónde guardamos qué tan abajo ibas. Una clave por página (para cuando existan /menu y /reservas).
const CLAVE_SCROLL = 'soleil:scroll:' + location.pathname

// ¿Dónde debe quedar la página cuando termine de cargar?
//  - Recargaste, o volviste con atrás/adelante → donde ibas.
//  - Visita nueva (un link, la URL escrita) → arriba del todo.
function calcularDestino() {
  const navegacion = performance.getEntriesByType('navigation')[0]
  const tipo = navegacion ? navegacion.type : 'navigate'
  const guardado = Number(sessionStorage.getItem(CLAVE_SCROLL)) || 0
  const volviste = tipo === 'reload' || tipo === 'back_forward'
  return volviste && guardado > 50 ? guardado : 0
}

// Preloader: la noche antes de abrir Soleil.
// La espiral se dibuja al ritmo de la carga, salen los rayos y amanece.
export function initPreloader(lenis, entradaHero, sol, horas) {
  const pre = document.querySelector('.preloader')
  const numero = pre.querySelector('.preloader__numero')
  const hora = pre.querySelector('.preloader__texto--hora')
  const solPre = pre.querySelector('.preloader__sol')
  // Los pinceles invisibles de las máscaras: al dibujarlos, van descubriendo el sol de Deiby
  const pincel = solPre.querySelector('.pincel--espiral')
  const pincelesRayos = solPre.querySelectorAll('.pincel--rayo')
  const amanecer = pre.querySelector('.preloader__amanecer')
  const textos = pre.querySelectorAll('.preloader__texto')

  // 1. Nadie hace scroll mientras carga
  lenis.stop()

  // 2. A dónde vamos a llegar. Y cada vez que te vas de la página (recargar también cuenta),
  //    anotamos dónde ibas. Si recargas en plena carga, se conserva lo que había.
  const destino = calcularDestino()
  const arriba = destino === 0
  let paginaVisible = false
  window.addEventListener('pagehide', function () {
    if (paginaVisible) sessionStorage.setItem(CLAVE_SCROLL, String(Math.round(window.scrollY)))
  })

  // 3. Hora real de Bogotá en la esquina
  const formato = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota'
  })
  hora.textContent = 'Bogotá · ' + formato.format(new Date())

  // 4. Estado inicial: nada dibujado
  gsap.set([pincel, pincelesRayos], { drawSVG: '0%' })
  gsap.set(solPre, { transformOrigin: '50% 50%' })

  // 5. La página está lista cuando cargó todo Y las fuentes
  const paginaCargada = new Promise(function (resolver) {
    if (document.readyState === 'complete') resolver()
    else window.addEventListener('load', resolver, { once: true })
  })
  const listo = Promise.all([paginaCargada, document.fonts.ready])

  // 6. Un solo número de 0 a 100 mueve el contador y la espiral a la vez
  const carga = { p: 0 }
  function pintarCarga() {
    numero.textContent = String(Math.round(carga.p)).padStart(3, '0')
    gsap.set(pincel, { drawSVG: '0% ' + carga.p + '%' })  // del centro hacia afuera, como un pincel
  }

  // Si el sistema pide menos movimiento, todo corre 6 veces más rápido
  const pocoMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const rapidez = pocoMovimiento ? 6 : 1

  // 7. Entrada: aparecen los textos y la carga avanza hasta 85 (no a 100: falta que la página confirme)
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

  // 8. Antes de abrir: dejar la página EXACTAMENTE donde debe quedar, todavía tapada
  function colocarPagina() {
    lenis.scrollTo(destino, { immediate: true, force: true })   // force: aunque Lenis esté detenido
    ScrollTrigger.refresh()
    // Las animaciones con scrub persiguen al scroll con 1 s de retraso (scrub: 1).
    // Eso era lo que se veía "desorganizado" al recargar: el sol corriendo hasta su puesto.
    // Aquí no queremos persecución: que todas salten de una vez a donde les toca.
    ScrollTrigger.getAll().forEach(function (st) {
      const persecucion = st.getTween()
      if (persecucion) persecucion.progress(1)
    })
    // El color de esa hora del día se pone de una vez (sin la cortina: nadie la vería)
    horas.sincronizar()
    // El amanecer se pinta del color que tiene la página en ese punto del día
    amanecer.style.background = getComputedStyle(document.body).backgroundColor
  }

  // 9. Salida: 85 → 100, salen los rayos, el sol respira y amanece
  function salir() {
    colocarPagina()

    const tl = gsap.timeline({ onComplete: terminar })
    tl.to(carga, { p: 100, duration: 0.6, ease: 'power2.out', onUpdate: pintarCarga })
      .to(pincelesRayos, { drawSVG: '100%', duration: 0.45, stagger: 0.05, ease: 'power2.out' }, '-=0.15')
      .to(solPre, { scale: 1.12, duration: 0.3, ease: 'power2.out' })
      .to(solPre, { scale: 1, duration: 0.4, ease: 'power2.inOut' })
      .to(textos, { autoAlpha: 0, y: -16, duration: 0.5, stagger: 0.04, ease: 'power2.in' }, '<')
      .fromTo(amanecer,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(75% at 50% 50%)', duration: 1.4, ease: 'expo.inOut' })

    if (arriba) {
      // Arriba del todo: el sol vuela a la O de SOLEIL y queda del tamaño exacto
      const o = medirO()
      const anchoPre = parseFloat(getComputedStyle(solPre).width)
      tl.to(solPre, {
        x: o.x - window.innerWidth / 2,      // está en el centro: lo movemos lo que le falta
        y: o.y - window.innerHeight / 2,
        scale: o.ancho / anchoPre,
        rotation: 360,                       // una vuelta completa: termina igual de orientado que el del cielo
        duration: 1.4,
        ease: 'expo.inOut'
      }, '<0.1')
    } else {
      // Más abajo (recargaste a mitad de página): la O no se ve, así que este sol se apaga
      tl.to(solPre, { scale: 0.4, rotation: 120, autoAlpha: 0, duration: 1.1, ease: 'expo.inOut' }, '<0.2')
    }
    tl.timeScale(rapidez)
  }

  // 10. Se quita el preloader y aparece el sol del cielo
  function terminar() {
    lenis.start()
    ScrollTrigger.refresh()       // recalcula posiciones ya con todo cargado
    sol.medir()                   // el sol del cielo, en su puesto exacto

    if (arriba) {
      gsap.set('.cielo .sol', { autoAlpha: 1 })   // aparece justo donde aterrizó el del preloader...
      pre.style.display = 'none'                  // ...y se quita el preloader en el mismo instante
      entradaHero.play()                          // las letras suben alrededor del sol
    } else {
      entradaHero.progress(1)                     // el hero queda armado, por si subes
      pre.style.display = 'none'
      gsap.to('.cielo .sol', { autoAlpha: 1, duration: 0.8, ease: 'power2.out' })
    }
    paginaVisible = true
  }
}
