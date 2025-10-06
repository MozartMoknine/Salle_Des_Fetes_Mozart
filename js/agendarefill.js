import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

class agendarefill {
  constructor() {
    this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg'; // Replace with full anon key
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.currentHoraire = 'nuit';
    this.reservations = [];

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    this.cacheDOM();
    this.initializeCalendarControls();
    this.setupFormValidation();
    this.setupFormNavigation();
    await this.loadReservations();
    this.renderCalendar();
    this.bindEvents();
    this.setDefaults();
  }
setDefaults() {
   const ev = document.getElementById('event-type');
const lt = document.getElementById('light-option');
    if (ev) {
        ev.value = 'Mariage'; // Set default event type
    }

    if (lt) {
        lt.checked = true; // Default light option ON
    }


if (ev && lt) {
    ev.addEventListener('change', () => {
        const selected = ev.value.trim().toLowerCase();
        lt.checked = selected == 'Mariage';
    });
}

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

  // Valider seulement quand l'utilisateur quitte le champ montant
  montantInput.addEventListener('blur', validateAmounts);

  // Et aussi quand il modifie l'avance
  avanceInput.addEventListener('input', validateAmounts);
}


  }

  setupFormNavigation() {
    const inputs = [
      this.form.querySelector('input[name="nom"]'),
      this.form.querySelector('input[name="prenom"]'),
      this.form.querySelector('input[name="cin"]'),
      this.form.querySelector('input[name="tel1"]'),
      this.form.querySelector('input[name="tel2"]'),
      this.form.querySelector('input[name="date_res"]'),
      this.form.querySelector('input[name="montant_tot"]'),
      this.form.querySelector('input[name="avance"]')
    ].filter(input => input !== null);

    inputs.forEach((input, index) => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextIndex = index + 1;
          if (nextIndex < inputs.length) {
            inputs[nextIndex].focus();
          } else {
            // Focus on horaire select
            const horaireSelect = this.form.querySelector('select[name="horaire"]');
            if (horaireSelect) horaireSelect.focus();
          }
        }
      });
    });
  }

  cacheDOM() {
    this.form = document.getElementById('reservation-form');
    this.eventType = document.getElementById('event-type');
    this.lightOption = document.getElementById('light-option');
    this.submitBtn = document.getElementById('submit-btn');
    this.successModal = document.getElementById('success-modal');
    this.closeModal = document.getElementById('close-modal');

    this.dateInput = this.form.querySelector('input[name="date_res"]');
    this.horaireSelect = this.form.querySelector('select[name="horaire"]');

    this.monthSelect = document.getElementById('month-select');
    this.yearSelect = document.getElementById('year-select');
    this.horaireView = document.getElementById('horaire-view');
    this.calendarGrid = document.getElementById('calendar-grid');
  }

  initializeCalendarControls() {
    this.monthSelect.value = this.currentMonth;

    const currentYearValue = new Date().getFullYear();
    for (let year = currentYearValue - 1; year <= currentYearValue + 2; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === currentYearValue) option.selected = true;
      this.yearSelect.appendChild(option);
    }

    this.horaireView.value = this.currentHoraire;
  }

  async loadReservations() {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('date_res, horaire, nom, prenom');

    if (error) {
      console.error('Erreur chargement réservations:', error);
      return;
    }

    this.reservations = data || [];
  }

  renderCalendar() {
    this.calendarGrid.innerHTML = '';

    const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    dayHeaders.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-header';
      header.textContent = day;
      this.calendarGrid.appendChild(header);
    });

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Adjust for Monday start (0=Sunday, 1=Monday, etc.)
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Convert Sunday (0) to 6, others shift by -1

    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day other-month';
      this.calendarGrid.appendChild(emptyDay);
    } 

   for (let day = 1; day <= daysInMonth; day++) {
  const dateString = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';
  dayElement.textContent = day;

 const dayReservations = this.reservations.filter(res => res.date_res === dateString);
const hasNuit = dayReservations.some(res => res.horaire === 'nuit');
const hasApresMidi = dayReservations.some(res => res.horaire === 'apres-midi');

if (hasNuit && hasApresMidi) {
  dayElement.classList.add('fullybooked');
  dayElement.title = `Complet: Nuit et Après-midi réservés`;
} else if (hasNuit) {
  dayElement.classList.add('nuitbooked');
  const res = dayReservations.find(r => r.horaire === 'nuit');
  dayElement.title = `Réservé Nuit par ${res.nom} ${res.prenom}`;
} else if (hasApresMidi) {
  dayElement.classList.add('apres-midibooked');
  const res = dayReservations.find(r => r.horaire === 'apres-midi');
  dayElement.title = `Réservé Après-midi par ${res.nom} ${res.prenom}`;
} else {
  dayElement.classList.add('available');
  dayElement.title = 'Disponible';
}
const today = new Date();
const isToday =
  today.getFullYear() === this.currentYear &&
  today.getMonth() === this.currentMonth &&
  today.getDate() === day;

if (isToday) {
  dayElement.classList.add('today');
}
     today.setHours(0, 0, 0, 0); // Normalize to midnight

const currentDate = new Date(this.currentYear, this.currentMonth, day);
currentDate.setHours(0, 0, 0, 0);

const isPast = currentDate < today;
if (isPast) {
  dayElement.classList.add('pastday');
}



  dayElement.addEventListener('click', () => {
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    dayElement.classList.add('selected');
    this.dateInput.value = dateString;
    this.horaireSelect.value = this.currentHoraire;
    this.checkAvailability();
  });

  this.calendarGrid.appendChild(dayElement);
} 
 
  }

  bindEvents() {
    // Auto-check "Jeux de lumière" if event type is Mariage
        const eventType =  document.getElementById('event-type');
          const lightOptions = this.form.querySelector('input[name="options"][value="Jeux de lumière"]');

    eventType.addEventListener('change', () => {
  const value = eventType.value.trim();
 // Attendre que le DOM soit prêt
  setTimeout(() => {
    const lightOption = document.getElementById('light-option');
    if (lightOption) {
      lightOption.checked = (value === 'Mariage');
      console.log('Checkbox forcé:', lightOption.checked);
    }
  }, 0);
      });

    this.dateInput.addEventListener('change', () => this.checkAvailability());
    this.horaireSelect.addEventListener('change', () => this.checkAvailability());

    this.monthSelect.addEventListener('change', e => {
      this.currentMonth = parseInt(e.target.value);
      this.renderCalendar();
    });

    this.yearSelect.addEventListener('change', e => {
      this.currentYear = parseInt(e.target.value);
      this.renderCalendar();
    });

    this.horaireView.addEventListener('change', e => {
      this.currentHoraire = e.target.value;
      this.renderCalendar();
    });

    this.form.addEventListener('submit', e => this.handleFormSubmit(e));

    this.closeModal.addEventListener('click', () => {
      this.successModal.classList.remove('show');
    });

    this.successModal.addEventListener('click', e => {
      if (e.target === this.successModal) {
        this.successModal.classList.remove('show');
      }
    });
  }

  async checkAvailability() {
    const date = this.dateInput.value;
    const horaire = this.horaireSelect.value;

    if (!date || !horaire) {
      const enhancedWarning = document.getElementById('availability-warning-enhanced');
      if (enhancedWarning) enhancedWarning.classList.add('hidden');
      this.submitBtn.disabled = false;
      return;
    }

    const reservation = this.reservations.find(res => res.date_res === date && res.horaire === horaire);

    if (reservation) {
      const enhancedWarning = document.getElementById('availability-warning-enhanced');
      const warningMessage = document.getElementById('warning-message-refill');
      if (enhancedWarning && warningMessage) {
        warningMessage.textContent = `La date ${this.formatDate(date)} pour "${horaire}" est déjà réservée par ${reservation.prenom} ${reservation.nom}`;
        enhancedWarning.classList.remove('hidden');
      }
      this.submitBtn.disabled = true;
    } else {
      const enhancedWarning = document.getElementById('availability-warning-enhanced');
      if (enhancedWarning) enhancedWarning.classList.add('hidden');
      this.submitBtn.disabled = false;
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (!authManager || !authManager.isAuthenticated()) {
      alert('Utilisateur non authentifié');
      return;
    }

    const user = authManager.getCurrentUser();
    const userId = user.id;

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    const montant = parseFloat(data.montant_tot || 0);
    const avance = parseFloat(data.avance || 0);
    const reste = montant - avance;

    let notes = `${data.event_type}\n`;
    const selectedOptions = this.form.querySelectorAll('input[name="options"]:checked');
    selectedOptions.forEach(opt => {
      notes += `${opt.value}\n`;
    });

    // Add manual notes if provided
    if (data.notes_manual && data.notes_manual.trim()) {
      notes += data.notes_manual.trim();
    }

    this.submitBtn.disabled = true;
    this.submitBtn.textContent = '⏳ Enregistrement...';

    try {
      const { error } = await this.supabase.from('reservations').insert({
        nom: data.nom,
        prenom: data.prenom,
        cin: data.cin,
        tel1: data.tel1 || null,
        tel2: data.tel2 || null,
        date_res: data.date_res,
        horaire: data.horaire,
        montant_tot: montant || null,
        avance: avance || null,
        montant_rest: reste || null,
        notes,
        created_by: userId
      });

      if (error) throw error;

      this.successModal.classList.add('show');
      this.form.reset();
      const enhancedWarning = document.getElementById('availability-warning-enhanced');
      if (enhancedWarning) enhancedWarning.classList.add('hidden');
      await this.loadReservations();
      this.renderCalendar();
      document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    } catch (error) {
      alert('Erreur lors de l\'enregistrement: ' + error.message);
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = '💾 Enregistrer la Réservation';
    }
  }

  // Format date for display
formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric' 
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString;
  }
}
}
  // Initialize the agenda refill class
new agendarefill();