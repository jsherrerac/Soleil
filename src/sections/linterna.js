import gsap from 'gsap'

// La linterna: el mouse ilumina los dibujos del patrón dentro de "elemento".
// El elemento necesita la clase .con-linterna (el CSS está en linterna.css).
// Solo en computador: en celular no hay mouse que mueva la luz.
export function initLinterna(elemento, radio) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const tamano = radio || 230

  const luz = { x: 0, y: 0, radio: 0 }
  function pintar() {
    elemento.style.setProperty('--luz-x', luz.x + 'px')
    elemento.style.setProperty('--luz-y', luz.y + 'px')
    elemento.style.setProperty('--luz-radio', luz.radio + 'px')
  }

  // La luz sigue al mouse con un poquito de retraso, como si pesara
  const irAX = gsap.quickTo(luz, 'x', { duration: 0.6, ease: 'power3.out', onUpdate: pintar })
  const irAY = gsap.quickTo(luz, 'y', { duration: 0.6, ease: 'power3.out', onUpdate: pintar })

  // Posición del mouse medida desde la esquina del elemento (no de la pantalla)
  function posicion(e) {
    const caja = elemento.getBoundingClientRect()
    return { x: e.clientX - caja.left, y: e.clientY - caja.top }
  }

  elemento.addEventListener('pointerenter', function (e) {
    const p = posicion(e)
    gsap.set(luz, { x: p.x, y: p.y })
    irAX(p.x)
    irAY(p.y)
    gsap.to(luz, { radio: tamano, duration: 0.7, ease: 'power2.out', overwrite: 'auto', onUpdate: pintar })   // se prende
  })
  elemento.addEventListener('pointermove', function (e) {
    const p = posicion(e)
    irAX(p.x)
    irAY(p.y)
  })
  elemento.addEventListener('pointerleave', function () {
    gsap.to(luz, { radio: 0, duration: 0.7, ease: 'power2.out', overwrite: 'auto', onUpdate: pintar })        // se apaga
  })
}
