// ================================================================
// C@NDY — Données de démonstration + gestion localStorage
// Charger AVANT demo-banner.js et prescription-safety.js
// ================================================================

const DEMO_PATIENT_ID = 'patient-4';

const DEMO_KEYS = {
  constantes:    id => `candy_demo_constantes_${id}`,
  consultations: id => `candy_demo_consultations_${id}`,
  ordonnances:   id => `candy_demo_ordonnances_${id}`,
  documents:     id => `candy_demo_documents_${id}`,
  notes:         id => `candy_demo_notes_${id}`,
  pj:            id => `candy_pj_${id.replace('patient-','')}`,
  onboarding:    () => 'candy_ob_demo',
  tourVu:        () => 'candy_tour_vu',
};

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
      { id:'d1', nom:'Bilan biologique Jan 2026', type:'biologie', date:'2026-01-20',
        contenu:'HbA1c : 7,2% (N<7%)\nGlycémie à jeun : 1,38 g/L (N:0,70-1,10)\nLDL cholestérol : 1,42 g/L (N<1,30)\nHDL : 0,58 g/L (N>0,40)\nTriglyérides : 1,68 g/L (N<1,50)\nCréatinine : 82 µmol/L (N:60-110)\nDFG : 78 mL/min (N>60)' },
      { id:'d2', nom:'ECG Juin 2026', type:'ecg', date:'2026-06-18',
        contenu:'Rythme sinusal régulier\nFC : 73 bpm\nPR : 162 ms (normal)\nQRS : 88 ms (normal)\nQTc : 410 ms (normal)\nAxe : +45° (normal)\nConclusion : ECG normal, pas d\'anomalie de repolarisation' },
      { id:'d3', nom:'Radio thorax Mai 2026', type:'imagerie', date:'2026-05-14',
        contenu:'Parenchyme pulmonaire : normal\nSilhouette cardiaque : index cardio-thoracique 0,49 (normal)\nHiles : non dilatés\nPlèvres : libres\nConclusion : pas d\'anomalie pleuropulmonaire' },
    ],
    notes: ''
  }
};

function demoGet(type, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const key = DEMO_KEYS[type]?.(patientId);
  if (!key) return type === 'notes' ? '' : [];
  const raw = localStorage.getItem(key);
  if (raw !== null) return type === 'notes' ? raw : JSON.parse(raw);
  const initial = DEMO_INITIAL[patientId]?.[type];
  if (initial !== undefined) {
    localStorage.setItem(key, type === 'notes' ? initial : JSON.stringify(initial));
    return initial;
  }
  return type === 'notes' ? '' : [];
}

function demoSet(type, data, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const key = DEMO_KEYS[type]?.(patientId);
  if (!key) return;
  localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
}

function demoAdd(type, item, patientId) {
  patientId = patientId || DEMO_PATIENT_ID;
  const list = demoGet(type, patientId);
  list.push({ ...item, id: item.id || ('demo_' + Date.now()) });
  demoSet(type, list, patientId);
  return list;
}

function resetDemo() {
  if (!confirm('Réinitialiser toutes les données de démonstration ?\nCette action effacera les modifications et restaurera les données d\'origine.')) return;
  Object.keys(localStorage)
    .filter(k => k.startsWith('candy_demo_') || k.startsWith('candy_pj_') || k === 'candy_ob_demo' || k === 'candy_tour_vu')
    .forEach(k => localStorage.removeItem(k));
  Object.entries(DEMO_INITIAL).forEach(([pid, data]) => {
    Object.entries(data).forEach(([type, values]) => {
      const key = DEMO_KEYS[type]?.(pid);
      if (key) localStorage.setItem(key, typeof values === 'string' ? values : JSON.stringify(values));
    });
  });
  const btn = document.getElementById('demo-reset-btn');
  if (btn) { btn.innerHTML = '✅ Réinitialisé !'; setTimeout(() => { btn.innerHTML = '♻ Réinitialiser la démo'; }, 2500); }
  // Recharger la page pour refléter les données restaurées
  setTimeout(() => location.reload(), 600);
}
