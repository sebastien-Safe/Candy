// ================================================================
// C@NDY — Service d'authentification v2
// Autonome — aucune dépendance avec le CRM S@FE
// RGPD renforcé — isolation complète par rôle
// ================================================================

const CandyAuth = (() => {

  let _sb      = null;
  let _user    = null;
  let _profile = null;

  function init() {
    _sb = window.supabase.createClient(CANDY_SUPABASE_URL, CANDY_SUPABASE_KEY);
    return _sb;
  }

  function getClient() {
    if (!_sb) init();
    return _sb;
  }

  async function getSession() {
    const { data: { session } } = await getClient().auth.getSession();
    return session;
  }

  async function getUser() {
    if (_user) return _user;
    const session = await getSession();
    _user = session?.user || null;
    return _user;
  }

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

  async function getRole() {
    const profile = await getProfile();
    return profile?.role || null;
  }

  // Vérifier une permission
  async function can(permission) {
    const role  = await getRole();
    const perms = CANDY_PERMISSIONS[role] || [];
    return perms.includes(permission);
  }

  // Vérifier si le rôle est au moins le niveau demandé
  async function hasRole(...roles) {
    const role = await getRole();
    return roles.includes(role);
  }

  // Connexion
  async function login(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    _user    = data.user;
    _profile = null;
    // Logger la connexion (RGPD)
    try {
      await getClient().rpc('log_action', {
        p_action: 'LOGIN',
        p_details: { email }
      });
    } catch(e) { /* non bloquant */ }
    return data;
  }

  // Déconnexion
  async function logout() {
    try {
      await getClient().rpc('log_action', { p_action: 'LOGOUT' });
    } catch(e) { /* non bloquant */ }
    await getClient().auth.signOut();
    _user    = null;
    _profile = null;
    window.location.href = 'login.html';
  }

  // Garde : redirige vers login si non connecté
  async function requireAuth() {
    const session = await getSession();
    if (!session) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // Garde : redirige si rôle insuffisant
  async function requireRole(...roles) {
    const ok = await requireAuth();
    if (!ok) return false;
    const role = await getRole();
    if (!role || !roles.includes(role)) {
      window.location.href = 'login.html?error=permission';
      return false;
    }
    return true;
  }

  // Rediriger vers la bonne page selon le rôle
  async function redirectByRole() {
    const role = await getRole();
    const page = CANDY_REDIRECT[role] || 'login.html';
    window.location.href = page;
  }

  // Écouter les changements de session
  function onAuthChange(callback) {
    getClient().auth.onAuthStateChange((event, session) => {
      _user    = session?.user || null;
      _profile = null;
      callback(event, session);
    });
  }

  return {
    init, getClient, getSession, getUser, getProfile,
    getRole, can, hasRole, login, logout,
    requireAuth, requireRole, redirectByRole, onAuthChange,
  };

})();
