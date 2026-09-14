# Toghu Hôtel & Spa

Site vitrine et tunnel de réservation pour un hôtel 4 étoiles, en HTML, CSS et JavaScript pur.

**Projet de démonstration.** L'établissement est fictif : le Toghu Hôtel & Spa n'existe pas. Le projet sert à montrer une chaîne de travail complète, du brief au code déployé.

🔗 **Démo en ligne :** https://toghu-hotel-site.vercel.app

Le même dépôt est déployé en parallèle sur deux hébergeurs, pour comparaison :
[Vercel](https://toghu-hotel-site.vercel.app) et [Netlify](https://silver-druid-fa6f0a.netlify.app).

---

## Le projet

Un hôtel imaginaire de 62 chambres en front de mer à Kribi, au Cameroun. Le parti pris visuel est le luxe camerounais contemporain : palette tirée du tissu royal toghu des Grassfields, noir profond et broderies or, rouge latérite, vert forêt.

Les contraintes du marché local sont traitées comme des exigences, pas comme des détails :

- Prix en francs CFA
- WhatsApp comme canal de contact principal
- Orange Money et MTN MoMo parmi les moyens de paiement
- Mobile d'abord, parce que c'est là que se fait la réservation

---

## Les pages

| Page | Contenu |
|------|---------|
| `index.html` | Accueil : hero, recherche de disponibilité, présentation, chambres, services, avis |
| `chambres.html` | Catalogue de 6 chambres avec filtres et tri |
| `reservation.html` | Tunnel de réservation en 3 étapes, récapitulatif de prix en direct |
| `confirmation.html` | Confirmation, référence de dossier, export vers l'agenda |

---

## Ce qui fonctionne réellement

Ce n'est pas une maquette cliquable, le code calcule.

- **Recherche de disponibilité** avec dates par défaut intelligentes, le départ se recale si l'arrivée le dépasse
- **Filtres** par type, capacité, budget et vue, tri par prix, état vide géré
- **Calcul du prix** : `prix chambre × nuits` + `taxe de séjour × personnes × nuits`, mis à jour à chaque changement
- **Garde-fous** : impossible d'avancer si les dates sont incohérentes ou si les voyageurs dépassent la capacité de la chambre
- **Validation du formulaire** avec messages sous le champ concerné et focus sur la première erreur
- **Panier persistant** entre les pages via `sessionStorage`
- **Export agenda** : génère un vrai fichier `.ics` importable dans Google Agenda, Outlook ou Apple Calendrier

---

## Technique

Aucune dépendance, aucun paquet à installer, aucune étape de compilation.

```
index.html, chambres.html, reservation.html, confirmation.html
assets/css/style.css     toute la mise en forme, mobile d'abord
assets/js/data.js        les données : chambres, tarifs, coordonnées
assets/js/main.js        les comportements : filtres, calculs, validation
netlify.toml             configuration Netlify : en-têtes, cache, URL sans extension
vercel.json              même configuration, pour Vercel
```

La séparation données / comportements / présentation est volontaire. Changer d'hôtel revient à réécrire `data.js` et les cinq couleurs en haut de `style.css`.

**Accessibilité :** lien d'évitement, navigation au clavier, contours de focus visibles, `aria-pressed` sur les bascules, `role="alert"` sur les erreurs, respect de `prefers-reduced-motion`.

**Responsive :** testé de 320 px à 1440 px, sans débordement horizontal.

---

## Lancer en local

Clonez le dépôt et ouvrez `index.html` dans un navigateur. C'est tout.

```bash
git clone https://github.com/shinobi-24/toghu-hotel-site.git
cd toghu-hotel-site
```

Le site fonctionne en `file://` : aucun appel réseau, hormis les polices Google Fonts qui ont un repli local.

---

## Ce qui n'est pas implémenté

Assumé et documenté, plutôt que caché.

- **Les photographies.** Les zones marquées « Emplacement photo » sont des dégradés CSS aux couleurs du toghu
- **La version anglaise.** Le sélecteur FR / EN est en place mais n'est pas branché
- **Le back-end.** Aucun paiement n'est traité, aucun email n'est envoyé, aucune disponibilité n'est vérifiée
- **4 écrans du brief initial** : détail d'une chambre, Restaurant & Spa, Séminaires, Contact

---

## Auteur

Réalisé par Dauda Faye, consultant IA, Saint-Louis, Sénégal.
Brief, direction artistique, maquette et développement.

Licence MIT.
