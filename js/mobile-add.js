// Mobile Add Reservation functionality
class MobileAddManager {
    constructor() {
        this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg';
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        this.reservations = [];
        this.init();
    }

    async init() {
        this.cacheDOM();
        this.setupEventListeners();
        this.setupFormValidation();
        await this.loadReservations();
        this.setDefaults();
    }

    cacheDOM() {
        this.form = document.getElementById('reservation-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.successModal = document.getElementById('success-modal');
        this.closeModal = document.getElementById('close-modal');
        this.warningDiv = document.getElementById('availability-warning');
        
        this.dateInput = this.form.querySelector('input[name="date_res"]');
        this.horaireInputs = this.form.querySelectorAll('input[name="horaire"]');
        this.eventTypeSelect = document.getElementById('event-type');
        this.lightOption = document.getElementById('light-option');
    }

    setDefaults() {
        // Set default values
        const montantInput = this.form.querySelector('input[name="montant_tot"]');
        const avanceInput = this.form.querySelector('input[name="avance"]');
        
        if (montantInput && !montantInput.value) {
            montantInput.value = '4200';
        }
        
        if (avanceInput && !avanceInput.value) {
            avanceInput.value = '500';
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.min = today;
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close modal
        this.closeModal.addEventListener('click', () => {
            this.successModal.classList.remove('show');
        });
        
        // Close modal on backdrop click
        this.successModal.addEventListener('click', (e) => {
            if (e.target === this.successModal) {
                this.successModal.classList.remove('show');
            }
        });

        // Auto-check light option for Mariage
        this.eventTypeSelect.addEventListener('change', () => {
            if (this.eventTypeSelect.value === 'Mariage') {
                this.lightOption.checked = true;
            }
        });

        // Availability check on date/horaire change
        this.dateInput.addEventListener('change', () => this.checkAvailability());
        this.horaireInputs.forEach(input => {
            input.addEventListener('change', () => this.checkAvailability());
        });
    }

    setupFormValidation() {
        const cinInput = this.form.querySelector('input[name="cin"]');
        const tel1Input = this.form.querySelector('input[name="tel1"]');
        const tel2Input = this.form.querySelector('input[name="tel2"]');
        const montantInput = this.form.querySelector('input[name="montant_tot"]');
        const avanceInput = this.form.querySelector('input[name="avance"]');

        // CIN validation (8 digits only)
        if (cinInput) {
            cinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
            });
        }

        // Phone validation (8 digits only)
        [tel1Input, tel2Input].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
                });
            }
        });

        // Amount validation
        if (montantInput && avanceInput) {
            const validateAmounts = () => {
                const montant = parseFloat(montantInput.value) || 0;
                const avance = parseFloat(avanceInput.value) || 0;
                
                if (avance > montant) {
                    avanceInput.setCustomValidity('L\'avance ne peut pas être supérieure au montant total');
                    avanceInput.reportValidity();
                } else {
                    avanceInput.setCustomValidity('');
                }
            };

            montantInput.addEventListener('input', validateAmounts);
            avanceInput.addEventListener('input', validateAmounts);
        }
    }

    async loadReservations() {
        try {
            const { data, error } = await this.supabase
                .from('reservations')
                .select('date_res, horaire, nom, prenom');

            if (error) throw error;
            this.reservations = data || [];
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
    }

    checkAvailability() {
        const date = this.dateInput.value;
        const horaire = this.form.querySelector('input[name="horaire"]:checked')?.value;

        if (!date || !horaire) {
            this.warningDiv.style.display = 'none';
            this.submitBtn.disabled = false;
            return;
        }

        // Check if date is in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.warningDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Vous ne pouvez pas sélectionner une date passée.';
            this.warningDiv.style.display = 'block';
            this.submitBtn.disabled = true;
            return;
        }

        // Check availability
        const isBooked = this.reservations.some(res => 
            res.date_res === date && res.horaire === horaire
        );

        if (isBooked) {
            const reservation = this.reservations.find(res => 
                res.date_res === date && res.horaire === horaire
            );
            this.warningDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Cette date et horaire sont déjà réservés par ${reservation.prenom} ${reservation.nom}`;
            this.warningDiv.style.display = 'block';
            this.submitBtn.disabled = true;
        } else {
            this.warningDiv.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Check authentication
        if (!authManager || !authManager.isAuthenticated()) {
            alert('Vous devez être connecté pour ajouter une réservation');
            return;
        }

        const user = authManager.getCurrentUser();
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Calculate amounts
        const montant = parseFloat(data.montant_tot) || 0;
        const avance = parseFloat(data.avance) || 0;
        const reste = montant - avance;

        // Build notes
        let notes = `${data.event_type}\n`;
        
        // Add selected options
        const selectedOptions = this.form.querySelectorAll('input[name="options"]:checked');
        selectedOptions.forEach(option => {
            notes += `${option.value}\n`;
        });

        // Add manual notes if any
        if (data.notes_manual && data.notes_manual.trim()) {
            notes += data.notes_manual.trim();
        }

        // Disable submit button and show loading
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

        try {
            const { error } = await this.supabase
                .from('reservations')
                .insert({
                    nom: data.nom,
                    prenom: data.prenom,
                    cin: data.cin || null,
                    tel1: data.tel1 || null,
                    tel2: data.tel2 || null,
                    date_res: data.date_res,
                    horaire: data.horaire,
                    montant_tot: montant,
                    avance: avance,
                    montant_rest: reste,
                    notes: notes.trim(),
                    created_by: user.id
                });

            if (error) throw error;

            // Show success modal
            this.successModal.classList.add('show');
            
            // Reset form
            this.form.reset();
            this.setDefaults();
            this.warningDiv.style.display = 'none';
            
            // Reload reservations
            await this.loadReservations();

        } catch (error) {
            console.error('Error saving reservation:', error);
            alert('Erreur lors de l\'enregistrement: ' + error.message);
        } finally {
            // Reset submit button
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer la Réservation';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    setTimeout(() => {
        if (authManager && !authManager.requireAuth()) {
            return; // Will redirect to login
        }
        
        // Initialize mobile add manager
        new MobileAddManager();
    }, 100);
});