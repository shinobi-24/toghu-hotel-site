/* ==========================================================================
   Toghu Hôtel & Spa — comportements du site
   Un seul fichier, chargé sur toutes les pages. Chaque bloc s'active
   uniquement si les éléments qu'il pilote existent dans la page.
   ========================================================================== */

(function () {
  'use strict';

  /* --- Outils ------------------------------------------------------------ */

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const JOURS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const MOIS  = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
                 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  /* 145000 -> "145 000 FCFA" (espace insécable fine pour éviter les coupures) */
  function fcfa(montant) {
    return Math.round(montant).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }

  /* "2026-11-14" -> objet Date local (évite le décalage UTC de new Date(str)) */
  function versDate(iso) {
    if (!iso) return null;
    const [a, m, j] = iso.split('-').map(Number);
    if (!a || !m || !j) return null;
    return new Date(a, m - 1, j);
  }

  /* Date -> "2026-11-14" */
  function versIso(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  /* Date -> "Ven. 14 nov. 2026" */
  function dateLongue(d) {
    if (!d) return '';
    return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /* Date -> "Ven. 14 nov." */
  function dateCourte(d) {
    if (!d) return '';
    return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
  }

  function nuitsEntre(arrivee, depart) {
    if (!arrivee || !depart) return 0;
    const ms = depart.getTime() - arrivee.getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  function ajouterJours(d, n) {
    const c = new Date(d.getTime());
    c.setDate(c.getDate() + n);
    return c;
  }

  const params = new URLSearchParams(window.location.search);

  /* Persistance légère du panier entre les pages */
  const Panier = {
    lire() {
      try { return JSON.parse(sessionStorage.getItem('toghu:reservation')) || {}; }
      catch (e) { return {}; }
    },
    ecrire(obj) {
      try { sessionStorage.setItem('toghu:reservation', JSON.stringify(obj)); }
      catch (e) { /* navigation privée, on continue sans mémoire */ }
    },
  };

  /* Dates par défaut : le prochain vendredi, deux nuits */
  function datesParDefaut() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const versVendredi = (5 - today.getDay() + 7) % 7 || 7;
    const arrivee = ajouterJours(today, versVendredi);
    return { arrivee, depart: ajouterJours(arrivee, 2) };
  }

  /* Message discret, sans dépendance externe */
  function toast(message) {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      el.style.cssText =
        'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:200;' +
        'background:#1A1614;color:#F7F2EA;padding:13px 22px;font-size:13px;' +
        'box-shadow:0 12px 30px rgba(26,22,20,.3);max-width:90vw;text-align:center;' +
        'opacity:0;transition:opacity .2s ease;';
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, 3200);
  }

  /* --- Tiroir de navigation ---------------------------------------------- */

  function initDrawer() {
    const drawer = $('#drawer');
    if (!drawer) return;

    const ouvrir  = $$('[data-drawer-open]');
    const fermer  = $$('[data-drawer-close]', drawer);
    let dernierFocus = null;

    function setOpen(open) {
      drawer.dataset.open = String(open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        dernierFocus = document.activeElement;
        const cible = $('a, button', drawer);
        if (cible) cible.focus();
      } else if (dernierFocus) {
        dernierFocus.focus();
      }
    }

    ouvrir.forEach((b) => b.addEventListener('click', () => setOpen(true)));
    fermer.forEach((b) => b.addEventListener('click', () => setOpen(false)));
    $$('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.dataset.open === 'true') setOpen(false);
    });

    setOpen(false);
  }

  /* --- Sélecteur de langue ------------------------------------------------ */

  function initLangue() {
    $$('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang === 'en') {
          toast('Version anglaise en cours de traduction.');
          return;
        }
        $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      });
    });
  }

  /* --- Barre de recherche (accueil) --------------------------------------- */

  function initRecherche() {
    const form = $('#recherche');
    if (!form) return;

    const inArr = $('#r-arrivee', form);
    const inDep = $('#r-depart', form);
    const inVoy = $('#r-voyageurs', form);

    const { arrivee, depart } = datesParDefaut();
    const memo = Panier.lire();

    inArr.value = memo.arrivee || versIso(arrivee);
    inDep.value = memo.depart  || versIso(depart);
    inArr.min = versIso(new Date());
    if (memo.voyageurs) inVoy.value = String(memo.voyageurs);

    /* le départ suit toujours l'arrivée */
    function recalerDepart() {
      const a = versDate(inArr.value);
      if (!a) return;
      inDep.min = versIso(ajouterJours(a, 1));
      const d = versDate(inDep.value);
      if (!d || d <= a) inDep.value = versIso(ajouterJours(a, 1));
    }
    inArr.addEventListener('change', recalerDepart);
    recalerDepart();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = new URLSearchParams({
        arrivee: inArr.value,
        depart: inDep.value,
        voyageurs: inVoy.value,
      });
      Panier.ecrire(Object.assign(Panier.lire(), {
        arrivee: inArr.value, depart: inDep.value, voyageurs: Number(inVoy.value),
      }));
      window.location.href = 'chambres.html?' + q.toString();
    });
  }

  /* --- Grille de chambres (accueil et page chambres) ---------------------- */

  const ICONE = {
    lit:   '<path d="M3 17V9a2 2 0 012-2h14a2 2 0 012 2v8"/><path d="M3 17h18M7 7V5h10v2"/>',
    vague: '<path d="M3 18c3-2 6-2 9 0s6 2 9 0"/><path d="M3 12c3-2 6-2 9 0s6 2 9 0"/><path d="M3 6c3-2 6-2 9 0s6 2 9 0"/>',
    maison:'<path d="M5 20V8l7-4 7 4v12"/><path d="M9 20v-6h6v6"/>',
  };

  function iconePour(i) {
    return [ICONE.lit, ICONE.vague, ICONE.maison][i % 3];
  }

  function carteChambre(ch, lienParams) {
    const q = new URLSearchParams(lienParams || {});
    q.set('chambre', ch.id);
    const lien = 'reservation.html?' + q.toString();

    const badge = ch.badge
      ? `<span class="badge ${ch.badge.variante}">${ch.badge.texte}</span>` : '';

    const feats = ch.equipements.map((e, i) => `
        <li>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E4A3B"
               stroke-width="1.3" stroke-linecap="round" aria-hidden="true">${iconePour(i)}</svg>
          <span>${e}</span>
        </li>`).join('');

    return `
      <article class="room">
        <div class="ph ${ch.photo}">
          ${badge}
          <span class="ph__label">Emplacement photo</span>
        </div>
        <div class="room__body">
          <h3 class="room__name"><a href="${lien}">${ch.nom}</a></h3>
          <p class="room__meta">
            <span>${ch.surface} m²</span><i></i><span>${ch.capacite} personnes</span>
          </p>
          <ul class="room__feats">${feats}</ul>
          <div class="room__foot">
            <p class="room__price">
              <small>À partir de</small>
              <b>${fcfa(ch.prix)}</b>
              <span>par nuit</span>
            </p>
            <a class="btn btn--outline" href="${lien}">
              Voir<span class="sr-only"> la ${ch.nom}</span>
            </a>
          </div>
        </div>
      </article>`;
  }

  /* Trois chambres mises en avant sur l'accueil */
  function initVitrine() {
    const hote = $('#vitrine');
    if (!hote) return;
    const choix = ['sawa', 'bamoun', 'villa'].map(chambreParId).filter(Boolean);
    hote.innerHTML = choix.map((c) => carteChambre(c)).join('');
  }

  /* --- Page chambres : filtres et tri ------------------------------------- */

  function initCatalogue() {
    const grille = $('#catalogue');
    if (!grille) return;

    const fType   = $('#f-type');
    const fVoy    = $('#f-voyageurs');
    const fBudget = $('#f-budget');
    const fOcean  = $('#f-ocean');
    const fTri    = $('#f-tri');
    const compteur= $('#f-compte');
    const reset   = $('#f-reset');

    /* préremplissage depuis la barre de recherche de l'accueil */
    const contexte = {};
    ['arrivee', 'depart', 'voyageurs'].forEach((k) => {
      const v = params.get(k);
      if (v) contexte[k] = v;
    });
    if (contexte.voyageurs && fVoy) fVoy.value = contexte.voyageurs;

    const rappel = $('#f-rappel');
    if (rappel && contexte.arrivee && contexte.depart) {
      const a = versDate(contexte.arrivee), d = versDate(contexte.depart);
      const n = nuitsEntre(a, d);
      rappel.textContent =
        `Du ${dateCourte(a)} au ${dateCourte(d)}, ${n} nuit${n > 1 ? 's' : ''}.`;
      rappel.hidden = false;
    }

    function appliquer() {
      const type   = fType.value;
      const voy    = Number(fVoy.value) || 0;
      const budget = Number(fBudget.value) || 0;
      const ocean  = fOcean.getAttribute('aria-pressed') === 'true';

      let liste = CHAMBRES.filter((c) =>
        (!type   || c.type === type) &&
        (!voy    || c.capacite >= voy) &&
        (!budget || c.prix <= budget) &&
        (!ocean  || c.vueOcean)
      );

      liste.sort((a, b) => (fTri.value === 'desc' ? b.prix - a.prix : a.prix - b.prix));

      grille.innerHTML = liste.length
        ? liste.map((c) => carteChambre(c, contexte)).join('')
        : `<p class="empty">Aucune chambre ne correspond à ces critères.
             <button type="button" class="link-underline" id="f-vider"
                     style="margin-top:16px">Réinitialiser les filtres</button></p>`;

      compteur.textContent =
        `${liste.length} chambre${liste.length > 1 ? 's' : ''} disponible${liste.length > 1 ? 's' : ''}`;

      const vider = $('#f-vider');
      if (vider) vider.addEventListener('click', reinitialiser);
    }

    function reinitialiser() {
      fType.value = ''; fVoy.value = ''; fBudget.value = ''; fTri.value = 'asc';
      fOcean.setAttribute('aria-pressed', 'false');
      appliquer();
    }

    [fType, fVoy, fBudget, fTri].forEach((el) => el.addEventListener('change', appliquer));
    fOcean.addEventListener('click', () => {
      fOcean.setAttribute('aria-pressed',
        String(fOcean.getAttribute('aria-pressed') !== 'true'));
      appliquer();
    });
    if (reset) reset.addEventListener('click', reinitialiser);

    appliquer();
  }

  /* --- Parcours de réservation -------------------------------------------- */

  function initReservation() {
    const page = $('#reservation');
    if (!page) return;

    const memo = Panier.lire();
    const defauts = datesParDefaut();

    /* état courant du panier */
    const etat = {
      chambre:   params.get('chambre')   || memo.chambre   || 'bamoun',
      arrivee:   params.get('arrivee')   || memo.arrivee   || versIso(defauts.arrivee),
      depart:    params.get('depart')    || memo.depart    || versIso(defauts.depart),
      adultes:   Number(params.get('adultes'))  || memo.adultes  || 2,
      enfants:   Number(params.get('enfants'))  || memo.enfants  || 1,
      navette:   Boolean(memo.navette),
      arriveeH:  memo.arriveeH || '16h - 20h',
      paiement:  memo.paiement || 'orange',
    };
    /* `voyageurs` vient de la recherche de l'accueil, on le répartit */
    const voy = Number(params.get('voyageurs'));
    if (voy) { etat.adultes = Math.min(voy, 4); etat.enfants = 0; }

    if (!chambreParId(etat.chambre)) etat.chambre = 'bamoun';

    /* champs de l'étape 1 */
    const selChambre = $('#b-chambre');
    const inArr = $('#b-arrivee');
    const inDep = $('#b-depart');
    const inAd  = $('#b-adultes');
    const inEn  = $('#b-enfants');

    selChambre.innerHTML = CHAMBRES
      .map((c) => `<option value="${c.id}">${c.nom} — ${fcfa(c.prix)} / nuit</option>`)
      .join('');

    selChambre.value = etat.chambre;
    inArr.value = etat.arrivee;
    inDep.value = etat.depart;
    inAd.value  = String(etat.adultes);
    inEn.value  = String(etat.enfants);
    inArr.min   = versIso(new Date());

    /* --- calcul du prix, source unique de vérité --- */
    function calcul() {
      const ch = chambreParId(etat.chambre);
      const a = versDate(etat.arrivee);
      const d = versDate(etat.depart);
      const nuits = nuitsEntre(a, d);
      const personnes = etat.adultes + etat.enfants;
      const sousTotal = ch.prix * nuits;
      const taxe = TARIFS.taxeSejourParPersonneParNuit * personnes * nuits;
      return { ch, a, d, nuits, personnes, sousTotal, taxe, total: sousTotal + taxe };
    }

    function majRecap() {
      const c = calcul();

      $('#rc-photo').className = 'ph ' + c.ch.photo;
      $('#rc-nom').textContent = c.ch.nom;
      $('#rc-desc').textContent = c.ch.resume;
      $('#rc-arrivee').textContent = c.a ? `${dateLongue(c.a)}, dès 14h` : '—';
      $('#rc-depart').textContent  = c.d ? `${dateLongue(c.d)}, avant 12h` : '—';
      $('#rc-voyageurs').textContent =
        `${etat.adultes} adulte${etat.adultes > 1 ? 's' : ''}` +
        (etat.enfants ? `, ${etat.enfants} enfant${etat.enfants > 1 ? 's' : ''}` : '');

      $('#rc-lignelabel').textContent = `${fcfa(c.ch.prix)} × ${c.nuits} nuit${c.nuits > 1 ? 's' : ''}`;
      $('#rc-soustotal').textContent = fcfa(c.sousTotal);
      $('#rc-taxe').textContent = fcfa(c.taxe);
      $('#rc-total').textContent = fcfa(c.total);

      const navette = $('#rc-navette-ligne');
      navette.hidden = !etat.navette;
      $('#rc-navette').textContent = fcfa(TARIFS.navetteDouala) + ' × 1 trajet, sur place';

      const limite = c.a ? ajouterJours(c.a, -3) : null;
      $('#rc-annulation').textContent = limite
        ? `Annulation gratuite jusqu'au ${dateCourte(limite)} à minuit.`
        : 'Annulation gratuite jusqu\'à 72h avant l\'arrivée.';

      /* le bouton de l'étape 1 attend un séjour valide */
      const valide = c.nuits > 0 && c.personnes > 0 && c.personnes <= c.ch.capacite;
      const suite = $('#b-suite-1');
      suite.setAttribute('aria-disabled', String(!valide));

      const alerte = $('#b-alerte');
      if (c.nuits <= 0) {
        alerte.textContent = 'La date de départ doit suivre la date d\'arrivée.';
        alerte.hidden = false;
      } else if (c.personnes > c.ch.capacite) {
        alerte.textContent =
          `La ${c.ch.nom} accueille ${c.ch.capacite} personnes au maximum. ` +
          'Choisissez une autre chambre ou réduisez le nombre de voyageurs.';
        alerte.hidden = false;
      } else {
        alerte.hidden = true;
      }

      Panier.ecrire(etat);
    }

    function lireEtape1() {
      etat.chambre = selChambre.value;
      etat.arrivee = inArr.value;
      etat.depart  = inDep.value;
      etat.adultes = Number(inAd.value);
      etat.enfants = Number(inEn.value);

      const a = versDate(etat.arrivee);
      if (a) {
        inDep.min = versIso(ajouterJours(a, 1));
        const d = versDate(etat.depart);
        if (!d || d <= a) {
          inDep.value = versIso(ajouterJours(a, 1));
          etat.depart = inDep.value;
        }
      }
      majRecap();
    }

    [selChambre, inArr, inDep, inAd, inEn]
      .forEach((el) => el.addEventListener('change', lireEtape1));

    /* --- navigation entre les 3 étapes --- */
    function allerA(n) {
      $$('[data-panel]').forEach((p) => { p.hidden = Number(p.dataset.panel) !== n; });
      $$('.step').forEach((s) => {
        const i = Number(s.dataset.step);
        s.dataset.state = i < n ? 'done' : i === n ? 'current' : 'todo';
        s.setAttribute('aria-current', i === n ? 'step' : 'false');
      });
      $$('.step__line').forEach((l, i) => { l.dataset.done = String(i + 1 < n); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      $('#b-titre').textContent =
        ['Dates et chambre', 'Vos informations', 'Paiement'][n - 1];
    }

    $$('[data-goto]').forEach((b) => {
      b.addEventListener('click', () => {
        const cible = Number(b.dataset.goto);
        if (cible === 2 && !validerEtape(1)) return;
        if (cible === 3 && !validerEtape(2)) return;
        allerA(cible);
      });
    });

    /* --- validation --- */
    function marquer(champ, message) {
      const bloc = champ.closest('.field');
      bloc.dataset.invalid = String(Boolean(message));
      const err = $('.field__error', bloc);
      if (err) err.textContent = message || '';
      champ.setAttribute('aria-invalid', String(Boolean(message)));
    }

    function validerEtape(n) {
      if (n === 1) {
        const c = calcul();
        if (c.nuits <= 0 || c.personnes > c.ch.capacite) {
          toast('Vérifiez les dates et le nombre de voyageurs.');
          return false;
        }
        return true;
      }

      if (n === 2) {
        const requis = [
          [$('#c-prenom'), 'Indiquez votre prénom.'],
          [$('#c-nom'),    'Indiquez votre nom.'],
        ];
        let ok = true;

        requis.forEach(([champ, msg]) => {
          const vide = !champ.value.trim();
          marquer(champ, vide ? msg : '');
          if (vide) ok = false;
        });

        const email = $('#c-email');
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
        marquer(email, emailOk ? '' : 'Adresse email invalide.');
        if (!emailOk) ok = false;

        const tel = $('#c-tel');
        const telOk = tel.value.replace(/\D/g, '').length >= 8;
        marquer(tel, telOk ? '' : 'Numéro trop court.');
        if (!telOk) ok = false;

        if (!ok) {
          toast('Quelques champs demandent votre attention.');
          const premier = $('.field[data-invalid="true"] input');
          if (premier) premier.focus();
        }
        return ok;
      }

      return true;
    }

    /* --- étape 2 : options --- */
    $$('[data-heure]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.heure === etat.arriveeH));
      b.addEventListener('click', () => {
        etat.arriveeH = b.dataset.heure;
        $$('[data-heure]').forEach((x) =>
          x.setAttribute('aria-pressed', String(x === b)));
        Panier.ecrire(etat);
      });
    });

    const navetteBox = $('#c-navette');
    navetteBox.checked = etat.navette;
    navetteBox.addEventListener('change', () => {
      etat.navette = navetteBox.checked;
      majRecap();
    });

    /* --- étape 3 : paiement --- */
    $$('[data-paiement]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.paiement === etat.paiement));
      b.addEventListener('click', () => {
        etat.paiement = b.dataset.paiement;
        $$('[data-paiement]').forEach((x) =>
          x.setAttribute('aria-pressed', String(x === b)));
        const momo = $('#bloc-momo');
        const carte = $('#bloc-carte');
        const mobile = etat.paiement === 'orange' || etat.paiement === 'mtn';
        momo.hidden = !mobile;
        carte.hidden = mobile;
        Panier.ecrire(etat);
      });
    });

    $('#b-payer').addEventListener('click', (e) => {
      e.preventDefault();
      const cgv = $('#c-cgv');
      if (!cgv.checked) {
        toast('Acceptez les conditions de réservation pour continuer.');
        cgv.focus();
        return;
      }
      const c = calcul();
      const dossier = {
        reference: 'TGH-' + Math.floor(1000 + Math.random() * 9000) + '-KB',
        chambre: etat.chambre,
        arrivee: etat.arrivee,
        depart: etat.depart,
        adultes: etat.adultes,
        enfants: etat.enfants,
        navette: etat.navette,
        paiement: etat.paiement,
        total: c.total,
        email: $('#c-email').value.trim(),
        prenom: $('#c-prenom').value.trim(),
        nom: $('#c-nom').value.trim(),
      };
      try { sessionStorage.setItem('toghu:dossier', JSON.stringify(dossier)); } catch (err) {}
      window.location.href = 'confirmation.html?ref=' + encodeURIComponent(dossier.reference);
    });

    /* la touche Entrée dans un champ ne doit pas recharger la page */
    $('form', page).addEventListener('submit', (e) => e.preventDefault());

    lireEtape1();
    allerA(1);
  }

  /* --- Page de confirmation ------------------------------------------------ */

  const MOYENS = {
    orange: 'Orange Money',
    mtn: 'MTN MoMo',
    visa: 'carte bancaire',
    place: 'paiement sur place',
  };

  function initConfirmation() {
    const page = $('#confirmation');
    if (!page) return;

    let d = {};
    try { d = JSON.parse(sessionStorage.getItem('toghu:dossier')) || {}; } catch (e) {}

    /* démonstration accessible en direct : valeurs de secours si on arrive
       sur la page sans être passé par le formulaire */
    const defauts = datesParDefaut();
    const dossier = Object.assign({
      reference: params.get('ref') || 'TGH-4821-KB',
      chambre: 'bamoun',
      arrivee: versIso(defauts.arrivee),
      depart: versIso(defauts.depart),
      adultes: 2, enfants: 1,
      navette: true,
      paiement: 'orange',
      total: 376000,
      email: 'm.essomba@exemple.cm',
      prenom: 'Marlyse', nom: 'Essomba',
    }, d);

    const ch = chambreParId(dossier.chambre) || chambreParId('bamoun');
    const a = versDate(dossier.arrivee);
    const dep = versDate(dossier.depart);
    const personnes = dossier.adultes + dossier.enfants;

    $('#cf-ref').textContent = dossier.reference;
    $('#cf-ref2').textContent = dossier.reference;
    $('#cf-email').textContent = dossier.email;
    $('#cf-chambre').textContent = ch.nom;
    $('#cf-chambre-desc').textContent = ch.resume;
    $('#cf-personnes').textContent = `${personnes} personnes`;
    $('#cf-personnes-desc').textContent =
      `${dossier.adultes} adulte${dossier.adultes > 1 ? 's' : ''}` +
      (dossier.enfants ? `, ${dossier.enfants} enfant${dossier.enfants > 1 ? 's' : ''}` : '');
    $('#cf-arrivee').textContent = dateLongue(a);
    $('#cf-arrivee-desc').textContent =
      'À partir de 14h' + (dossier.navette ? ', navette prévue' : '');
    $('#cf-depart').textContent = dateLongue(dep);
    $('#cf-total').textContent = fcfa(dossier.total);
    $('#cf-moyen').textContent = MOYENS[dossier.paiement] || 'paiement sur place';

    /* Ajout à l'agenda : fichier .ics généré côté navigateur */
    $('#cf-agenda').addEventListener('click', (e) => {
      e.preventDefault();
      const jour = (dt) => versIso(dt).replace(/-/g, '');
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Toghu Hotel//FR',
        'BEGIN:VEVENT',
        'UID:' + dossier.reference + '@toghu-hotel.cm',
        'DTSTART;VALUE=DATE:' + jour(a),
        'DTEND;VALUE=DATE:' + jour(dep),
        'SUMMARY:Séjour ' + HOTEL.nom + ' — ' + ch.nom,
        'LOCATION:' + HOTEL.adresse + '\\, ' + HOTEL.ville,
        'DESCRIPTION:Référence ' + dossier.reference + '. Arrivée dès 14h\\, départ avant 12h.',
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');

      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = dossier.reference + '.ics';
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    $('#cf-imprimer').addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }

  /* --- Année du pied de page ---------------------------------------------- */

  function initAnnee() {
    $$('[data-annee]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* --- Démarrage ----------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer();
    initLangue();
    initRecherche();
    initVitrine();
    initCatalogue();
    initReservation();
    initConfirmation();
    initAnnee();
  });
})();
