// Mobile Agenda functionality
class MobileAgendaManager {
    constructor() {
        this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg';
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        this.reservations = [];
        this.filteredReservations = [];
        this.init();
    }

    async init() {
        this.cacheDOM();
        this.setupEventListeners();
        this.populateYearFilter();
        await this.loadReservations();
        this.renderReservations();
        this.updateStats();
    }

    cacheDOM() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.monthFilter = document.getElementById('month-filter');
        this.yearFilter = document.getElementById('year-filter');
        this.reservationsContainer = document.getElementById('reservations-container');
        this.loading = document.getElementById('loading');
        
        // Stats elements
        this.totalReservations = document.getElementById('total-reservations');
        this.upcomingReservations = document.getElementById('upcoming-reservations');
        this.thisMonth = document.getElementById('this-month');
    }

    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', () => this.filterReservations());
        this.searchBtn.addEventListener('click', () => this.filterReservations());
        
        // Filter functionality
        this.monthFilter.addEventListener('change', () => this.filterReservations());
        this.yearFilter.addEventListener('change', () => this.filterReservations());

        // Enter key for search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filterReservations();
            }
        });
    }

    populateYearFilter() {
        const currentYear = new Date().getFullYear();
        this.yearFilter.innerHTML = '<option value="">Toutes les années</option>';
        
        for (let year = currentYear - 1; year <= currentYear + 3; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            this.yearFilter.appendChild(option);
        }
    }

    async loadReservations() {
        try {
            this.loading.style.display = 'block';
            
            const { data, error } = await this.supabase
                .from('reservations')
                .select(`
                    reservation_id,
                    nom,
                    prenom,
                    cin,
                    tel1,
                    tel2,
                    date_res,
                    horaire,
                    montant_tot,
                    avance,
                    montant_rest,
                    notes,
                    date_creation,
                    users!fk_reservations_created_by(username, nom)
                `)
                .order('date_res', { ascending: true });

            if (error) throw error;

            this.reservations = data || [];
            this.filteredReservations = [...this.reservations];
            
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.showError('Erreur lors du chargement des réservations');
        } finally {
            this.loading.style.display = 'none';
        }
    }

    filterReservations() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const selectedMonth = this.monthFilter.value;
        const selectedYear = this.yearFilter.value;

        this.filteredReservations = this.reservations.filter(reservation => {
            // Search filter
            const matchesSearch = !searchTerm || 
                reservation.nom.toLowerCase().includes(searchTerm) ||
                reservation.prenom.toLowerCase().includes(searchTerm) ||
                `${reservation.prenom} ${reservation.nom}`.toLowerCase().includes(searchTerm);

            // Month filter
            const reservationDate = new Date(reservation.date_res);
            const matchesMonth = !selectedMonth || 
                (reservationDate.getMonth() + 1) == selectedMonth;

            // Year filter
            const matchesYear = !selectedYear || 
                reservationDate.getFullYear() == selectedYear;

            return matchesSearch && matchesMonth && matchesYear;
        });

        this.renderReservations();
        this.updateStats();
    }

    renderReservations() {
        if (this.filteredReservations.length === 0) {
            this.reservationsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Aucune réservation trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                </div>
            `;
            return;
        }

        const reservationsHTML = this.filteredReservations.map(reservation => 
            this.createReservationCard(reservation)
        ).join('');

        this.reservationsContainer.innerHTML = reservationsHTML;
    }

    createReservationCard(reservation) {
        const formattedDate = this.formatDate(reservation.date_res);
        const formattedHoraire = this.formatHoraire(reservation.horaire);
        const horaireClass = reservation.horaire === 'nuit' ? 'horaire-nuit' : 'horaire-apres-midi';

        return `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="client-name">${reservation.prenom} ${reservation.nom}</div>
                    <div class="reservation-date">${formattedDate}</div>
                </div>
                
                <div class="reservation-details">
                    <div class="detail-item">
                        <i class="fas fa-clock detail-icon"></i>
                        <span class="horaire-badge ${horaireClass}">${formattedHoraire}</span>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-money-bill-wave detail-icon"></i>
                        <span>${reservation.montant_tot || 0} DT</span>
                    </div>
                    
                    ${reservation.tel1 ? `
                        <div class="detail-item">
                            <i class="fas fa-phone detail-icon"></i>
                            <span>${reservation.tel1}${reservation.tel2 ? ` / ${reservation.tel2}` : ''}</span>
                        </div>
                    ` : ''}
                    
                    ${reservation.cin ? `
                        <div class="detail-item">
                            <i class="fas fa-id-card detail-icon"></i>
                            <span>${reservation.cin}</span>
                        </div>
                    ` : ''}
                    
                    <div class="detail-item">
                        <i class="fas fa-hand-holding-usd detail-icon"></i>
                        <span>Avance: ${reservation.avance || 0} DT</span>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-exclamation-triangle detail-icon"></i>
                        <span>Reste: ${reservation.montant_rest || 0} DT</span>
                    </div>
                </div>
                
                ${reservation.notes ? `
                    <div class="notes-section">
                        <div class="notes-title">Notes</div>
                        <div class="notes-content">${this.formatNotes(reservation.notes)}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatHoraire(horaire) {
        return horaire === 'nuit' ? 'Nuit' : 'Après-midi';
    }

    formatNotes(notes) {
        if (!notes) return '';
        return notes.replace(/\n/g, '<br>');
    }

    updateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total reservations (filtered)
        this.totalReservations.textContent = this.filteredReservations.length;

        // Upcoming reservations
        const upcoming = this.filteredReservations.filter(res => {
            const resDate = new Date(res.date_res);
            resDate.setHours(0, 0, 0, 0);
            return resDate >= today;
        }).length;
        this.upcomingReservations.textContent = upcoming;

        // This month reservations
        const thisMonth = this.filteredReservations.filter(res => {
            const resDate = new Date(res.date_res);
            return resDate.getMonth() === today.getMonth() && 
                   resDate.getFullYear() === today.getFullYear();
        }).length;
        this.thisMonth.textContent = thisMonth;
    }

    showError(message) {
        this.reservationsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    setTimeout(() => {
        if (authManager && !authManager.requireAuth()) {
            return; // Will redirect to login
        }
        
        // Initialize mobile agenda manager
        new MobileAgendaManager();
    }, 100);
});