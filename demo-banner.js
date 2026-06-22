// ================================================================
// C@NDY — Bandeau démo + dictée vocale + parcours guidé
// Inclure en fin de <body> sur TOUTES les pages patient
// Charger APRÈS demo-data.js
// ================================================================

// ── Dictée vocale (global) ──────────────────────────────────────

const STRUCTURE_KEYWORDS = {
  date:        ["vu ce jour","consulté le","en date du","aujourd'hui"],
  motif:       ["pour ","motif ","vient pour","consulte pour","venu pour"],
  constantes:  ["tension","pa :","ta :","mmhg","poids","saturation","pouls","température","fréquence"],
  prescription:["prescription","ordonnance","prescrit","renouveler","traitement","posologie","1 cp","2 cp","matin","soir"],
  examens:     ["bilan","biologie","radio","échographie","ecg","scanner","irm","analyse"],
  observations:["patient ","signale","rapporte","se plaint","présente","examen ","auscultation"],
};

function structureNote(text) {
  const lines  = text.split(/[.!?]+/).map(l => l.trim()).filter(Boolean);
  const result = { date:'', motif:'', observations:'', constantes:'', prescription:'', examens:'', commentaires:'' };
  lines.forEach(line => {
    const ll = line.toLowerCase();
    if      (STRUCTURE_KEYWORDS.date.some(k        => ll.includes(k))) result.date         += line + '. ';
    else if (STRUCTURE_KEYWORDS.prescription.some(k => ll.includes(k))) result.prescription += line + '. ';
    else if (STRUCTURE_KEYWORDS.constantes.some(k   => ll.includes(k))) result.constantes   += line + '. ';
    else if (STRUCTURE_KEYWORDS.examens.some(k       => ll.includes(k))) result.examens      += line + '. ';
    else if (STRUCTURE_KEYWORDS.motif.some(k         => ll.includes(k))) result.motif        += line + '. ';
    else result.observations += line + '. ';
  });
  return result;
}

function speechToText(targetId, onResult) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('Dictée vocale non supportée.\nUtilisez Chrome ou Edge (HTTPS requis).');
    return null;
  }
  const rec = new SR();
  rec.lang            = 'fr-FR';
  rec.continuous      = true;
  rec.interimResults  = true;
  rec.onresult = e => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    const isFinal    = e.results[e.results.length - 1].isFinal;
    if (typeof onResult === 'function') onResult(transcript, isFinal);
  };
  rec.onerror = e => {
    console.warn('[C@NDY] SpeechRecognition:', e.error);
    _micActive = false;
    _micRec = null;
    const btn = document.getElementById('mic-btn');
    if (btn) { btn.style.background = 'rgba(196,113,122,.1)'; btn.title = 'Dictée vocale'; }
    const status = document.getElementById('dictee-status');
    if (status) status.style.display = 'none';
    if (e.error === 'not-allowed') alert('Accès au microphone refusé.\nAutorisez-le dans les paramètres du navigateur.');
    else if (e.error === 'no-speech') alert('Aucune voix détectée. Vérifiez votre microphone et réessayez.');
  };
  rec.onend = () => {
    if (_micActive) {
      _micActive = false;
      _micRec = null;
      const btn = document.getElementById('mic-btn');
      if (btn) { btn.style.background = 'rgba(196,113,122,.1)'; btn.title = 'Dictée vocale'; }
      const status = document.getElementById('dictee-status');
      if (status) status.style.display = 'none';
    }
  };
  return rec;
}

let _micRec    = null;
let _micActive = false;

function toggleDictee(targetId, structureTargets) {
  targetId = targetId || 'suivi-notes';
  const btn    = document.getElementById('mic-btn');
  const status = document.getElementById('dictee-status');
  if (_micActive && _micRec) {
    _micRec.stop();
    _micActive = false;
    _micRec = null;
    if (btn) { btn.style.background = 'rgba(196,113,122,.1)'; btn.title = 'Dictée vocale'; }
    if (status) status.style.display = 'none';
    return;
  }
  _micRec = speechToText(targetId, (transcript, isFinal) => {
    const ta = document.getElementById(targetId);
    if (ta) ta.value = transcript;
    if (ta && typeof ta.oninput === 'function') ta.oninput();
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
    if (btn) { btn.style.background = 'rgba(196,113,122,.35)'; btn.title = 'Arrêter la dictée'; }
    if (status) { status.textContent = '🎙️ Dictée en cours — parlez maintenant…'; status.style.display = 'block'; }
  }
}

// ── Parcours guidé spotlight (global) ──────────────────────────

const TOUR_STEPS_PATIENTS = [
  {
    selector: '.patient-card[data-patient="patient-4"]',
    title:    'Étape 1 — Dossier patient',
    text:     'Paul Moreau, 67 ans — patient principal de démonstration. HTA, Diabète T2, allergie pénicilline. Cliquez pour ouvrir son dossier.',
    action:   null,
  },
];

const TOUR_STEPS_DOSSIER = [
  {
    selector: '#tab-btn-constantes',
    title:    'Étape 1 — Constantes',
    text:     'Consultez l\'évolution des constantes : tension, poids, saturation O₂ sur 6 mois.',
    action:   () => { const b = document.getElementById('tab-btn-constantes'); if(b) b.click(); },
  },
  {
    selector: '#btn-add-constante',
    title:    'Étape 2 — Ajouter une constante',
    text:     'Saisissez de nouvelles constantes vitales. Le graphique se met à jour instantanément.',
    action:   null,
  },
  {
    selector: '#chart-const',
    title:    'Étape 3 — Graphique dynamique',
    text:     'Le graphique reflète en temps réel toutes vos saisies, sans rechargement de page.',
    action:   null,
  },
  {
    selector: '#tab-btn-historique',
    title:    'Étape 4 — Historique des consultations',
    text:     'Accédez à l\'historique complet : comptes-rendus, prescriptions, examens demandés.',
    action:   () => { const b = document.getElementById('tab-btn-historique'); if(b) b.click(); },
  },
  {
    selector: '#mic-btn',
    title:    'Étape 5 — Dictée vocale',
    text:     'Le microphone transcrit la voix du médecin et structure automatiquement le compte-rendu (motif, constantes, prescription, examens).',
    action:   null,
  },
  {
    selector: '#tab-btn-ordonnances',
    title:    'Étape 6 — Ordonnances',
    text:     'Rédigez une ordonnance. Le moteur de sécurité détecte automatiquement les interactions et contre-indications.',
    action:   () => { const b = document.getElementById('tab-btn-ordonnances'); if(b) b.click(); },
  },
  {
    selector: '#alert-safety',
    title:    'Étape 7 — Alerte médicamenteuse 🔴',
    text:     'Essayez de prescrire "Amoxicilline" : alerte critique (allergie pénicilline connue). La prescription est bloquée.',
    action:   () => {
      const b = document.getElementById('tab-btn-ordonnances'); if(b) b.click();
      setTimeout(() => { const btn = document.getElementById('btn-nouvelle-ordo'); if(btn) btn.click(); }, 200);
    },
  },
  {
    selector: '#btn-generate-pdf',
    title:    'Étape 8 — Ordonnance PDF',
    text:     'Générez l\'ordonnance en PDF avec filigrane DÉMONSTRATION. Prêt à imprimer ou à envoyer.',
    action:   null,
  },
  {
    selector: '#tab-btn-documents',
    title:    'Étape 9 — Documents médicaux',
    text:     'Consultez les documents fictifs : bilan biologique, ECG, radio thorax. Cliquez sur un document pour l\'aperçu.',
    action:   () => { const b = document.getElementById('tab-btn-documents'); if(b) b.click(); },
  },
];

let _tourStep  = 0;
let _tourSteps = [];
let _tourEl    = null;

function startDemoTour() {
  const isPatients = window.location.pathname.endsWith('patients.html') || window.location.pathname === '/';
  _tourSteps = isPatients ? TOUR_STEPS_PATIENTS : TOUR_STEPS_DOSSIER;
  _tourStep  = 0;
  _renderTourStep();
}

function _renderTourStep() {
  _cleanTour();
  if (_tourStep >= _tourSteps.length) { _cleanTour(); return; }
  const step = _tourSteps[_tourStep];

  if (step.action) step.action();

  setTimeout(() => {
    const target = document.querySelector(step.selector);

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'tour-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:all;';
    overlay.onclick = e => { if (e.target === overlay) _cleanTour(); };

    // Si l'élément existe, on le surligne via box-shadow sur un div clone
    let rect = null;
    if (target) {
      rect = target.getBoundingClientRect();
      // Scroll vers l'élément
      target.scrollIntoView({ behavior:'smooth', block:'center' });
    }

    // Fond sombre avec découpe
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.55);';
    overlay.appendChild(backdrop);

    if (target && rect) {
      // Trou transparent via clip-path
      backdrop.style.background = 'none';
      backdrop.style.boxShadow  = `0 0 0 9999px rgba(0,0,0,0.55)`;
      backdrop.style.position   = 'fixed';
      backdrop.style.left       = (rect.left - 8) + 'px';
      backdrop.style.top        = (rect.top  - 8) + 'px';
      backdrop.style.width      = (rect.width + 16) + 'px';
      backdrop.style.height     = (rect.height + 16) + 'px';
      backdrop.style.borderRadius = '10px';
      backdrop.style.pointerEvents = 'none';
    }

    // Bulle info
    const bubble = document.createElement('div');
    bubble.style.cssText = [
      'position:fixed','z-index:99999','background:#fff',
      'border-radius:14px','padding:20px 22px','max-width:320px','width:90%',
      'box-shadow:0 8px 40px rgba(0,0,0,.25)',
      'font-family:Inter,sans-serif',
    ].join(';');

    // Positionner la bulle
    if (target && rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow > 200) {
        bubble.style.top  = (rect.bottom + 16) + 'px';
        bubble.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 340)) + 'px';
      } else {
        bubble.style.bottom = (window.innerHeight - rect.top + 16) + 'px';
        bubble.style.left   = Math.max(16, Math.min(rect.left, window.innerWidth - 340)) + 'px';
      }
    } else {
      bubble.style.top  = '50%';
      bubble.style.left = '50%';
      bubble.style.transform = 'translate(-50%,-50%)';
    }

    bubble.innerHTML = `
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C4717A;margin-bottom:6px">
        Étape ${_tourStep+1} / ${_tourSteps.length}
      </div>
      <div style="font-size:.95rem;font-weight:700;color:#3D2B2D;margin-bottom:8px;font-family:'DM Serif Display',serif">${step.title}</div>
      <div style="font-size:.83rem;color:#5C3F42;line-height:1.55;margin-bottom:16px">${step.text}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <button onclick="window._tourPrev()" style="font-size:.78rem;padding:7px 14px;border-radius:7px;border:1px solid #eee;background:none;color:#8C6A6D;cursor:pointer;font-family:Inter,sans-serif" ${_tourStep===0?'disabled style="opacity:.4"':''}>← Préc.</button>
        <button onclick="_cleanTour()" style="font-size:.75rem;color:#8C6A6D;background:none;border:none;cursor:pointer;font-family:Inter,sans-serif">Passer</button>
        <button onclick="window._tourNext()" style="font-size:.78rem;padding:7px 14px;border-radius:7px;border:none;background:#C4717A;color:#fff;cursor:pointer;font-weight:600;font-family:Inter,sans-serif">
          ${_tourStep === _tourSteps.length-1 ? 'Terminer ✓' : 'Suivant →'}
        </button>
      </div>`;

    overlay.appendChild(bubble);
    document.body.appendChild(overlay);
    _tourEl = overlay;
  }, target && _tourSteps[_tourStep]?.action ? 350 : 0);
}

window._tourNext = function() { _tourStep++; _renderTourStep(); };
window._tourPrev = function() { if (_tourStep > 0) { _tourStep--; _renderTourStep(); } };

function _cleanTour() {
  if (_tourEl) { _tourEl.remove(); _tourEl = null; }
}

// ── Bannière demo (IIFE) ────────────────────────────────────────

(function() {
  const DEMO_ROLE_KEY = 'candy_demo_active_role';

  const PROFILES = [
    { id:'medecin',    label:'👨‍⚕️ Médecin',   available: true },
    { id:'infirmier',  label:'👩‍⚕️ Infirmier',  available: true },
    { id:'secretaire', label:'👩‍💼 Secrétaire', available: true },
  ];

  function getActiveRole() { return localStorage.getItem(DEMO_ROLE_KEY) || 'medecin'; }
  function setActiveRole(role) {
    localStorage.setItem(DEMO_ROLE_KEY, role);
    document.dispatchEvent(new CustomEvent('candy:demo-role-changed', { detail: { role } }));
    updateBannerUI();
    applyRoleToPage(role);
  }

  function applyRoleToPage(role) {
    const path = window.location.pathname;
    const isPatientPage  = /patient-\d/.test(path);
    const isPatientsPage = path.endsWith('patients.html') || path.endsWith('index.html') || path === '/';

    if (isPatientPage) {
      if (role === 'secretaire') {
        window.location.href = 'patients.html';
        return;
      }
      const TAB_IDS_HIDDEN_INFIRMIER = ['ordonnances', 'documents'];
      TAB_IDS_HIDDEN_INFIRMIER.forEach(id => {
        const btn = document.getElementById('tab-btn-' + id);
        const pane = document.getElementById('tab-' + id);
        if (!btn) return;
        if (role === 'infirmier') {
          btn.style.display = 'none';
          if (pane && pane.classList.contains('active')) {
            pane.classList.remove('active');
            const constBtn = document.getElementById('tab-btn-constantes');
            if (constBtn && typeof showTab === 'function') showTab('constantes', constBtn);
            else if (constBtn) constBtn.click();
          }
        } else {
          btn.style.display = '';
        }
      });
    }

    if (isPatientsPage) {
      if (role === 'secretaire' && typeof showView === 'function') {
        showView('agenda', document.getElementById('btn-agenda-nav'), 'bni-agenda');
      } else if (typeof showView === 'function') {
        const patientsBtn = document.querySelector('.sidebar-item[onclick*="\'patients\'"]');
        showView('patients', patientsBtn, 'bni-patients');
      }
    }
  }

  function updateBannerUI() {
    const active = getActiveRole();
    PROFILES.forEach(p => {
      const btn = document.getElementById(`demo-role-${p.id}`);
      if (!btn) return;
      btn.style.background = active === p.id ? 'rgba(255,255,255,0.25)' : 'transparent';
      btn.style.fontWeight  = active === p.id ? '700' : '600';
    });
  }

  function injectBanner() {
    if (document.getElementById('candy-demo-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'candy-demo-banner';
    banner.style.cssText = [
      'position:fixed','bottom:0','left:0','right:0','z-index:9999',
      'background:rgba(196,113,122,0.95)','backdrop-filter:blur(10px)',
      'border-top:1px solid rgba(255,255,255,0.2)',
      'padding:7px 16px','display:flex','align-items:center',
      'gap:8px','flex-wrap:wrap','justify-content:center',
    ].join(';');

    const btnStyle = [
      'font-family:Inter,sans-serif','font-size:.75rem','font-weight:600',
      'padding:5px 11px','border-radius:6px',
      'border:1px solid rgba(255,255,255,0.35)','transition:all .18s',
      'color:#fff','cursor:pointer',
    ].join(';');

    const label = document.createElement('span');
    label.style.cssText = 'font-size:.6rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.75);white-space:nowrap;font-family:Inter,sans-serif';
    label.textContent = '🩺 DÉMO';
    banner.appendChild(label);

    PROFILES.forEach(p => {
      const btn = document.createElement('button');
      btn.id = `demo-role-${p.id}`;
      btn.textContent = p.label;
      btn.style.cssText = btnStyle + `;background:transparent;opacity:${p.available?'1':'0.45'};cursor:${p.available?'pointer':'default'}`;
      if (p.available) {
        btn.onclick = () => setActiveRole(p.id);
      } else {
        btn.disabled = true;
        btn.title = 'Bientôt disponible';
      }
      banner.appendChild(btn);
    });

    const sep = document.createElement('div');
    sep.style.cssText = 'width:1px;height:18px;background:rgba(255,255,255,.3);margin:0 2px;flex-shrink:0';
    banner.appendChild(sep);

    const resetBtn = document.createElement('button');
    resetBtn.id = 'demo-reset-btn';
    resetBtn.innerHTML = '♻ Réinitialiser';
    resetBtn.style.cssText = btnStyle + ';background:transparent';
    resetBtn.onclick = () => { if (typeof resetDemo === 'function') resetDemo(); };
    banner.appendChild(resetBtn);

    const tourBtn = document.createElement('button');
    tourBtn.id = 'demo-tour-btn';
    tourBtn.innerHTML = '🎯 Visite guidée';
    tourBtn.style.cssText = btnStyle + ';background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.5)';
    tourBtn.onclick = () => startDemoTour();
    banner.appendChild(tourBtn);

    document.body.appendChild(banner);
    document.body.style.paddingBottom = '50px';

    updateBannerUI();
    document.dispatchEvent(new CustomEvent('candy:demo-role-changed', { detail: { role: getActiveRole() } }));
    applyRoleToPage(getActiveRole());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBanner);
  } else {
    injectBanner();
  }

  window.CandyDemo = { getActiveRole, setActiveRole };
})();
