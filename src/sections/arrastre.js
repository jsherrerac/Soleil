import gsap from 'gsap'

// El sol de la O se puede agarrar (solo por la espiral) y arrastrar por la pantalla.
// Al soltarlo vuelve a su puesto rebotando. Las letras brillan cuando se les acerca.
export function initArrastre(sol, letras) {
  const agarre = document.querySelector('.hero__agarre')
  const solSvg = document.querySelector('.cielo .sol')
  const raiz = document.documentElement

  // Colores leídos del CSS
  const css = getComputedStyle(raiz)
  const espresso = css.getPropertyValue('--espresso').trim()
  const terracota = css.getPropertyValue('--terracota').trim()
  const calentar = gsap.utils.interpolate(espresso, terracota)   // calentar(0) = espresso, calentar(1) = terracota
  const rgb = gsap.utils.splitColor(terracota)                    // "#C86E4A" → [200, 110, 74]
  const terracotaRGB = rgb[0] + ', ' + rgb[1] + ', ' + rgb[2]

  let agarrado = null    // dónde estaba el mouse al agarrar (null = no lo tienes agarrado)
  let regreso = null     // la animación que lo devuelve a la O
  let latido = null      // el brillo que "respira" mientras lo tienes agarrado
  let centros = []       // centro de cada letra (se mide una vez al agarrar: las letras no se mueven)

  // Los dos halos de cada letra: los <feDropShadow> de los filtros #brillo-0 ... #brillo-4 del logo
  const halos = letras.map(function (letra, i) {
    return document.querySelectorAll('#brillo-' + i + ' feDropShadow')
  })
  const brillo = { valor: 0 }

  // --- Brillo del sol: una sombra de luz alrededor ---
  function pintarBrilloSol() {
    if (brillo.valor < 0.01) {
      solSvg.style.filter = ''
      return
    }
    solSvg.style.filter = 'drop-shadow(0 0 ' + (brillo.valor * 14) + 'px rgba(' + terracotaRGB + ', ' + (brillo.valor * 0.9) + '))'
  }

  // --- Brillo de las letras: entre más cerca está el sol, más se calientan ---
  function medirLetras() {
    centros = letras.map(function (letra) {
      const caja = letra.getBoundingClientRect()
      return { x: caja.left + caja.width / 2, y: caja.top + caja.height / 2 }
    })
  }

  function brillarLetras() {
    const radio = sol.tamanoEnO() * 0.7      // a esta distancia del sol empieza el brillo
    letras.forEach(function (letra, i) {
      const dx = centros[i].x - sol.actual.x
      const dy = centros[i].y - sol.actual.y
      const distancia = Math.sqrt(dx * dx + dy * dy)                  // Pitágoras
      const cerca = gsap.utils.clamp(0, 1, 1 - distancia / radio)     // 1 = encima, 0 = lejos

      if (cerca === 0) {
        letra.style.fill = ''
        letra.removeAttribute('filter')      // sin brillo, sin filtro: no gasta nada
        return
      }
      letra.style.fill = calentar(cerca)
      letra.setAttribute('filter', 'url(#brillo-' + i + ')')
      halos[i][0].setAttribute('stdDeviation', 4 * cerca)     // halo pegado a la letra
      halos[i][0].setAttribute('flood-opacity', cerca)
      halos[i][1].setAttribute('stdDeviation', 18 * cerca)    // halo amplio
      halos[i][1].setAttribute('flood-opacity', 0.6 * cerca)
    })
  }

  // Cada vez que la mano mueve el sol: se redibuja y se recalcula el brillo
  function actualizar() {
    sol.dibujar()
    brillarLetras()
  }

  // --- Agarrar ---
  agarre.addEventListener('pointerdown', function (e) {
    if (!sol.enElHero()) return            // solo arriba del todo, con el sol en la O
    e.preventDefault()
    if (regreso) regreso.kill()
    agarre.setPointerCapture(e.pointerId)  // aunque el mouse salga de la espiral, los eventos siguen llegando aquí
    medirLetras()

    // Dónde lo agarraste, descontando lo que ya estuviera corrido (por si lo agarras mientras vuelve)
    agarrado = { x: e.clientX - sol.desplazamiento.x, y: e.clientY - sol.desplazamiento.y }
    raiz.classList.add('arrastrando')

    gsap.to(sol.desplazamiento, { escala: 1.08, duration: 0.3, ease: 'power2.out', overwrite: 'auto', onUpdate: actualizar })
    gsap.to(brillo, { valor: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto', onUpdate: pintarBrilloSol })
    latido = gsap.to(brillo, { valor: 0.6, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.4, onUpdate: pintarBrilloSol })
  })

  // --- Arrastrar ---
  agarre.addEventListener('pointermove', function (e) {
    if (!agarrado) return
    sol.desplazamiento.x = e.clientX - agarrado.x
    sol.desplazamiento.y = e.clientY - agarrado.y
    actualizar()
  })

  // --- Soltar: vuelve a la O rebotando, como un resorte ---
  function soltar() {
    if (!agarrado) return
    agarrado = null
    raiz.classList.remove('arrastrando')
    if (latido) latido.kill()

    regreso = gsap.to(sol.desplazamiento, {
      x: 0,
      y: 0,
      escala: 1,
      duration: 1.6,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
      onUpdate: actualizar
    })
    gsap.to(brillo, { valor: 0, duration: 1, ease: 'power2.out', overwrite: 'auto', onUpdate: pintarBrilloSol })
  }
  agarre.addEventListener('pointerup', soltar)
  agarre.addEventListener('pointercancel', soltar)

  // --- El cursor crece cuando pasas por encima de la espiral ---
  agarre.addEventListener('pointerenter', function () {
    if (sol.enElHero()) raiz.classList.add('sobre-sol')
  })
  agarre.addEventListener('pointerleave', function () {
    raiz.classList.remove('sobre-sol')
  })
}
