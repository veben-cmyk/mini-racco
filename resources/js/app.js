/*
  Bouton "Copier" : tout bouton qui porte l'attribut data-copy
  copie son contenu dans le presse-papier au clic.
  On écoute les clics sur toute la page (délégation d'événement) :
  un seul écouteur suffit, quel que soit le nombre de boutons.
*/
document.addEventListener('click', async (event) => {
  // Le bouton cliqué (ou son parent) a-t-il un attribut data-copy ?
  const bouton = event.target.closest('[data-copy]')
  if (!bouton) return // non : on ne fait rien

  try {
    // Copie le texte stocké dans data-copy
    await navigator.clipboard.writeText(bouton.dataset.copy)

    // Retour visuel : "Copié ✓" pendant 1,5 seconde, puis le texte d'origine revient
    const texteOrigine = bouton.textContent
    bouton.textContent = 'Copié ✓'
    setTimeout(() => {
      bouton.textContent = texteOrigine
    }, 1500)
  } catch {
    // Copie refusée par le navigateur : on prévient l'utilisateur
    bouton.textContent = 'Copie impossible'
  }
})