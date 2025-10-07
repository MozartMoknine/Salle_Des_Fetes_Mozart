// Login form functionality
class LoginManager {
    constructor() {
        this.form = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('toggle-password');
        this.loginBtn = document.getElementById('login-btn');
        this.loginText = document.getElementById('login-text');
        this.loginSpinner = document.getElementById('login-spinner');
        this.errorMessage = document.getElementById('error-message');
        
        // Debounce timer for validation
        this.validationTimer = null;
        this.debounceDelay = 300;

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (this.togglePasswordBtn) {
            this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());
        }

        // Debounced validation when user types
        [this.emailInput, this.passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.debouncedValidation());
                input.addEventListener('blur', () => this.validateField(input));
            }
        });
    }
    
    debouncedValidation() {
        this.clearError();
        
        if (this.validationTimer) {
            clearTimeout(this.validationTimer);
        }
        
        this.validationTimer = setTimeout(() => {
            this.validateInputs();
        }, this.debounceDelay);
    }
    
    validateField(input) {
        const value = input.value.trim();
        
        if (input === this.emailInput && value) {
            if (!this.isValidEmail(value)) {
                this.showFieldError(input, 'Format d\'email invalide');
            } else {
                this.clearFieldError(input);
            }
        }
        
        if (input === this.passwordInput && value) {
            if (value.length < 6) {
                this.showFieldError(input, 'Au moins 6 caractères requis');
            } else {
                this.clearFieldError(input);
            }
        }
    }
    
    validateInputs() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
        // Enable/disable login button based on input validity
        const isValid = email && password && this.isValidEmail(email) && password.length >= 6;
        this.loginBtn.disabled = !isValid;
        this.loginBtn.classList.toggle('opacity-50', !isValid);
    }
    
    showFieldError(input, message) {
        input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-xs mt-1 animate-fade-in';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(input) {
        input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    togglePassword() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        
        const icon = this.togglePasswordBtn.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye transition-all' : 'fas fa-eye-slash transition-all';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden', 'animate-fade-out');
        this.errorMessage.classList.add('animate-fade-in');
        
        // Add error styling to inputs
        [this.emailInput, this.passwordInput].forEach(input => {
            input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        });
    }

    clearError() {
        if (!this.errorMessage.classList.contains('hidden')) {
            this.errorMessage.classList.remove('animate-fade-in');
            this.errorMessage.classList.add('animate-fade-out');
            setTimeout(() => {
                this.errorMessage.classList.add('hidden');
                this.errorMessage.classList.remove('animate-fade-out');
            }, 200);
        }
        
        // Remove error styling from inputs
        [this.emailInput, this.passwordInput].forEach(input => {
            input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            this.clearFieldError(input);
        });
    }

    setLoading(loading) {
        if (loading) {
            this.loginText.textContent = 'Connexion...';
            this.loginSpinner.classList.remove('hidden');
            this.loginBtn.disabled = true;
            this.loginBtn.classList.add('opacity-75', 'cursor-not-allowed', 'animate-pulse');
        } else {
            this.loginText.textContent = 'Se Connecter';
            this.loginSpinner.classList.add('hidden');
            this.loginBtn.disabled = false;
            this.loginBtn.classList.remove('opacity-75', 'cursor-not-allowed', 'animate-pulse');
        }
    }

    validateForm(email, password) {
        const errors = [];

        if (!email.trim()) {
            errors.push('L\'adresse email est requise');
        } else if (!this.isValidEmail(email)) {
            errors.push('L\'adresse email n\'est pas valide');
        }

        if (!password.trim()) {
            errors.push('Le mot de passe est requis');
        } else if (password.length < 6) {
            errors.push('Le mot de passe doit contenir au moins 6 caractères');
        }

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        // Clear previous errors
        this.clearError();

        // Validate form
        const errors = this.validateForm(email, password);
        if (errors.length > 0) {
            this.showError(errors[0]);
            return;
        }

        // Set loading state
        this.setLoading(true);

        try {
            // Wait for auth manager to be ready
            if (!authManager) {
                throw new Error('Auth manager not initialized');
            }

            // Attempt login
            const result = await authManager.signIn(email, password);

            if (result.success) {
                // Success - auth manager will handle redirect
                console.log('Login successful');
            } else {
                // Show error
                const errorMessage = authManager.getErrorMessage(result.error);
                this.showError(errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Une erreur est survenue lors de la connexion');
        } finally {
            this.setLoading(false);
        }
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    setTimeout(() => {
        if (authManager && authManager.isAuthenticated()) {
            window.location.href = 'contract.html';
        }
    }, 100);

    new LoginManager();
});