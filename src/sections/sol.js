import gsap from 'gsap'

// Radio de la espiral dentro del SVG (el viewBox mide 100 de ancho; los rayos llegan al borde)
const RADIO_ESPIRAL = 28

// "#C86E4A" → "rgb(200, 110, 74)". Con dos colores en el mismo formato, GSAP los mezcla número por número
export function aRGB(color) {
  const c = gsap.utils.splitColor(color)
  return 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')'
}

// Mide dónde está el sol en el logo (con la página arriba del todo) y qué tan grande se ve.
// .hero__o es una caja invisible con el lugar y el tamaño exactos del sol en el archivo de Deiby.
export function medirO() {
  const caja = document.querySelector('.hero__o').getBoundingClientRect()
  return {
    x: caja.left + caja.width / 2,
    y: caja.top + window.scrollY + caja.height / 2,
    ancho: caja.width
  }
}

// El sol arranca dentro de la O de SOLEIL y desde ahí cruza el cielo con el scroll.
export function initSol() {
  const sol = document.querySelector('.cielo .sol')
  const espiral = sol.querySelector('.sol__espiral')
  const rayos = sol.querySelector('.sol__rayos')

  // Centro del SVG como punto de referencia (en vez de la esquina superior izquierda)
  gsap.set(sol, { xPercent: -50, yPercent: -50 })
  // La espiral y los rayos giran alrededor del punto (0,0) del SVG, que es su centro
  gsap.set([espiral, rayos], { svgOrigin: '0 0' })

  // Color del sol: lo decide la hora del día (horas.js llama a cambiarColor)
  const colorSol = { valor: aRGB(getComputedStyle(document.documentElement).getPropertyValue('--terracota').trim()) }

  function pintarColor() {
    sol.style.setProperty('--color-sol', colorSol.valor)
  }

  function cambiarColor(color, inmediato) {
    if (inmediato) {
      gsap.killTweensOf(colorSol)
      colorSol.valor = aRGB(color)
      pintarColor()
      return
    }
    gsap.to(colorSol, { valor: aRGB(color), duration: 0.9, ease: 'power2.inOut', overwrite: 'auto', onUpdate: pintarColor })
  }

  // p = avance del día (toda la página): 0 = amanecer, 1 = anochecer
  // h = avance del hero (la primera pantalla): 0 = sol en la O, 1 = sol ya en el cielo
  const estado = { p: 0, h: 0 }

  // Lo que la mano le hace al sol cuando lo arrastras (lo cambia arrastre.js):
  // x, y = cuánto lo has corrido de su puesto; escala = qué tanto lo "levantas"
  const desplazamiento = { x: 0, y: 0, escala: 1 }

  // Dónde quedó dibujado el sol la última vez (lo leen arrastre.js y horas.js)
  const actual = { x: 0, y: 0 }

  // Curva para "soltar" el sol de la O: arranca suave, acelera y vuelve a frenar
  const suavizar = gsap.parseEase('power2.inOut')

  // Medidas que NO cambian con el scroll: se toman al cargar y al cambiar el tamaño de la ventana
  let o = medirO()
  let anchoBase = parseFloat(getComputedStyle(sol).width)
  let alturaHero = document.querySelector('#hero').offsetHeight

  function medir() {
    o = medirO()
    anchoBase = parseFloat(getComputedStyle(sol).width)
    alturaHero = document.querySelector('#hero').offsetHeight
    dibujarSol()
  }

  function dibujarSol() {
    const p = estado.p
    const ancho = window.innerWidth
    const alto = window.innerHeight

    // 1. Dónde empieza y dónde termina el recorrido
    const inicio = { x: o.x, y: o.y }                  // dentro de la O de SOLEIL
    const fin = { x: ancho * 0.88, y: alto * 0.85 }   // el ocaso, abajo a la derecha

    // 2. Línea recta del inicio al fin...
    const x = gsap.utils.interpolate(inicio.x, fin.x, p)
    let y = gsap.utils.interpolate(inicio.y, fin.y, p)
    // ...más una "joroba": sin(π·p) vale 0 al inicio y al final, y 1 en la mitad
    y = y - alto * 0.5 * Math.sin(Math.PI * p)

    // 3. Mientras el hero se va, el sol tiene DOS lugares posibles:
    //    pegado a la O (que va subiendo con la página) o libre en su arco del cielo.
    //    Mezclamos de uno al otro según qué tanto se ha ido el hero.
    const pegado = { x: o.x, y: o.y - estado.h * alturaHero }
    const soltar = suavizar(estado.h)                  // 0 = pegado a la O, 1 = libre en el cielo
    const xFinal = gsap.utils.interpolate(pegado.x, x, soltar)
    const yFinal = gsap.utils.interpolate(pegado.y, y, soltar)

    // 4. Tamaño: grande dentro de la O, normal en el cielo (× lo que lo levante la mano)
    const escalaEnO = o.ancho / anchoBase
    const escala = gsap.utils.interpolate(escalaEnO, 1, soltar) * desplazamiento.escala

    // 5. Posición final: donde le toca + lo que lo hayas arrastrado
    actual.x = xFinal + desplazamiento.x
    actual.y = yFinal + desplazamiento.y

    // 6. Al arrastrarlo de lado, rueda como una llanta: ángulo = distancia ÷ radio
    //    (eso da radianes; × 180/π lo pasa a grados)
    const radioPx = anchoBase * escala * (RADIO_ESPIRAL / 100)
    const rodar = (desplazamiento.x / radioPx) * (180 / Math.PI)

    gsap.set(sol, { x: actual.x, y: actual.y, scale: escala })
    gsap.set(espiral, { rotation: p * 720 + rodar })   // dos vueltas en todo el día
    gsap.set(rayos, { rotation: -p * 180 + rodar })     // al revés y más lento
  }

  // El día: p va de 0 a 1 a lo largo de TODA la página
  gsap.to(estado, {
    p: 1,
    ease: 'none',
    onUpdate: dibujarSol,
    scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1 }
  })

  // La salida de la O: h va de 0 a 1 mientras el hero se va por arriba
  gsap.to(estado, {
    h: 1,
    ease: 'none',
    onUpdate: dibujarSol,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
  })

  pintarColor()
  medir()
  document.fonts.ready.then(medir)            // vuelve a medir cuando Cinzel ya cargó
  window.addEventListener('resize', medir)

  // Lo que otros archivos pueden pedirle o hacerle al sol
  return {
    medir: medir,
    dibujar: dibujarSol,
    desplazamiento: desplazamiento,
    actual: actual,
    color: function () { return colorSol.valor },
    cambiarColor: cambiarColor,
    tamanoEnO: function () { return o.ancho },
    enElHero: function () { return estado.h < 0.02 }   // ¿está la página arriba del todo?
  }
}
