/* ==========================================================================
   Toghu Hôtel & Spa — données du site
   Source unique pour les chambres, les tarifs et les coordonnées.
   Pour adapter le site à un vrai client, c'est le seul fichier à modifier
   en profondeur : le reste s'aligne dessus automatiquement.
   ========================================================================== */

/* Coordonnées de l'établissement */
const HOTEL = {
  nom: 'Toghu Hôtel & Spa',
  adresse: 'Route de la Lobé, quartier Mboa Manga',
  ville: 'Kribi, Région du Sud, Cameroun',
  telephone: '+237 6 99 00 00 00',
  telephoneBrut: '+237699000000',
  whatsapp: '237699000000',
  email: 'reservation@toghu-hotel.cm',
  fonde: '2008',
  etoiles: 4,
};

/* Frais et règles tarifaires */
const TARIFS = {
  taxeSejourParPersonneParNuit: 1000, // FCFA
  navetteDouala: 25000,               // FCFA par trajet
  petitDejeunerInclus: true,
};

/* Les 6 chambres. `id` sert de clé dans les URL (?chambre=bamoun). */
const CHAMBRES = [
  {
    id: 'sawa',
    nom: 'Chambre Sawa',
    type: 'chambre',
    surface: 32,
    capacite: 2,
    prix: 95000,
    vueOcean: false,
    resume: '32 m², vue jardin, 2 personnes',
    photo: 'ph--sawa',
    badge: null,
    equipements: ['Lit king size', 'Vue jardin tropical', 'Terrasse privée'],
    complet: [
      'Lit king size', 'Vue jardin tropical', 'Terrasse privée',
      'Climatisation', 'Wifi fibre', 'Coffre-fort', 'Minibar',
      'Salle de bain avec douche à l\'italienne',
    ],
  },
  {
    id: 'lobe',
    nom: 'Chambre Lobé',
    type: 'chambre',
    surface: 36,
    capacite: 2,
    prix: 128000,
    vueOcean: true,
    resume: '36 m², vue latérale océan, 2 personnes',
    photo: 'ph--lobe',
    badge: null,
    equipements: ['Lit king size', 'Vue latérale océan', 'Coin bureau'],
    complet: [
      'Lit king size', 'Vue latérale océan', 'Coin bureau',
      'Climatisation', 'Wifi fibre', 'Coffre-fort', 'Minibar',
      'Balcon meublé',
    ],
  },
  {
    id: 'bamoun',
    nom: 'Suite Bamoun',
    type: 'suite',
    surface: 55,
    capacite: 3,
    prix: 185000,
    vueOcean: true,
    resume: '55 m², vue océan, 3 personnes',
    photo: 'ph--bamoun',
    badge: { texte: 'Le plus réservé', variante: '' },
    equipements: ['Salon séparé', 'Vue océan', 'Baignoire en pierre'],
    complet: [
      'Salon séparé', 'Vue océan frontale', 'Baignoire en pierre',
      'Lit king size', 'Climatisation', 'Wifi fibre', 'Machine à café',
      'Peignoirs et chaussons', 'Terrasse d\'angle',
    ],
  },
  {
    id: 'ngondo',
    nom: 'Suite Ngondo',
    type: 'suite',
    surface: 62,
    capacite: 4,
    prix: 230000,
    vueOcean: true,
    resume: '62 m², vue océan, 4 personnes',
    photo: 'ph--ngondo',
    badge: null,
    equipements: ['Deux chambres', 'Terrasse d\'angle', 'Idéale en famille'],
    complet: [
      'Deux chambres séparées', 'Terrasse d\'angle', 'Vue océan',
      'Salon et coin repas', 'Climatisation', 'Wifi fibre',
      'Lit bébé sur demande', 'Deux salles de bain',
    ],
  },
  {
    id: 'villa',
    nom: 'Villa Grassfields',
    type: 'villa',
    surface: 90,
    capacite: 4,
    prix: 320000,
    vueOcean: true,
    resume: '90 m², accès plage, 4 personnes',
    photo: 'ph--villa',
    badge: null,
    equipements: ['Piscine privée', 'Accès direct plage', 'Majordome 24h/24'],
    complet: [
      'Piscine privée', 'Accès direct à la plage', 'Majordome 24h/24',
      'Deux chambres', 'Cuisine équipée', 'Terrasse avec transats',
      'Climatisation', 'Wifi fibre',
    ],
  },
  {
    id: 'royale',
    nom: 'Suite royale Toghu',
    type: 'suite',
    surface: 140,
    capacite: 4,
    prix: 520000,
    vueOcean: true,
    resume: '140 m², étage entier, 4 personnes',
    photo: 'ph--royale',
    badge: { texte: 'Dernière disponible', variante: 'badge--rare' },
    equipements: ['Étage entier', 'Salle à manger privée', 'Transfert inclus'],
    complet: [
      'Étage entier privatisé', 'Salle à manger privée', 'Transfert aéroport inclus',
      'Deux chambres et deux salons', 'Hammam privatif', 'Majordome 24h/24',
      'Vue panoramique sur l\'océan', 'Wifi fibre',
    ],
  },
];

/* Recherche d'une chambre par identifiant */
function chambreParId(id) {
  return CHAMBRES.find((c) => c.id === id) || null;
}
