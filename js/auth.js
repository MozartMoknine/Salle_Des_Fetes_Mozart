// Authentication management with Supabase
class AuthManager {
    constructor() {
        this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg'; // You'll need to provide the actual anon key
        
        // Initialize Supabase client
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        this.currentUser = null;
        this.init();
    }
  
//user block
  createUserBlock(displayName) {

  
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center justify-between px-4 text-white bg-gray-800 rounded-md mt-2 ';

 // 👤 Status + Name block
  const nameSpan = document.createElement('span');
  nameSpan.className = 'text-sm mr-5 flex items-start gap-1';

  const statusDot = document.createElement('span');
  statusDot.className = 'status-dot';

  const nameText = document.createElement('span');
  nameText.textContent = `👤 ${displayName}`;

  
  nameSpan.appendChild(nameText);
nameSpan.appendChild(statusDot);
      
 const logoutBtn = document.createElement('button');
logoutBtn.className = 'flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition duration-150 ease-in-out';

logoutBtn.innerHTML = `<i class="fas fa-power-off"></i>Déconnexion`;


  // ✅ Capture l'instance actuelle
  const self = this;
      if (!self.currentUser) {
  console.warn('Pas de session active, déconnexion impossible');
  return wrapper;
}
console.log('Attaching logout listener...');
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout button clicked');

    try {
      await self.signOut();
    } catch (error) {
      console.warn('Sign out error (continuing anyway):', error);
    }

    // Force clear session and redirect regardless of signOut result
    self.currentUser = null;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
  });

  wrapper.appendChild(nameSpan);
  wrapper.appendChild(logoutBtn);
  return wrapper;
}


    async init() {
        // Check if user is already logged in
        const { data: { session } } = await this.supabase.auth.getSession();
      console.log('Session récupérée:', session);
        if (session) {
            this.currentUser = session.user;
            this.onAuthStateChange(session.user);
        }

        // Listen for auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.onAuthStateChange(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.onAuthStateChange(null);
            }
        });
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
      console.log('Session avant déconnexion:', this.currentUser);
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                throw error;
            }
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    onAuthStateChange(user) {
        // Handle auth state changes
       if (user) {
    const intendedPage = sessionStorage.getItem('intendedPage');
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'login.html') {
      const target = intendedPage || 'agenda.html';
      sessionStorage.removeItem('intendedPage');
      window.location.href = target;
    }
  } else {
    console.log('User signed out');
    if (this.isProtectedPage()) {
      window.location.href = 'login.html';
    }
  }
    }

    isProtectedPage() {
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = ['contract.html', 'agenda.html','agendarefill.html', 'calendar.html'];
        return protectedPages.includes(currentPage);
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            // Store the intended page
            sessionStorage.setItem('intendedPage', window.location.pathname.split('/').pop());
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Add logout functionality to navigation
  async  addLogoutButton() {
  // Find your nav container (escape the colon in md:flex)
  const desktopNav = document.querySelector('nav .hidden.md\\:flex');
const mobileMenu = document.getElementById('mobile-menu');
if (!this.isAuthenticated()) return;


  // 1. Fetch the 'nom' from your users table
  const userId = this.currentUser.id;
  const { data: profile, error } = await this.supabase
    .from('users')
    .select('nom')
    .eq('id', userId)
    .single();

  // Fallback to email if no nom
  const displayName = profile?.nom ?? this.currentUser.email;

// Inject into desktop and mobile menus


const desktopBlock = this.createUserBlock(displayName);
const mobileBlock = this.createUserBlock(displayName);

if (desktopNav) {
  desktopNav.appendChild(desktopBlock);
}

if (mobileMenu) {
  mobileMenu.appendChild(mobileBlock);
}



  // Toggle dropdown visibility
  

  // Close dropdown on outside click
 
}

    // Get error message in French
    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Email non confirmé',
            'Too many requests': 'Trop de tentatives, veuillez réessayer plus tard',
            'User not found': 'Utilisateur non trouvé',
            'Invalid email': 'Adresse email invalide',
            'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères'
        };

        return errorMessages[error] || error || 'Une erreur est survenue';
    }
}

// Initialize auth manager
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});
