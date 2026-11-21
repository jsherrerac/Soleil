import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initLinterna } from './linterna.js'

// El horno de la noche: cada clic suelta un dibujo de Deiby que cae, rebota y se amontona.
// Física hecha en casa (método de Verlet): cada pieza es un círculo.
const DIBUJOS = [
  { url: '/ilustraciones/croissant.svg', proporcion: 1.49 },
  { url: '/ilustraciones/taza-latte.svg', proporcion: 1.41 },
  { url: '/ilustraciones/granos-cafe.svg', proporcion: 1.28 },
  { url: '/ilustraciones/pancakes.svg', proporcion: 1.17 },
  { url: '/ilustraciones/rollo-canela.svg', proporcion: 1.24 },
  { url: '/ilustraciones/tostada-aguacate.svg', proporcion: 1.66 },
  { url: '/ilustraciones/taza.svg', proporcion: 1.29 }
]
const MAXIMO = 45          // más piezas que esto y las más viejas se desvanecen
const GRAVEDAD = 0.55      // píxeles que se acelera hacia abajo en cada paso
const REBOTE = 0.35        // qué tanta velocidad conserva al chocar con el piso (0 = nada, 1 = toda)
const PASO = 1000 / 60     // la física siempre avanza en pasos de 1/60 s, sin importar los Hz de la pantalla

export function initNoche() {
  const noche = document.querySelector('.noche')
  const horno = noche.querySelector('.noche__horno')
  const piezas = []
  let ancho = horno.clientWidth
  let alto = horno.clientHeight
  let visible = false
  let acumulado = 0
  let primeraVez = true

  initLinterna(noche, 260)

  // --- Soltar una pieza en (x, y) ---
  function soltar(x, y) {
    const dibujo = DIBUJOS[Math.floor(Math.random() * DIBUJOS.length)]
    const radio = gsap.utils.random(34, 60)
    const anchoPieza = radio * 2.2                       // el dibujo es un poco más grande que su círculo
    const el = document.createElement('span')
    el.className = 'pieza dibujo'
    el.style.setProperty('--dibujo', 'url(' + dibujo.url + ')')
    el.style.setProperty('--proporcion', dibujo.proporcion)
    el.style.width = anchoPieza + 'px'
    el.style.color = Math.random() < 0.5 ? 'var(--terracota)' : 'var(--marfil)'
    horno.appendChild(el)
    gsap.from(el, { opacity: 0, duration: 0.3 })

    piezas.push({
      el: el,
      x: x,
      y: y,
      // Verlet guarda la posición anterior en vez de la velocidad: velocidad = actual − anterior
      px: x - gsap.utils.random(-5, 5),
      py: y + 3,
      r: radio,
      angulo: gsap.utils.random(-0.8, 0.8),
      ancho: anchoPieza,
      alto: anchoPieza / dibujo.proporcion
    })

    if (piezas.length > MAXIMO) {
      const vieja = piezas.shift()
      gsap.to(vieja.el, { opacity: 0, duration: 0.4, onComplete: function () { vieja.el.remove() } })
    }
  }

  // --- Un paso de física ---
  function paso() {
    // 1. Mover cada pieza con su velocidad + gravedad, y chocar con piso y paredes
    piezas.forEach(function (p) {
      const vx = (p.x - p.px) * 0.995
      const vy = (p.y - p.py) * 0.995
      p.px = p.x
      p.py = p.y
      p.x += vx
      p.y += vy + GRAVEDAD
      p.angulo += vx / p.r                               // rueda: ángulo = distancia ÷ radio

      if (p.y + p.r > alto) {                            // piso: rebota y frena de lado
        p.y = alto - p.r
        p.py = p.y + vy * REBOTE
        p.px = p.x - vx * 0.9
      }
      if (p.x - p.r < 0) { p.x = p.r; p.px = p.x + vx * REBOTE }
      if (p.x + p.r > ancho) { p.x = ancho - p.r; p.px = p.x + vx * REBOTE }
    })

    // 2. Separar las que se metieron unas en otras. Varias vueltas = se apilan sin atravesarse
    for (let vuelta = 0; vuelta < 6; vuelta++) {
      for (let i = 0; i < piezas.length; i++) {
        const a = piezas[i]
        for (let j = i + 1; j < piezas.length; j++) {
          const b = piezas[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distancia = Math.sqrt(dx * dx + dy * dy) || 0.01
          const minimo = a.r + b.r
          if (distancia < minimo) {
            const empuje = ((minimo - distancia) / distancia) * 0.5   // cada una se corre la mitad
            a.x -= dx * empuje
            a.y -= dy * empuje
            b.x += dx * empuje
            b.y += dy * empuje
          }
        }
        if (a.y + a.r > alto) a.y = alto - a.r
      }
    }
  }

  // --- Dibujar: cada pieza a su posición y ángulo ---
  function pintar() {
    piezas.forEach(function (p) {
      p.el.style.transform = 'translate(' + (p.x - p.ancho / 2) + 'px, ' + (p.y - p.alto / 2) + 'px) rotate(' + p.angulo + 'rad)'
    })
  }

  gsap.ticker.add(function (tiempo, delta) {
    if (!visible || piezas.length === 0) return
    acumulado += Math.min(delta, 100)
    let pasos = 0
    while (acumulado >= PASO && pasos < 4) {
      paso()
      acumulado -= PASO
      pasos++
    }
    pintar()
  })

  // Solo simula cuando la noche está en pantalla. La primera vez, el horno suelta unas piezas solo
  ScrollTrigger.create({
    trigger: noche,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: function (self) {
      visible = self.isActive
      if (visible && primeraVez) {
        primeraVez = false
        for (let i = 0; i < 6; i++) {
          gsap.delayedCall(0.6 + i * 0.25, function () {
            soltar(gsap.utils.random(ancho * 0.45, ancho * 0.95), -60)
          })
        }
      }
    }
  })

  // Cada clic (o toque) suelta una pieza donde fue
  noche.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a, button')) return
    const caja = horno.getBoundingClientRect()
    soltar(e.clientX - caja.left, e.clientY - caja.top)
  })

  window.addEventListener('resize', function () {
    ancho = horno.clientWidth
    alto = horno.clientHeight
  })
}
