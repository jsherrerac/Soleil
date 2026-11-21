import gsap from 'gsap'

// Prepara la entrada del hero y la devuelve en pausa (el preloader la reproduce
// cuando el sol ya llegó a su puesto). También devuelve las letras, para el brillo.
export function initHero() {
  const letras = gsap.utils.toArray('.hero__letra')          // S, L, E, I, L (trazos del logo de Deiby)
  const brunch = gsap.utils.toArray('.hero__brunch-letra')   // B, R, U, N, C, H
  const ventana = document.querySelector('.hero__letras')    // el grupo que tiene la "ventana" (clip-path)
  const hora = document.querySelector('.hero__hora')
  const lema = document.querySelector('.hero__lema')
  const desliza = document.querySelector('.hero__desliza')

  const tl = gsap.timeline({
    paused: true,
    // Al terminar se quita la ventana: si no, recortaría el brillo de las letras
    onComplete: function () {
      ventana.removeAttribute('clip-path')
    }
  })

  tl.from(letras, {
    y: 140,                      // en unidades del SVG: las letras miden 109 de alto, así que arrancan escondidas
    rotation: 8,
    transformOrigin: '50% 100%',
    duration: 1.3,
    ease: 'expo.out',
    // El retraso de cada letra = su distancia al sol × 0.07 s.
    // El sol está entre la S (índice 0) y la L (índice 1), o sea en 0.5.
    stagger: function (indice) {
      return Math.abs(indice - 0.5) * 0.07
    }
  })
    // BRUNCH: las letras llegan separadas y se juntan, como si se cerrara el espaciado
    .from(brunch, {
      x: function (indice) {
        return (indice - 2.5) * 24      // las de los lados vienen de más lejos
      },
      autoAlpha: 0,
      duration: 1.4,
      ease: 'expo.out'
    }, 0.3)
    .from([hora, lema, desliza], { autoAlpha: 0, y: 12, duration: 0.9, stagger: 0.1, ease: 'power2.out' }, 0.5)

  return { entrada: tl, letras: letras }
}
