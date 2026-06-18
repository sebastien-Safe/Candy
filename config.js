// ================================================================
// C@NDY — Configuration
// Supabase dédié — indépendant du CRM S@FE
// ================================================================

const CANDY_SUPABASE_URL  = 'https://dsfhvtkuwvaexybfqbsa.supabase.co';
const CANDY_SUPABASE_KEY  = 'sb_publishable_1HYOqPI5cRAR-PGe4e9drQ_qkd9WT5r';
const CANDY_APP_NAME      = 'C@NDY';
const CANDY_VERSION       = '1.0.0';
const CANDY_BASE_URL      = 'https://sebastien-safe.github.io/candy';

// Rôles
const CANDY_ROLES = {
  ADMIN:      'admin',
  MEDECIN:    'medecin',
  SECRETAIRE: 'secretaire',
};

// Permissions par rôle
const CANDY_PERMISSIONS = {
  admin:      ['patients','consultations','ordonnances','agenda','documents','users','stats'],
  medecin:    ['patients','consultations','ordonnances','agenda','documents','stats'],
  secretaire: ['patients','agenda'],
};
