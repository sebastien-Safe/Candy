# PROMPT — C@NDY Mode Démonstration Médecin
## À coller tel quel en début de session

---

## Contexte projet

Tu travailles sur **C@NDY**, une application médicale vanilla JS + HTML déployée en GitHub Pages avec backend **Supabase dédié** (indépendant de S@FE CRM).

**Dépôt local :** `/Users/sebastien/Desktop/Candy/`
**Supabase URL :** `https://dsfhvtkuwvaexybfqbsa.supabase.co`
**Clé publique :** dans `config.js` → `CANDY_SUPABASE_KEY`

### Architecture existante (NE PAS recréer)

**Fichiers :**
- `config.js` — constantes, rôles (`CANDY_ROLES`), permissions (`CANDY_PERMISSIONS`), pages autorisées
- `auth.js` — module `CandyAuth` : `getRole()`, `can()`, `hasRole()`, `requireAuth()`, `login()`, `logout()`
- `patients.html` — liste des patients (523 lignes), charge depuis Supabase, filtre `is_demo=true` pour `medecin_demo`
- `patient-1-dupont-marie.html` — fiche statique demo (HTA, 72 ans, femme)
- `patient-2-bernard-luc.html` — fiche statique demo (lombalgie, homme)
- `patient-3-lefevre-sophie.html` — fiche statique demo (rhinopharyngite, femme)
- `patient-4-moreau-paul.html` — **PATIENT PRINCIPAL DÉMO** (diabète T2, homme) — à enrichir
- `patient-5-petit-isabelle.html` — fiche statique demo (femme)
- `dossier.html` — dossier générique chargé via `?id=UUID` pour les patients réels Supabase
- `login.html`, `admin.html`, `management.html`
- `medicaments.html` — **À CRÉER**
- `demo-banner.js` — **À CRÉER** (bandeau partagé toutes pages)
- `demo-data.js` — **À CRÉER** (jeu de données démo + logique reset)
- `prescription-safety.js` — **À CRÉER** (moteur sécurité médicamenteuse)

**Variables CSS (style inline dans chaque page) :**
```css
--rose:#F2D7D9; --rose-deep:#E8BFC2; --rose-light:#FBF0F1;
--cerise:#C4717A; --cerise-2:#A85860;
--blanc:#FEFAF9; --ardoise:#3D2B2D; --ardoise-2:#5C3F42;
--mut:#8C6A6D; --sauge:#5C7D60; --line:rgba(61,43,45,.1);
--ff-disp:'DM Serif Display',serif; --fb:'Inter',sans-serif;
```

**Rôles existants dans `config.js` :**
```js
CANDY_ROLES = { MEDECIN_DEMO: 'medecin_demo', MEDECIN: 'medecin', SECRETAIRE: 'secretaire', ADMIN_CRM: 'admin_crm' }
CANDY_PERMISSIONS.medecin_demo = ['patients_demo','consultations_demo','ordonnances_demo','agenda_demo','notes_demo']
```

**CDN déjà utilisés :**
- Supabase JS v2 : `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Chart.js v4 : `https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js`

**Dépendances à ajouter (CDN) :**
- jsPDF : `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

**localStorage — clés existantes :**
- `candy_pj_1` à `candy_pj_5` : pièces jointes par patient
- `candy_ob_demo` : flag onboarding vu

**Bug connu :** `toggleDictee()` est appelé dans `patient-1-dupont-marie.html` (ligne 163) mais la fonction n'est pas définie. → À corriger dans cette tâche.

---

## RÈGLES ABSOLUES

1. **Lire chaque fichier entier** avant de le modifier
2. **Ne jamais recréer** une fonctionnalité existante
3. **Ne pas casser** les autres patients (2, 3, 5) ni `dossier.html`, `patients.html`
4. Toute logique métier partagée → fichiers dédiés (`demo-data.js`, `prescription-safety.js`, `demo-banner.js`)
5. Le mode Démo est **entièrement localStorage** — aucun écrit Supabase en mode démo
6. Les données initiales de démo sont **hardcodées** dans `demo-data.js` pour permettre la réinitialisation instantanée

---

## ÉTAPE 1 — Créer `demo-data.js`

Ce fichier contient :
1. Les données initiales figées (snapshot d'origine)
2. Les fonctions de lecture/écriture localStorage
3. La fonction de reset

```js
// ================================================================
// C@NDY — Données de démonstration + gestion localStorage
// ================================================================

const DEMO_PATIENT_ID = 'patient-4'; // Paul Moreau — patient principal

// Clés localStorage
const DEMO_KEYS = {
  constantes:    id => `candy_demo_constantes_${id}`,
  consultations: id => `candy_demo_consultations_${id}`,
  ordonnances:   id => `candy_demo_ordonnances_${id}`,
  documents:     id => `candy_demo_documents_${id}`,
  pj:            id => `candy_pj_${id.replace('patient-','')}`,
  onboarding:    () => 'candy_ob_demo',
  tourVu:        () => 'candy_tour_vu',
};

// ── Données initiales patient-4 (Paul Moreau) ──
const DEMO_INITIAL = {
  'patient-4': {
    constantes: [
      { date:'2026-01-15', tension_sys:148, tension_dia:92, pouls:78, temperature:37.1, sat_o2:97, poids:84 },
      { date:'2026-02-12', tension_sys:144, tension_dia:88, pouls:75, temperature:36.9, sat_o2:98, poids:83 },
      { date:'2026-03-10', tension_sys:142, tension_dia:86, pouls:76, temperature:37.0, sat_o2:98, poids:83 },
      { date:'2026-04-08', tension_sys:138, tension_dia:84, pouls:74, temperature:36.8, sat_o2:99, poids:82 },
      { date:'2026-05-14', tension_sys:140, tension_dia:85, pouls:77, temperature:37.0, sat_o2:98, poids:82 },
      { date:'2026-06-18', tension_sys:136, tension_dia:82, pouls:73, temperature:36.9, sat_o2:99, poids:81 },
    ],
    consultations: [
      {
        id:'c1', date:'2026-01-15',
        motif:'Suivi diabète T2 et HTA trimestriel',
        compte_rendu:'Patient vu ce jour pour suivi trimestriel. PA : 148/92 mmHg. Glycémie à jeun : 1,38 g/L. HbA1c : 7,2%. Poids : 84 kg. Traitement bien toléré. Légère asthénie signalée.',
        prescription:'Metformine 1000mg — 1 cp matin et soir\nRamipril 5mg — 1 cp matin\nAtorvastatin 20mg — 1 cp soir',
        examens:['Biologie : HbA1c + bilan lipidique à 3 mois'],
        medecin:'Dr. Martin'
      },
      {
        id:'c2', date:'2026-03-10',
        motif:'Renouvellement traitement + bilan lipidique',
        compte_rendu:'PA : 142/86 mmHg. Amélioration tensionnelle. HbA1c : 7,0%. LDL : 1,12 g/L. Objectifs en bonne voie. Poids stable à 83 kg. Pas d\'effet indésirable rapporté.',
        prescription:'Metformine 1000mg — 1 cp matin et soir\nRamipril 5mg — 1 cp matin\nAtorvastatin 20mg — 1 cp soir',
        examens:[],
        medecin:'Dr. Martin'
      },
      {
        id:'c3', date:'2026-06-18',
        motif:'Consultation de suivi — douleur thoracique atypique',
        compte_rendu:'Patient se plaint d\'une douleur thoracique atypique depuis 3 jours. ECG normal. PA : 136/82 mmHg. Pas de fièvre. Saturation à 99%. Diagnostic : probable douleur musculo-squelettique. Surveillance conseillée.',
        prescription:'Paracétamol 1g — 3x/jour pendant 5 jours si douleur',
        examens:['ECG : tracé normal','Imagerie : radio thorax si persistance'],
        medecin:'Dr. Martin'
      }
    ],
    ordonnances: [
      {
        id:'o1', numero:'DEMO-2026-012', date:'2026-01-15',
        contenu:'Metformine 1000mg — 1 cp matin et soir — 3 mois\nRamipril 5mg — 1 cp matin — 3 mois\nAtorvastatin 20mg — 1 cp soir — 3 mois\n\nSurveillance : glycémie à jeun mensuelle',
        medecin:'Dr. Martin'
      },
      {
        id:'o2', numero:'DEMO-2026-031', date:'2026-03-10',
        contenu:'Renouvellement :\nMetformine 1000mg — 1 cp matin et soir — 3 mois\nRamipril 5mg — 1 cp matin — 3 mois\nAtorvastatin 20mg — 1 cp soir — 3 mois',
        medecin:'Dr. Martin'
      }
    ],
    documents: [
      { id:'d1', nom:'Bilan biologique Jan 2026', type:'biologie', date:'2026-01-20', contenu:'HbA1c : 7,2% (N<7%)\nGlycémie à jeun : 1,38 g/L (N:0,70-1,10)\nLDL cholestérol : 1,42 g/L (N<1,30)\nHDL : 0,58 g/L (N>0,40)\nTriglyérides : 1,68 g/L (N<1,50)\nCréatinine : 82 µmol/L (N:60-110)\nDFG : 78 mL/min (N>60)' },
      { id:'d2', nom:'ECG Juin 2026', type:'ecg', date:'2026-06-18', contenu:'Rythme sinusal régulier\nFC : 73 bpm\nPR : 162 ms (normal)\nQRS : 88 ms (normal)\nQTc : 410 ms (normal)\nAxe : +45° (normal)\nConclusion : ECG normal, pas d\'anomalie de repolarisation' },
      { id:'d3', nom:'Radio thorax Mai 2026', type:'imagerie', date:'2026-05-14', contenu:'Parenchyme pulmonaire : normal\nSilhouette cardiaque : index cardio-thoracique 0,49 (normal)\nHiles : non dilatés\nPlèvres : libres\nConclusion : pas d\'anomalie pleuropulmonaire' },
    ]
  }
};

// ── API localStorage ──
function demoGet(type, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const key  = DEMO_KEYS[type]?.(patientId);
  if (!key) return [];
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  // Initialisation depuis les données figées si pas encore en localStorage
  const initial = DEMO_INITIAL[patientId]?.[type] || [];
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

function demoSet(type, data, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const key = DEMO_KEYS[type]?.(patientId);
  if (key) localStorage.setItem(key, JSON.stringify(data));
}

function demoAdd(type, item, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const list = demoGet(type, patientId);
  list.push({ ...item, id: item.id || ('demo_' + Date.now()) });
  demoSet(type, list, patientId);
  return list;
}

// ── RESET COMPLET ──
function resetDemo() {
  if (!confirm('Réinitialiser toutes les données de démonstration ? Cette action est irréversible.')) return;
  // Effacer toutes les clés démo
  Object.keys(localStorage).filter(k => k.startsWith('candy_demo_') || k.startsWith('candy_pj_') || k === 'candy_ob_demo' || k === 'candy_tour_vu').forEach(k => localStorage.removeItem(k));
  // Réinjecter les données initiales
  Object.entries(DEMO_INITIAL).forEach(([pid, data]) => {
    Object.entries(data).forEach(([type, values]) => {
      localStorage.setItem(DEMO_KEYS[type]?.(pid), JSON.stringify(values));
    });
  });
  // Feedback visuel
  const btn = document.getElementById('demo-reset-btn');
  if (btn) { btn.textContent = '✅ Réinitialisé !'; setTimeout(() => { btn.innerHTML = '♻ Réinitialiser la démo'; }, 2000); }
}
```

---

## ÉTAPE 2 — Créer `prescription-safety.js`

Moteur centralisé de sécurité médicamenteuse. **Ne jamais dupliquer cette logique.**

```js
// ================================================================
// C@NDY — Moteur de sécurité médicamenteuse (démo)
// Appelé depuis : patient-4, ordonnances, medicaments.html
// ================================================================

// Base médicaments démo (nom, dci, classe, contre-indications, interactions)
const DEMO_MEDICATIONS = [
  // Cardio / HTA
  { id:'m01', nom:'Ramipril 5mg',      dci:'ramipril',      classe:'IEC',            ci:['angioedeme','grossesse'], interactions:['potassium','lithium','AINS'], surveillance:['fonction_renale','kaliemie'] },
  { id:'m02', nom:'Amlodipine 5mg',    dci:'amlodipine',    classe:'ICC',            ci:[], interactions:['simvastatine_haute_dose'], surveillance:['tension'] },
  { id:'m03', nom:'Bisoprolol 5mg',    dci:'bisoprolol',    classe:'beta_bloquant',  ci:['asthme','bradycardie'], interactions:['verapamil','diltiazem'], surveillance:['frequence_cardiaque'] },
  { id:'m04', nom:'Furosémide 40mg',   dci:'furosemide',    classe:'diuretique',     ci:[], interactions:['lithium','AINS','aminosides'], surveillance:['kaliemie','natremie'] },
  // Diabète
  { id:'m05', nom:'Metformine 1000mg', dci:'metformine',    classe:'biguanide',      ci:['insuffisance_renale_severe','produit_contraste_iode'], interactions:['alcool','contraste_iode'], surveillance:['fonction_renale','glycemie'] },
  { id:'m06', nom:'Sitagliptine 100mg',dci:'sitagliptine',  classe:'gliptine',       ci:[], interactions:[], surveillance:['fonction_renale'] },
  { id:'m07', nom:'Insuline Lispro',   dci:'insuline_lispro',classe:'insuline',      ci:[], interactions:['beta_bloquant','alcool'], surveillance:['glycemie'] },
  // Antibiotiques
  { id:'m08', nom:'Amoxicilline 1g',   dci:'amoxicilline',  classe:'penicilline',    ci:['allergie_penicilline'], interactions:['methotrexate','anticoagulants'], surveillance:[] },
  { id:'m09', nom:'Augmentin 1g',      dci:'amoxicilline_acide_clavulanique', classe:'penicilline', ci:['allergie_penicilline','allergie_amoxicilline'], interactions:[], surveillance:[] },
  { id:'m10', nom:'Azithromycine 500mg',dci:'azithromycine',classe:'macrolide',      ci:[], interactions:['amiodarone','anticoagulants_oraux'], surveillance:['intervalle_qt'] },
  { id:'m11', nom:'Ciprofloxacine 500mg',dci:'ciprofloxacine',classe:'fluoroquinolone',ci:['epilepsie'], interactions:['AINS','anticoagulants','theophylline'], surveillance:['tendon'] },
  // Antalgiques
  { id:'m12', nom:'Paracétamol 1g',    dci:'paracetamol',   classe:'antalgique',     ci:['insuffisance_hepatique_severe'], interactions:['alcool'], surveillance:[] },
  { id:'m13', nom:'Ibuprofène 400mg',  dci:'ibuprofene',    classe:'AINS',           ci:['insuffisance_renale','ulcere','grossesse_3e_trim'], interactions:['ramipril','furosemide','aspirine','lithium'], surveillance:['tension','fonction_renale'] },
  { id:'m14', nom:'Tramadol 50mg',     dci:'tramadol',      classe:'opioide_faible', ci:['epilepsie_non_controlee'], interactions:['ISRS','IMAO','antidepresseurs'], surveillance:['conscience','respiration'] },
  // Statines
  { id:'m15', nom:'Atorvastatin 20mg', dci:'atorvastatin',  classe:'statine',        ci:['insuffisance_hepatique','grossesse'], interactions:['fibrates','ciclosporine','macrolide'], surveillance:['CPK','transaminases'] },
  // Anticoagulants
  { id:'m16', nom:'Rivaroxaban 20mg',  dci:'rivaroxaban',   classe:'anticoagulant',  ci:['saignement_actif'], interactions:['AINS','aspirine','azithromycine'], surveillance:['saignement','fonction_renale'] },
  // Divers
  { id:'m17', nom:'Levothyrox 75µg',   dci:'levothyroxine', classe:'hormone_thyroidienne', ci:[], interactions:['calcium','fer','antiacides'], surveillance:['TSH'] },
  { id:'m18', nom:'Oméprazole 20mg',   dci:'omeprazole',    classe:'IPP',            ci:[], interactions:['clopidogrel','methotrexate'], surveillance:[] },
  { id:'m19', nom:'Alprazolam 0.25mg', dci:'alprazolam',    classe:'benzodiazepine', ci:['insuffisance_respiratoire','apnee_sommeil'], interactions:['alcool','opioides','antihistaminiques'], surveillance:['somnolence','dependance'] },
  { id:'m20', nom:'Prednisolone 20mg', dci:'prednisolone',  classe:'corticoide',     ci:['infection_non_traitee'], interactions:['AINS','anticoagulants','diuretiques'], surveillance:['glycemie','tension','osteoporose'] },
];

// Profil allergies + conditions par patient démo
const DEMO_PATIENT_PROFILES = {
  'patient-4': {
    allergies:   ['allergie_penicilline'],
    conditions:  ['diabete_t2', 'hta', 'hypercholesterolemie'],
    traitements: ['metformine', 'ramipril', 'atorvastatin'],
    grossesse:   false,
  },
  'patient-1': {
    allergies:   [],
    conditions:  ['hta'],
    traitements: ['amlodipine', 'bisoprolol'],
    grossesse:   false,
  },
};

/**
 * checkPrescriptionSafety(medicamentDci, patientId)
 * Retourne { level: null|'surveillance'|'majeure'|'critique', message: string, canPrescribe: boolean }
 */
function checkPrescriptionSafety(medicamentDci, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const profile = DEMO_PATIENT_PROFILES[patientId] || { allergies:[], conditions:[], traitements:[], grossesse:false };
  const med = DEMO_MEDICATIONS.find(m => m.dci === medicamentDci || m.nom.toLowerCase().includes(medicamentDci.toLowerCase()));
  if (!med) return { level: null, message: '', canPrescribe: true };

  const alerts = [];

  // 🔴 Contre-indications critiques
  const critiques = med.ci.filter(ci => {
    if (profile.allergies.includes(ci)) return true;
    if (ci === 'grossesse' && profile.grossesse) return true;
    if (ci === 'insuffisance_renale_severe' && profile.conditions.includes('insuffisance_renale_severe')) return true;
    return false;
  });
  if (critiques.length) {
    return {
      level: 'critique',
      message: `🔴 CONTRE-INDICATION CRITIQUE : ${critiques.map(c => c.replace(/_/g,' ')).join(', ')}. Prescription impossible.`,
      canPrescribe: false,
      details: critiques,
    };
  }

  // 🟠 Interactions majeures avec traitement en cours
  const interactions = med.interactions.filter(i =>
    profile.traitements.some(t => t.includes(i) || i.includes(t)) ||
    (i === 'AINS' && med.classe === 'AINS' && profile.traitements.includes('ramipril'))
  );
  if (interactions.length) {
    alerts.push({
      level: 'majeure',
      message: `🟠 INTERACTION MAJEURE avec traitement en cours : ${interactions.map(i=>i.replace(/_/g,' ')).join(', ')}. Confirmation requise.`,
    });
  }

  // 🟡 Surveillance recommandée
  if (med.surveillance.length) {
    alerts.push({
      level: 'surveillance',
      message: `🟡 Surveillance recommandée : ${med.surveillance.map(s=>s.replace(/_/g,' ')).join(', ')}.`,
    });
  }

  if (!alerts.length) return { level: null, message: 'Aucune alerte.', canPrescribe: true };
  const worst = alerts.find(a => a.level === 'majeure') || alerts[0];
  return {
    level: worst.level,
    message: worst.message,
    canPrescribe: worst.level !== 'critique',
    allAlerts: alerts,
  };
}

function findMedication(query) {
  query = (query || '').toLowerCase().trim();
  if (!query) return [];
  return DEMO_MEDICATIONS.filter(m =>
    m.nom.toLowerCase().includes(query) ||
    m.dci.toLowerCase().includes(query) ||
    m.classe.toLowerCase().includes(query)
  );
}
```

---

## ÉTAPE 3 — Créer `demo-banner.js`

Bandeau fixe affiché sur **toutes les pages**. Chaque page doit l'inclure avec `<script src="demo-banner.js"></script>` juste avant `</body>`.

```js
// ================================================================
// C@NDY — Bandeau de sélection du mode Démonstration
// À inclure dans TOUTES les pages (patients.html, patient-*.html)
// ================================================================

(function() {
  const DEMO_ROLE_KEY = 'candy_demo_active_role';

  const PROFILES = [
    { id:'medecin',    label:'👨‍⚕️ Médecin',    available: true },
    { id:'infirmier',  label:'👩‍⚕️ Infirmier',   available: false },
    { id:'secretaire', label:'👩‍💼 Secrétaire',  available: false },
  ];

  function getActiveRole() { return localStorage.getItem(DEMO_ROLE_KEY) || null; }
  function setActiveRole(role) { localStorage.setItem(DEMO_ROLE_KEY, role); applyRole(role); updateBannerUI(); }

  function applyRole(role) {
    // Dispatch un événement pour que les pages réagissent
    document.dispatchEvent(new CustomEvent('candy:demo-role-changed', { detail: { role } }));
  }

  function updateBannerUI() {
    const active = getActiveRole();
    PROFILES.forEach(p => {
      const btn = document.getElementById(`demo-role-${p.id}`);
      if (!btn) return;
      btn.classList.toggle('active', active === p.id);
    });
  }

  function injectBanner() {
    if (document.getElementById('candy-demo-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'candy-demo-banner';
    banner.style.cssText = [
      'position:fixed','bottom:0','left:0','right:0','z-index:9999',
      'background:rgba(196,113,122,0.92)','backdrop-filter:blur(10px)',
      'border-top:1px solid rgba(255,255,255,0.2)',
      'padding:8px 20px','display:flex','align-items:center',
      'gap:10px','flex-wrap:wrap','justify-content:center',
    ].join(';');

    const label = document.createElement('span');
    label.style.cssText = 'font-size:.65rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);white-space:nowrap;font-family:Inter,sans-serif';
    label.textContent = 'MODE DÉMONSTRATION';
    banner.appendChild(label);

    PROFILES.forEach(p => {
      const btn = document.createElement('button');
      btn.id = `demo-role-${p.id}`;
      btn.textContent = p.label;
      btn.disabled = !p.available;
      btn.style.cssText = [
        'font-family:Inter,sans-serif','font-size:.78rem','font-weight:600',
        'padding:5px 12px','border-radius:6px','cursor:p.available?"pointer":"not-allowed"',
        'border:1px solid rgba(255,255,255,0.3)','transition:all .18s',
        `opacity:${p.available ? '1' : '0.45'}`,
        'background:transparent','color:#fff',
        `title:"${p.available ? '' : 'Bientôt disponible'}"`,
      ].join(';');
      if (p.available) {
        btn.onclick = () => setActiveRole(p.id);
        btn.onmouseover = () => { if (getActiveRole() !== p.id) btn.style.background = 'rgba(255,255,255,0.15)'; };
        btn.onmouseout  = () => { if (getActiveRole() !== p.id) btn.style.background = 'transparent'; };
      } else {
        btn.title = 'Bientôt disponible';
      }
      banner.appendChild(btn);
    });

    // Séparateur
    const sep = document.createElement('div');
    sep.style.cssText = 'width:1px;height:20px;background:rgba(255,255,255,.25);margin:0 4px';
    banner.appendChild(sep);

    // Bouton reset
    const resetBtn = document.createElement('button');
    resetBtn.id = 'demo-reset-btn';
    resetBtn.innerHTML = '♻ Réinitialiser la démo';
    resetBtn.style.cssText = [
      'font-family:Inter,sans-serif','font-size:.72rem','font-weight:600',
      'padding:5px 12px','border-radius:6px','cursor:pointer',
      'border:1px solid rgba(255,255,255,0.3)','background:transparent','color:#fff',
      'transition:all .18s',
    ].join(';');
    resetBtn.onclick = () => { if (typeof resetDemo === 'function') resetDemo(); };
    banner.appendChild(resetBtn);

    // Bouton 🎯 Parcours guidé
    const tourBtn = document.createElement('button');
    tourBtn.id = 'demo-tour-btn';
    tourBtn.innerHTML = '🎯 Découvrir le CRM';
    tourBtn.style.cssText = [
      'font-family:Inter,sans-serif','font-size:.72rem','font-weight:600',
      'padding:5px 12px','border-radius:6px','cursor:pointer',
      'border:1px solid rgba(255,255,255,0.5)','background:rgba(255,255,255,0.15)','color:#fff',
      'transition:all .18s',
    ].join(';');
    tourBtn.onclick = () => { if (typeof startDemoTour === 'function') startDemoTour(); };
    banner.appendChild(tourBtn);

    document.body.appendChild(banner);

    // Ajouter padding-bottom au body pour ne pas cacher le contenu
    document.body.style.paddingBottom = '52px';

    updateBannerUI();

    // Appliquer le rôle actif au chargement
    const currentRole = getActiveRole();
    if (currentRole) applyRole(currentRole);
  }

  // Injection après chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBanner);
  } else {
    injectBanner();
  }

  // Exposer pour usage externe
  window.CandyDemo = { getActiveRole, setActiveRole, applyRole };
})();
```

---

## ÉTAPE 4 — Enrichir `patient-4-moreau-paul.html` (patient principal démo)

Lire le fichier en entier AVANT de le modifier.

### 4a. Mettre à jour l'en-tête hero avec données complètes :
- **Paul Moreau**, 67 ans (né le 15/09/1958), homme, groupe O+
- Pathologies : HTA + Diabète T2 + Hypercholestérolémie
- **⚠️ Allergie pénicilline** (badge rouge visible dans le hero)
- Traitement chronique : Metformine 1000mg, Ramipril 5mg, Atorvastatin 20mg
- N° SS fictif (démo) : `1 58 09 75 049 XXX YY`

### 4b. Structure des onglets (ajouter/compléter) :
```
📋 Informations | 📊 Constantes | 📅 Historique | 📄 Ordonnances | 📁 Documents
```

### 4c. Onglet Constantes — remplacer le graphique statique :

Le graphique doit être **dynamique**, alimenté par `demoGet('constantes', 'patient-4')`.

**Bouton ➕ Ajouter une constante** ouvre une modale inline avec les champs :
- Tension systolique (mmHg)
- Tension diastolique (mmHg)
- Pouls (bpm)
- Température (°C)
- Saturation O₂ (%)
- Poids (kg)
- Date (default: aujourd'hui)

À la validation :
1. `demoAdd('constantes', newConstante, 'patient-4')`
2. Mise à jour du graphique Chart.js sans rechargement
3. Mise à jour des tuiles de résumé (valeurs actuelles)

Le graphique affiche : Tension systolique (rouge), Tension diastolique (rose), Poids (violet).

### 4d. Onglet Historique — charger depuis localStorage :

Charger `demoGet('consultations', 'patient-4')` et afficher chaque consultation avec :
- Date, motif, compte-rendu, prescription, examens, médecin

### 4e. Onglet Ordonnances — charger depuis localStorage + jsPDF :

- Liste des ordonnances depuis `demoGet('ordonnances', 'patient-4')`
- Formulaire nouvelle ordonnance avec textarea
- Moteur de sécurité : à chaque ligne saisie contenant un nom de médicament connu, appeler `checkPrescriptionSafety()` et afficher l'alerte
- Bouton "Générer PDF" → jsPDF avec :
  - En-tête : "Médecin Démo S@FE — Document de démonstration"
  - Filigrane diagonal "DÉMONSTRATION" (texte gris clair, 45°, répété)
  - Pas de N° RPPS réel ni d'identifiant médical authentique

### 4f. Onglet Documents — charger depuis localStorage :

Afficher `demoGet('documents', 'patient-4')` sous forme de cartes (PDF fictifs) avec :
- Icône selon type (🧪 biologie, ❤️ ECG, 🫁 imagerie)
- Clic → modale d'aperçu avec le contenu texte simulé

### 4g. Microphone — corriger `toggleDictee()` :

**Le bug** : `toggleDictee()` est appelé mais jamais défini. À corriger dans TOUS les fichiers patient.

Créer la fonction globale dans chaque fichier patient ET dans `demo-banner.js` :

```js
// Fonction unique — facilite migration future vers Whisper HDS
function speechToText(targetId, onResult) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Dictée vocale non supportée par ce navigateur. Utilisez Chrome ou Edge.');
    return null;
  }
  const rec = new SpeechRecognition();
  rec.lang = 'fr-FR';
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = e => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    if (typeof onResult === 'function') onResult(transcript, e.results[e.results.length-1].isFinal);
  };
  rec.onerror = e => console.warn('[C@NDY] SpeechRecognition error:', e.error);
  return rec;
}

// Mots-clés pour structuration automatique
const STRUCTURE_KEYWORDS = {
  date:        ['vu ce jour','consulté le','en date du','aujourd\'hui'],
  motif:       ['pour ','motif ','vient pour','consulte pour','venu pour'],
  constantes:  ['tension','pa :','ta :','mmhg','poids','saturation','pouls','température','fréquence'],
  prescription:['prescription','ordonnance','prescrit','renouveler','traitement','posologie','1 cp','2 cp','matin','soir'],
  examens:     ['bilan','biologie','radio','échographie','ecg','scanner','irm','analyse'],
  observations:['patient ','signale','rapporte','se plaint','présente','examen ','auscultation'],
};

function structureNote(text) {
  const lines = text.split(/[.!?]+/).map(l => l.trim()).filter(Boolean);
  const result = { date:'', motif:'', observations:'', constantes:'', prescription:'', examens:'', commentaires:'' };
  lines.forEach(line => {
    const ll = line.toLowerCase();
    if (STRUCTURE_KEYWORDS.date.some(k => ll.includes(k)))         result.date += line + '. ';
    else if (STRUCTURE_KEYWORDS.prescription.some(k => ll.includes(k))) result.prescription += line + '. ';
    else if (STRUCTURE_KEYWORDS.constantes.some(k => ll.includes(k)))   result.constantes  += line + '. ';
    else if (STRUCTURE_KEYWORDS.examens.some(k => ll.includes(k)))      result.examens     += line + '. ';
    else if (STRUCTURE_KEYWORDS.motif.some(k => ll.includes(k)))        result.motif       += line + '. ';
    else result.observations += line + '. ';
  });
  return result;
}

let _micRec = null;
let _micActive = false;
function toggleDictee(targetId, structureTargets) {
  targetId = targetId || 'suivi-notes';
  const btn = document.getElementById('mic-btn');
  if (_micActive && _micRec) {
    _micRec.stop();
    _micActive = false;
    if (btn) { btn.style.background='rgba(196,113,122,.1)'; btn.title='Dictée vocale'; }
    return;
  }
  _micRec = speechToText(targetId, (transcript, isFinal) => {
    const ta = document.getElementById(targetId);
    if (ta) ta.value = transcript;
    if (isFinal && structureTargets) {
      const structured = structureNote(transcript);
      Object.entries(structureTargets).forEach(([field, elId]) => {
        const el = document.getElementById(elId);
        if (el && structured[field]) el.value = (el.value ? el.value + '\n' : '') + structured[field].trim();
      });
    }
  });
  if (_micRec) {
    _micRec.start();
    _micActive = true;
    if (btn) { btn.style.background='rgba(196,113,122,.35)'; btn.title='Arrêter la dictée'; }
  }
}
```

### 4h. Ajouter le raccourci 💊 Médicaments dans la nav :

Dans le `<nav>` de `patient-4-moreau-paul.html`, ajouter :
```html
<a href="medicaments.html?from=patient-4" class="btn-nav" style="font-size:1rem" title="Médicaments">💊</a>
```

### 4i. Ajouter les scripts en fin de body :
```html
<script src="demo-data.js"></script>
<script src="prescription-safety.js"></script>
<script src="demo-banner.js"></script>
```

---

## ÉTAPE 5 — Créer `medicaments.html`

Page séparée accessible via 💊 depuis les dossiers patients.

**Structure :**
```html
<nav> C@NDY — 💊 Médicaments — [← Retour au dossier] </nav>
<div class="page">
  <input id="med-search" placeholder="Rechercher un médicament (nom, DCI, classe)...">
  <div id="med-results"></div>
</div>
```

**Comportement JS :**
- Recherche instantanée (oninput) dans `DEMO_MEDICATIONS` via `findMedication(query)`
- Affichage en grille de cartes : nom commercial + dosage + classe
- **Clic sur une carte** → expand avec :
  - DCI, classe thérapeutique
  - Posologie standard
  - Contre-indications
  - `checkPrescriptionSafety(dci, patientId)` → afficher le niveau d'alerte pour le patient courant
- `patientId` récupéré depuis `?from=patient-4` dans l'URL

**Design :** reprend les variables CSS de C@NDY, cards `.bloc` existant.

---

## ÉTAPE 6 — Parcours de démonstration guidé (overlay spotlight)

Ajouter la fonction `startDemoTour()` dans un bloc `<script>` commun (ou dans `demo-banner.js`).

**9 étapes :**
```js
const TOUR_STEPS = [
  { target: '.patient-card[data-patient="patient-4"]', // sur patients.html
    title: 'Étape 1 — Ouvrir le dossier patient',
    text: 'Paul Moreau, 67 ans — patient principal de démonstration. HTA, Diabète T2, allergie pénicilline.', },
  { target: '#tab-constantes', title: 'Étape 2 — Constantes',
    text: 'Consultez l\'évolution des constantes : tension, poids, saturation O₂ sur 6 mois.' },
  { target: '#btn-add-constante', title: 'Étape 3 — Ajouter une constante',
    text: 'Saisissez de nouvelles constantes vitales. Le graphique se met à jour instantanément.' },
  { target: '#chart-const', title: 'Étape 4 — Graphique mis à jour',
    text: 'Le graphique reflète automatiquement la nouvelle saisie, sans rechargement.' },
  { target: '#tab-historique', title: 'Étape 5 — Créer une consultation',
    text: 'Accédez à l\'historique des consultations et créez-en une nouvelle.' },
  { target: '#mic-btn', title: 'Étape 6 — Dictée vocale',
    text: 'Le microphone transcrit la voix du médecin et structure automatiquement le compte-rendu.' },
  { target: '#btn-add-medicament', title: 'Étape 7 — Ajouter un médicament',
    text: 'Recherchez un médicament et ajoutez-le à l\'ordonnance.' },
  { target: '#alert-penicilline', title: 'Étape 8 — Alerte allergie 🔴',
    text: 'Si vous prescrivez de l\'amoxicilline : alerte critique (allergie pénicilline connue). Prescription bloquée.' },
  { target: '#btn-generate-pdf', title: 'Étape 9 — Ordonnance PDF',
    text: 'Générez l\'ordonnance en PDF avec filigrane DÉMONSTRATION. Prêt à imprimer ou envoyer.' },
];
```

**Mécanique spotlight :**
- Overlay sombre `position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99998`
- Découpe transparente autour de l'élément ciblé (clip-path ou box-shadow trick)
- Bulle d'info (titre + texte + "Suivant →" / "Terminer")
- Navigation précédent/suivant
- Fermeture par touche Échap ou clic hors spotlight

---

## ÉTAPE 7 — Corriger le microphone dans tous les fichiers patient

**Patient-1 (Marie Dupont)** : `toggleDictee()` défini mais non implémenté → remplacer par appel à la vraie fonction.

**Patients 2, 3, 5** : vérifier si le bouton micro existe → si oui, brancher sur la même fonction `toggleDictee()`. Si absent, ajouter le bouton dans la section notes/suivi.

**IMPORTANT** : `speechToText()` et `toggleDictee()` sont définis UNE SEULE FOIS dans `demo-banner.js` (inclus sur toutes les pages). Ne pas les redéfinir dans chaque fichier patient.

---

## ÉTAPE 8 — Mettre à jour `patients.html`

Ajouter en fin de `<body>` :
```html
<script src="demo-data.js"></script>
<script src="demo-banner.js"></script>
```

Ajouter `data-patient="patient-4"` sur la carte de Moreau Paul dans le rendu des patients démo (pour que le tour guidé puisse cibler cet élément).

---

## ÉTAPE 9 — Corriger `patient-1-dupont-marie.html` (bug micro)

Ajouter les scripts manquants en fin de body :
```html
<script src="demo-data.js"></script>
<script src="prescription-safety.js"></script>
<script src="demo-banner.js"></script>
```

La fonction `toggleDictee()` sera alors disponible via `demo-banner.js`. Supprimer tout appel `onclick="toggleDictee()"` qui pointe vers une fonction inexistante et vérifier que le bouton micro pointe vers la version correcte.

---

## Ordre d'exécution

1. Lire **tous** les fichiers existants entiers
2. Créer `demo-data.js`
3. Créer `prescription-safety.js`
4. Créer `demo-banner.js` (avec `speechToText`, `toggleDictee`, `structureNote`, spotlight tour)
5. Enrichir `patient-4-moreau-paul.html` (patient principal)
6. Créer `medicaments.html`
7. Corriger le micro dans `patient-1-dupont-marie.html`
8. Ajouter les scripts dans `patients.html`
9. Vérifier micro dans patients 2, 3, 5

---

## Points de vigilance

- `demo-data.js` doit être chargé **avant** `demo-banner.js` et `prescription-safety.js`
- Le bandeau a un `z-index:9999` — vérifier qu'il ne cache pas les modales existantes (les modales doivent avoir `z-index` supérieur)
- jsPDF CDN : `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` — ajouter dans les pages qui génèrent des PDF (patient-4 + medicaments.html)
- La Web Speech API fonctionne uniquement sur HTTPS et avec Chrome/Edge — afficher un message si non supporté
- `resetDemo()` est dans `demo-data.js` et appelé par le bouton du bandeau via `window.resetDemo` — s'assurer que `demo-data.js` est chargé avant `demo-banner.js`
- Ne jamais inclure de vrais N° RPPS, ADELI, N° SS réels dans les données démo
