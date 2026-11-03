// Les filtres SVG de la DA Manar : le trait « sketch » (tracé un peu irrégulier, fixe d'une image à l'autre grâce à la graine
// constante) et sa variante à filet d'encre, pour les flèches miel. À charger juste après <body>.
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute">
  <filter id="sketch" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="bruit"/>
    <feDisplacementMap in="SourceGraphic" in2="bruit" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="sketch-filet" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="bruit"/>
    <feDisplacementMap in="SourceGraphic" in2="bruit" scale="5" xChannelSelector="R" yChannelSelector="G" result="trait"/>
    <feMorphology in="trait" operator="dilate" radius="2.5" result="large"/>
    <feFlood style="flood-color:var(--encre-dessin)"/>
    <feComposite in2="large" operator="in" result="filet"/>
    <feMerge><feMergeNode in="filet"/><feMergeNode in="trait"/></feMerge>
  </filter>
</svg>`)
