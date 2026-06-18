// ================================================================
// C@NDY — Service d'authentification
// Autonome — aucune dépendance avec le CRM S@FE
// ================================================================

const CandyAuth = (() => {

  let _sb   = null;
  let _user = null;
  let _profile = null;

  // ── Initialisation ──
  function init() {
    _sb = window.supabase.createClient(CANDY_SUPABASE_URL, CANDY_SUPABASE_KEY);
    return _sb;
  }

  function getClient() {
    if (!_sb) init();
    return _sb;
  }

  // ── Session courante ──
  async function getSession() {
    const { data: { session } } = await getClient().auth.getSession();
    return session;
  }

  // ── Utilisateur connecté ──
  async function getUser() {
    if (_user) return _user;
    const session = await getSession();
    _user = session?.user || null;
    return _user;
  }

  // ── Profil complet ──
  async function getProfile() {
    if (_profile) return _profile;
    const user = await getUser();
    if (!user) return null;
    const { data } = await getClient()
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    _profile = data;
    return _profile;
  }

  // ── Rôle ──
  async function getRole() {
    const profile = await getProfile();
    return profile?.role || 'secretaire';
  }

  // ── Vérifier une permission ──
  async function can(permission) {
    const role  = await getRole();
    const perms = CANDY_PERMISSIONS[role] || [];
    return perms.includes(permission);
  }

  // ── Connexion ──
  async function login(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    _user    = data.user;
    _profile = null; // reset cache
    return data;
  }

  // ── Déconnexion ──
  async function logout() {
    await getClient().auth.signOut();
    _user    = null;
    _profile = null;
    window.location.href = '/candy/login.html';
  }

  // ── Garde : redirige vers login si non connecté ──
  async function requireAuth() {
    const session = await getSession();
    if (!session) {
      window.location.href = '/candy/login.html';
      return false;
    }
    return true;
  }

  // ── Garde : redirige si rôle insuffisant ──
  async function requireRole(...roles) {
    const role = await getRole();
    if (!roles.includes(role)) {
      window.location.href = '/candy/login.html?error=permission';
      return false;
    }
    return true;
  }

  // ── Écouter les changements de session ──
  function onAuthChange(callback) {
    getClient().auth.onAuthStateChange((event, session) => {
      _user    = session?.user || null;
      _profile = null;
      callback(event, session);
    });
  }

  return {
    init,
    getClient,
    getSession,
    getUser,
    getProfile,
    getRole,
    can,
    login,
    logout,
    requireAuth,
    requireRole,
    onAuthChange,
  };

})();
