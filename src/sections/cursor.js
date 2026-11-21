import gsap from 'gsap'

// Cursor propio: un punto que sigue al mouse con el color que tiene el sol a esa hora del día.
export function initCursor(sol) {
  // Solo en computadores con mouse: en celular y tablet no hay cursor que reemplazar
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const cursor = document.querySelector('.cursor')
  const punto = cursor.querySelector('.cursor__punto')
  const raiz = document.documentElement
  raiz.classList.add('cursor-propio')   // con esta clase el CSS esconde la flecha del sistema

  gsap.set(cursor, { xPercent: -50, yPercent: -50 })   // que el centro del punto quede en la punta del mouse

  // quickTo prepara UNA animación y la reutiliza: cada vez que la llamas con un número,
  // el punto sale hacia ahí desde donde esté. 0.15 s de retraso = se siente suave, no pegado.
  const irAX = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3.out' })
  const irAY = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3.out' })

  let visible = false
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return
    if (!visible) {
      // Primera vez (o volviendo a la ventana): aparece directo en el mouse, sin viajar desde la esquina
      gsap.set(cursor, { x: e.clientX, y: e.clientY })
      cursor.classList.add('cursor--visible')
      visible = true
    }
    irAX(e.clientX)
    irAY(e.clientY)
  })

  // Sobre enlaces y botones el punto crece (el CSS mira la clase sobre-enlace)
  document.addEventListener('pointerover', function (e) {
    raiz.classList.toggle('sobre-enlace', Boolean(e.target.closest('a, button')))
  })

  // Si el mouse se sale de la ventana, el punto se esconde
  raiz.addEventListener('mouseleave', function () {
    cursor.classList.remove('cursor--visible')
    visible = false
  })

  // En cada cuadro, el punto le pregunta al sol de qué color está (en la tarde se aclara)
  let ultimoColor = ''
  gsap.ticker.add(function () {
    const color = sol.color()
    if (color !== ultimoColor) {
      punto.style.backgroundColor = color
      ultimoColor = color
    }
  })
}
