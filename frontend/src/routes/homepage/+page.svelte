<script>

import { onMount } from 'svelte';
import { unsign } from 'cookie-signature';

function checkCookie() {

    // trouver un moyen de cacher cette variable secret, sinon ce n'est plus un secret
    const secret = 'bfe54f6e335fv4r4fv5wqcF#RCr4CVr4VR#4cr4286Vr342v4@#$4V6C2V#46V4$28'; // Clé de signature
    
    const cookieValue = document.cookie.match('(^|;)\\s*access_token\\s*=\\s*([^;]+)')?.pop() || '';
    // Ok la ligne du dessus est degueu et est si mYsTeRiEuSe, voici comment cette ligne fonctionne en détail :
// document.cookie renvoie une chaîne contenant tous les cookies stockés pour le domaine actuel, séparés par des points-virgules.
// match est une méthode JavaScript pour les chaînes de caractères qui recherche une correspondance dans la chaîne en utilisant une expression régulière. La regex utilisée ici est /(^|;)\s*access_token\s*=\s*([^;]+)/, qui correspond à :
// (^|;) : soit le début de la chaîne, soit un point-virgule, pour assurer que nous récupérons la valeur correcte du cookie.
// \s* : zéro ou plusieurs espaces blancs pour gérer les espaces éventuels avant ou après le nom du cookie ou sa valeur.
// access_token : le nom du cookie que nous voulons extraire.
// \s*=\s* : zéro ou plusieurs espaces blancs autour du signe "égal" pour gérer les espaces éventuels autour de la valeur du cookie.
// ([^;]+) : un groupe de capture pour la valeur du cookie, qui ne doit pas contenir de point-virgule.
// ?.pop() extrait la dernière occurrence de la chaîne de caractères qui correspond à la regex. L'opérateur ? permet de gérer le cas où match ne trouve aucune correspondance. Dans ce cas, match renvoie null et ?. permet d'éviter une erreur de référence sur une valeur nulle.
// || '' permet de gérer le cas où la valeur du cookie est undefined ou null. Dans ce cas, pop() renvoie undefined, mais nous voulons une chaîne vide à la place.


const unsignedValue = unsign(cookieValue, secret); // Vérification de la signature

if (unsignedValue === false) {
  // La signature n'est pas valide
} else {
  // La signature est valide
  // Extraire la valeur du cookie ici
  // Verifier la signature du jwt Token
  // Traduire le jwt Token
  // et voila on a toute les infos du user.
}
}

// permet de laisser la page se charger
// on a besoin dátt que la page soit chargée pour pouvoir recuperer le cookie et checker sa signature.
if (typeof window !== 'undefined') {
  window.addEventListener('load', checkCookie);
}
</script>

<h1>Ceci est la homepage</h1>