import gsap from 'gsap'

// Reserva: la caja sticky se queda quieta y, mientras bajas, la foto se abre
// desde un marco pequeño hasta llenar la pantalla. Al final aparece la invitación.
export function initReserva() {
  const seccion = document.querySelector('.reserva')
  const foto = seccion.querySelector('.reserva__foto')
  const img = foto.querySelector('img')
  const contenido = gsap.utils.toArray(seccion.querySelector('.reserva__contenido').children)

  gsap.timeline({
    scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: 1 }
  })
    .fromTo(foto, { clipPath: 'inset(22% 30% round 28px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'power2.inOut' })
    .fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'power2.inOut' }, 0)          // la foto se "aleja" mientras se abre
    .fromTo(foto, { '--sombra': 0 }, { '--sombra': 1, ease: 'none' }, 0.3)        // oscurece para que se lea el texto
    .fromTo(contenido, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, ease: 'power2.out' }, 0.45)
}
