import gsap from 'gsap'

// El sol recorre un arco en el cielo según el avance de toda la página.
export function initSol() {
  const sol = document.querySelector('.sol')
  const espiral = sol.querySelector('.sol__espiral')
  const rayos = sol.querySelector('.sol__rayos')

  // Centro del SVG como punto de referencia (en vez de la esquina superior izquierda)
  gsap.set(sol, { xPercent: -50, yPercent: -50 })
  // La espiral y los rayos giran alrededor del punto (0,0) del SVG, que es su centro
  gsap.set([espiral, rayos], { svgOrigin: '0 0' })

  // Colores leídos del CSS para no repetirlos aquí
  const css = getComputedStyle(document.documentElement)
  const terracota = css.getPropertyValue('--terracota').trim()
  const marfil = css.getPropertyValue('--marfil').trim()
  // Función que mezcla los dos colores: mezclarColor(0) = terracota, mezclarColor(1) = marfil
  const mezclarColor = gsap.utils.interpolate(terracota, marfil)

  // p = qué tanto del día ha pasado: 0 = amanecer, 1 = anochecer
  const estado = { p: 0 }

  function dibujarSol() {
    const ancho = window.innerWidth
    const alto = window.innerHeight
    const margen = ancho * 0.12

    // x avanza en línea recta de izquierda a derecha
    const x = margen + estado.p * (ancho - 2 * margen)
    // y sube y baja como un arco: sin(π·p) vale 0 en los extremos y 1 en la mitad
    const y = alto * 0.85 - alto * 0.65 * Math.sin(Math.PI * estado.p)

    gsap.set(sol, { x: x, y: y })
    gsap.set(espiral, { rotation: estado.p * 720 })  // dos vueltas en todo el día
    gsap.set(rayos, { rotation: -estado.p * 180 })    // giran al revés, más lento

    // Terracota toda la mañana; en la tarde se aclara para resaltar sobre el cielo oscuro
    const tarde = Math.max(0, (estado.p - 0.5) * 2)   // 0 hasta el mediodía, luego sube hasta 1
    sol.style.setProperty('--color-sol', mezclarColor(tarde))
  }

  gsap.to(estado, {
    p: 1,
    ease: 'none',
    onUpdate: dibujarSol,
    scrollTrigger: {
      trigger: 'main',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1
    }
  })

  dibujarSol()
  window.addEventListener('resize', dibujarSol)
}
