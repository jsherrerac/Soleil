import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Las horas del día.
// - data-tema: cada sección trae su tema de color. Cuando su borde de arriba pasa la mitad de la
//   pantalla, la luz cambia: un círculo del color nuevo sale desde el sol y cubre el fondo.
// - data-hora: puntos del día (secciones y momentos del menú). El reloj de la barra avanza
//   entre un punto y el siguiente según el scroll.
const TEMAS = {
  marfil:    { fondo: '--marfil',          texto: '--espresso', sol: '--terracota' },
  durazno:   { fondo: '--terracota-claro', texto: '--espresso', sol: '--terracota' },
  espresso:  { fondo: '--espresso',        texto: '--marfil',   sol: '--terracota' },
  terracota: { fondo: '--terracota',       texto: '--marfil',   sol: '--marfil' },
  noche:     { fondo: '--espresso',        texto: '--marfil',   sol: '--marfil' }
}

// "07:30" → 450 minutos, y al revés
function aMinutos(hora) {
  const partes = hora.split(':')
  return Number(partes[0]) * 60 + Number(partes[1])
}
function aTexto(minutos) {
  const h = Math.floor(minutos / 60)
  const m = Math.floor(minutos % 60)
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
}

// Si una sección está fijada con pin, su "zona" de scroll es el pin-spacer que la envuelve
// (que mide lo que dura el pin); si no, es la sección misma
export function zonaDe(elemento) {
  const padre = elemento.parentElement
  return padre && padre.classList.contains('pin-spacer') ? padre : elemento
}

export function initHoras(sol, barra) {
  const css = getComputedStyle(document.documentElement)
  function color(variable) { return css.getPropertyValue(variable).trim() }
  const cortina = document.querySelector('.cortina')
  let temaActual = 'marfil'
  let cambio = null

  // La barra usa este color para su degradado
  function avisarFondo(fondo) {
    document.documentElement.style.setProperty('--fondo-actual', fondo)
  }

  // --- Cambiar la luz ---
  function aplicar(nombre, inmediato) {
    if (nombre === temaActual && !inmediato) return
    temaActual = nombre
    const tema = TEMAS[nombre]
    const fondo = color(tema.fondo)
    const texto = color(tema.texto)

    if (cambio) cambio.progress(1)           // si había un cambio a medias, que termine de una vez
    sol.cambiarColor(color(tema.sol), inmediato)

    if (inmediato) {
      gsap.killTweensOf(document.body)
      gsap.set(document.body, { backgroundColor: fondo, color: texto })
      avisarFondo(fondo)
      return
    }

    gsap.to(document.body, { color: texto, duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' })
    // La luz nueva sale desde donde está el sol en ese momento
    const centro = sol.actual.x + 'px ' + sol.actual.y + 'px'
    cortina.style.backgroundColor = fondo
    cambio = gsap.timeline()
      .fromTo(cortina,
        { clipPath: 'circle(0% at ' + centro + ')' },
        { clipPath: 'circle(150% at ' + centro + ')', duration: 1.1, ease: 'power3.inOut' })
      .set(document.body, { backgroundColor: fondo })      // el fondo de verdad queda del color nuevo...
      .call(avisarFondo, [fondo])
      .set(cortina, { clipPath: 'circle(0% at ' + centro + ')' })   // ...y la cortina se recoge
  }

  // --- Un ScrollTrigger por sección con tema ---
  const temas = gsap.utils.toArray('[data-tema]').map(function (seccion, i) {
    return {
      tema: seccion.dataset.tema,
      st: ScrollTrigger.create({
        trigger: zonaDe(seccion),
        start: i === 0 ? 'top top' : 'top 50%',
        end: 'bottom 50%',
        onToggle: function (self) {
          if (self.isActive) aplicar(seccion.dataset.tema)
        }
      })
    }
  })

  // --- El reloj: avanza de un punto del día al siguiente ---
  const puntos = gsap.utils.toArray('[data-hora]')
  puntos.forEach(function (punto, i) {
    const siguiente = puntos[i + 1]
    const desde = aMinutos(punto.dataset.hora)
    const hasta = siguiente ? aMinutos(siguiente.dataset.hora) : desde + 30
    ScrollTrigger.create({
      trigger: zonaDe(punto),
      start: i === 0 ? 'top top' : 'top 50%',
      endTrigger: siguiente ? zonaDe(siguiente) : 'main',
      end: siguiente ? 'top 50%' : 'bottom bottom',
      onUpdate: function (self) {
        barra.marcarHora(aTexto(desde + (hasta - desde) * self.progress))
      }
    })
  })

  return {
    // Pone de una vez el tema de la sección que está en pantalla (lo usa el preloader al recargar)
    sincronizar: function () {
      const activa = temas.find(function (t) { return t.st.isActive })
      if (activa) aplicar(activa.tema, true)
    }
  }
}
