// Calendar Visual management with Supabase integration
class CalendarManager {
    constructor() {
        this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg';
        
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        this.currentHoraire = 'nuit';
        this.reservations = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.populateYearSelector();
        this.setCurrentMonthYear();
        await this.loadReservations();
        this.renderDateList();
        this.updateStats();
    }

    setupEventListeners() {
        const yearSelector = document.getElementById('year-selector');
        const monthSelector = document.getElementById('month-selector');
        const horaireSelector = document.getElementById('horaire-selector');

        if (yearSelector) {
            yearSelector.addEventListener('change', (e) => {
                this.currentYear = parseInt(e.target.value);
                this.renderDateList();
                this.updateStats();
            });
        }

        if (monthSelector) {
            monthSelector.addEventListener('change', (e) => {
                this.currentMonth = parseInt(e.target.value);
                this.renderDateList();
                this.updateStats();
            });
        }

        if (horaireSelector) {
            horaireSelector.addEventListener('change', (e) => {
                this.currentHoraire = e.target.value;
                this.renderDateList();
                this.updateStats();
            });
        }
    }

    populateYearSelector() {
        const yearSelector = document.getElementById('year-selector');
        if (!yearSelector) return;

        const currentYear = new Date().getFullYear();
        yearSelector.innerHTML = '';

        // Add years from current-1 to current+3
        for (let year = currentYear - 1; year <= currentYear + 3; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelector.appendChild(option);
        }
    }

    setCurrentMonthYear() {
        const yearSelector = document.getElementById('year-selector');
        const monthSelector = document.getElementById('month-selector');

        if (yearSelector) {
            yearSelector.value = this.currentYear;
        }

        if (monthSelector) {
            monthSelector.value = this.currentMonth;
        }
    }

    async loadReservations() {
        try {
            const { data, error } = await this.supabase
                .from('reservations')
                .select(`
                    reservation_id,
                    nom,
                    prenom,
                    date_res,
                    horaire,
                    montant_tot,
                    avance,
                    montant_rest,
                    date_creation,
                    notes,
                    users!fk_reservations_created_by(username, nom)
                `)
                .order('date_res', { ascending: true });

            if (error) {
                throw error;
            }

            this.reservations = data || [];
            console.log('Loaded reservations:', this.reservations.length);

        } catch (error) {
            console.error('Error loading reservations:', error);
            this.showError('Erreur lors du chargement des réservations');
        }
    }

    renderDateList() {
        const dateList = document.getElementById('date-list');
        const listTitle = document.getElementById('list-title');
        
        if (!dateList || !listTitle) return;

        // Update title
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        listTitle.textContent = `Disponibilité ${this.currentHoraire} - ${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Get days in month
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create reservation map
        const reservationMap = this.createReservationMap();
        
        // Generate date list
        let dateListHTML = '';
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            const dateKey = this.formatDateKey(currentDate);
            const dayReservations = reservationMap[dateKey] || [];
            
            // Skip past dates
            if (currentDate < today) continue;
            
            const dayInfo = this.analyzeDayStatus(dayReservations, this.currentHoraire);
            
            dateListHTML += this.createDateListItem(currentDate, dayInfo, dayReservations);
        }
        
        if (dateListHTML === '') {
            dateListHTML = '<div class="text-center text-gray-500 py-8">Aucune date trouvée pour cette période</div>';
        }
        
        dateList.innerHTML = dateListHTML;
    }
    
    analyzeDayStatus(dayReservations, selectedHoraire) {
        const hasSelectedHoraire = dayReservations.some(res => res.horaire === selectedHoraire);
        
        if (hasSelectedHoraire) {
            const reservation = dayReservations.find(res => res.horaire === selectedHoraire);
            return { 
                status: 'reserved', 
                type: `Réservé ${selectedHoraire}`, 
                class: 'bg-red-100 border-red-400 text-red-800',
                reservation: reservation
            };
        } else {
            return { 
                status: 'available', 
                type: `Libre ${selectedHoraire}`, 
                class: 'bg-green-100 border-green-400 text-green-800' 
            };
        }
    }
    
    createDateListItem(currentDate, dayInfo, dayReservations) {
        const dayName = this.getDayName(currentDate.getDay());
        const formattedDate = this.formatDateWithDay(currentDate);
        
        let reservationDetails = '';
        if (dayInfo.status === 'reserved' && dayInfo.reservation) {
            reservationDetails = `
                <div class="text-sm text-gray-600 mt-1">
                    <strong>${dayInfo.reservation.prenom} ${dayInfo.reservation.nom}</strong>
                </div>
            `;
        }
        
        return `
            <div class="border rounded-lg p-4 ${dayInfo.class} hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-semibold text-lg">${dayName} ${currentDate.getDate()}</div>
                        <div class="text-sm text-gray-600">${formattedDate}</div>
                        ${reservationDetails}
                    </div>
                    <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${dayInfo.class}">
                            ${dayInfo.type}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
    
    getDayName(dayIndex) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return dayNames[dayIndex];
    }
    
    formatDateWithDay(date) {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    createReservationMap() {
        const reservationMap = {};
        
        this.reservations.forEach(reservation => {
            const dateKey = reservation.date_res;
            if (!reservationMap[dateKey]) {
                reservationMap[dateKey] = [];
            }
            reservationMap[dateKey].push(reservation);
        });

        return reservationMap;
    }

    createDayElement(day, currentDate, today, dayReservations) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        // Determine day status
        let dayClass = '';
        let statusText = '';
        let statusIcon = '';

        if (currentDate < today) {
            // Past date
            dayClass = 'past-day';
            statusText = 'Passé';
        } else if (currentDate.toDateString() === today.toDateString()) {
            // Today
            dayClass = 'today';
            statusText = 'Aujourd\'hui';
            statusIcon = '<i class="fas fa-calendar-day"></i>';
        } else if (dayReservations.length === 0) {
            // Available
            dayClass = 'available-day';
            statusText = 'Libre';
            statusIcon = '<i class="fas fa-check-circle"></i>';
        } else if (dayReservations.length === 1) {
            // Partially booked
            dayClass = 'partial-day';
            const bookedSlot = dayReservations[0].horaire;
            const availableSlot = bookedSlot === 'nuit' ? 'Après-midi libre' : 'Soir libre';
            statusText = availableSlot;
            statusIcon = '<i class="fas fa-clock"></i>';
        } else {
            // Fully booked
            dayClass = 'booked-day';
            statusText = 'Complet';
            statusIcon = '<i class="fas fa-times-circle"></i>';
        }

        dayElement.className += ` ${dayClass}`;

        // Create day content
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-status">
                ${statusIcon}
                <span class="status-text">${statusText}</span>
            </div>
            ${dayReservations.length > 0 ? this.createReservationInfo(dayReservations) : ''}
        `;

        // Add click event for more details
        if (dayReservations.length > 0) {
            dayElement.style.cursor = 'pointer';
            dayElement.addEventListener('click', () => {
                this.showDayDetails(day, dayReservations);
            });
        }

        return dayElement;
    }

    createReservationInfo(reservations) {
        return `
            <div class="reservation-info">
                ${reservations.map(res => `
                    <div class="reservation-item">
                        <div class="client-name">${res.prenom} ${res.nom}</div>
                        <div class="time-slot">${this.formatHoraire(res.horaire)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showDayDetails(day, reservations) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Réservations du ${day} ${this.getMonthName(this.currentMonth)} ${this.currentYear}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${reservations.map(res => `
                        <div class="reservation-detail">
                            <div class="reservation-header">
                                <strong>${res.prenom} ${res.nom}</strong>
                                <span class="time-badge">${this.formatHoraire(res.horaire)}</span>
                            </div>
                            <div class="reservation-info-detail">
                                <div><i class="fas fa-money-bill-wave"></i> Total: ${res.montant_tot || 0} DT</div>
                                <div><i class="fas fa-hand-holding-usd"></i> Avance: ${res.avance || 0} DT</div>
                                <div><i class="fas fa-exclamation-triangle"></i> Reste: ${res.montant_rest || 0} DT</div>
                                <div><i class="fas fa-calendar-plus"></i> Créé: ${this.formatDateTime(res.date_creation)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    updateStats() {
        // Get reservations for current month
        const monthReservations = this.reservations.filter(res => {
            const resDate = new Date(res.date_res);
            return resDate.getMonth() === this.currentMonth && 
                   resDate.getFullYear() === this.currentYear;
        });

        // Calculate basic stats
        const totalReservations = monthReservations.length;
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Count unique days with reservations
        const reservedDays = new Set(monthReservations.map(res => res.date_res)).size;
        const freeDays = daysInMonth - reservedDays;
        
        // Calculate occupation rate
        const occupationRate = Math.round((reservedDays / daysInMonth) * 100);
        
        // Count event types
        const mariageCount = monthReservations.filter(res => 
    res?.notes?.toLowerCase()?.includes('mariage')
    ).length;
      
       console.log('First reservation object:', monthReservations[0]);
console.log('All keys in reservation:', Object.keys(monthReservations[0] || {}));
      
        const hennaCount = monthReservations.filter(res => 
            res.notes && res.notes.includes('Henna')
        ).length;
        
        // Get month name
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const currentMonthName = monthNames[this.currentMonth];

        // Update DOM
        const reservationsTitle = document.getElementById('reservations-title');
        const monthlyReservationsEl = document.getElementById('monthly-reservations');
        const freeDaysTitle = document.getElementById('free-days-title');
        const freeDaysEl = document.getElementById('free-days');
        const occupationRateEl = document.getElementById('occupation-rate');
        const mariageTitle = document.getElementById('mariage-title');
        const mariageCountEl = document.getElementById('mariage-count');
        const hennaTitle = document.getElementById('henna-title');
        const hennaCountEl = document.getElementById('henna-count');

        if (reservationsTitle) {
            reservationsTitle.textContent = `Réservations de ${currentMonthName}`;
        }
        
        if (monthlyReservationsEl) {
            monthlyReservationsEl.textContent = totalReservations;
        }

        if (freeDaysTitle) {
            freeDaysTitle.textContent = `Jours Libres de ${currentMonthName}`;
        }
        
        if (freeDaysEl) {
            freeDaysEl.textContent = freeDays;
        }

        if (occupationRateEl) {
            occupationRateEl.textContent = `${occupationRate}%`;
        }
        
        if (mariageTitle) {
            mariageTitle.textContent = `Mariages de ${currentMonthName}`;
        }
        
        if (mariageCountEl) {
            mariageCountEl.textContent = mariageCount;
        }
        
        if (hennaTitle) {
            hennaTitle.textContent = `Henna de ${currentMonthName}`;
        }
        
        if (hennaCountEl) {
            hennaCountEl.textContent = hennaCount;
        }
    }

    // Utility methods
    formatDateKey(date) {
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    }

    formatHoraire(horaire) {
        const horaireMap = {
            'nuit': 'Soir',
            'apres-midi': 'Après-Midi'
        };
        return horaireMap[horaire] || horaire;
    }

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getMonthName(monthIndex) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[monthIndex] || '';
    }

    showError(message) {
        console.error(message);
        // You can implement a toast notification system here
        alert(message); // Simple fallback
    }
}

// Initialize calendar manager when DOM is loaded
let calendarManager;
document.addEventListener('DOMContentLoaded', () => {
    calendarManager = new CalendarManager();
});