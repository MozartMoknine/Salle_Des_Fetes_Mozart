 
// Agenda management with Supabase integration 
class AgendaManager {
    constructor() {
        
        this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg';
         
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        this.reservations = []; 
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredReservations = [];
        this.reservationToDelete = null;
        this.selectedReservation = null;

        this.reservationToEdit = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadReservations();
        this.setupAvailabilityCalendar();
        this.setupPrintPreviewModal();
    }




    setupEventListeners() {
     
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Month filter
        const monthFilter = document.getElementById('month-filter');
        if (monthFilter) {
            monthFilter.addEventListener('change', (e) => this.handleMonthFilter(e.target.value));
        }

        // Excel download button
        const downloadBtn = document.getElementById('download-excel-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadExcel());
        }
        // pdf download button
        const downloadPDFBtn = document.getElementById('download-pdf-btn');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', () => this.exportToPDF());
        }

        // Availability calendar controls
        const availabilityYear = document.getElementById('availability-year');
        const availabilityMonth = document.getElementById('availability-month');
        
        if (availabilityYear && availabilityMonth) {
            availabilityYear.addEventListener('change', () => this.updateAvailabilityCalendar());
            availabilityMonth.addEventListener('change', () => this.updateAvailabilityCalendar());
            
            // Populate years
            this.populateYears();
            
            // Set current month and year
            const now = new Date();
            availabilityMonth.value = now.getMonth() + 1;
            availabilityYear.value = now.getFullYear();
        }

        // Delete modal
        const deleteModal = document.getElementById('delete-modal');
        const cancelDelete = document.getElementById('cancel-delete');
        const confirmDelete = document.getElementById('confirm-delete');
        
        // Details modal
        const detailsModal = document.getElementById('details-modal');
        const closeDetails = document.getElementById('close-details');

        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.hideDeleteModal());
        }

        const closeDelete = document.getElementById('close-delete');
        const verifyDeletePassword = document.getElementById('verify-delete-password');
        const deletePassword = document.getElementById('delete-password');

        if (closeDelete) {
            closeDelete.addEventListener('click', () => this.hideDeleteModal());
        }

        if (verifyDeletePassword) {
            verifyDeletePassword.addEventListener('click', () => this.verifyDeletePassword());
        }

        if (deletePassword) {
            deletePassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyDeletePassword();
                }
            });
        }
        
        if (closeDetails) {
            closeDetails.addEventListener('click', () => this.hideDetailsModal());
        }

        // Close modals when clicking outside
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) {
                    this.hideDeleteModal();
                }
            });
        }
        
        if (detailsModal) {
            detailsModal.addEventListener('click', (e) => {
                if (e.target === detailsModal) {
                    this.hideDetailsModal();
                }
            });
        }

        // Edit modal event listeners
        this.setupEditModalListeners();

        // Pagination
        this.setupPagination();
    }

    setupEditModalListeners() {
        const editModal = document.getElementById('edit-modal');
        const closeEdit = document.getElementById('close-edit');
        const verifyPassword = document.getElementById('verify-password');
        const editPassword = document.getElementById('edit-password');
        const editForm = document.getElementById('edit-form');
        const cancelEdit = document.getElementById('cancel-edit');
        const confirmEditModal = document.getElementById('confirm-edit-modal');
        const cancelConfirmEdit = document.getElementById('cancel-confirm-edit');
        const confirmEditSave = document.getElementById('confirm-edit-save');

        if (closeEdit) {
            closeEdit.addEventListener('click', () => this.hideEditModal());
        }

        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.hideEditModal());
        }

        if (verifyPassword) {
            verifyPassword.addEventListener('click', () => this.verifyEditPassword());
        }

        if (editPassword) {
            editPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyEditPassword();
                }
            });
        }

        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showConfirmEditModal();
            });

            // Auto-calculate remaining amount
            const montantInput = editForm.querySelector('input[name="montant_tot"]');
            const avanceInput = editForm.querySelector('input[name="avance"]');
            const resteInput = editForm.querySelector('input[name="montant_rest"]');

            if (montantInput && avanceInput && resteInput) {
                const updateReste = () => {
                    const montant = parseFloat(montantInput.value) || 0;
                    const avance = parseFloat(avanceInput.value) || 0;
                    resteInput.value = montant - avance;
                };

                montantInput.addEventListener('input', updateReste);
                avanceInput.addEventListener('input', updateReste);
            }
        }

        if (cancelConfirmEdit) {
            cancelConfirmEdit.addEventListener('click', () => this.hideConfirmEditModal());
        }

        if (confirmEditSave) {
            confirmEditSave.addEventListener('click', () => this.saveEditedReservation());
        }

        // Close modals when clicking outside
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.hideEditModal();
                }
            });
        }

        if (confirmEditModal) {
            confirmEditModal.addEventListener('click', (e) => {
                if (e.target === confirmEditModal) {
                    this.hideConfirmEditModal();
                }
            });
        }
    }

    showEditModal(reservationId) {
        const reservation = this.reservations.find(r => r.reservation_id === reservationId);
        if (!reservation) return;
        
        this.reservationToEdit = reservation;
        const modal = document.getElementById('edit-modal');
        const passwordSection = document.getElementById('password-section');
        const editFormSection = document.getElementById('edit-form-section');
        const passwordInput = document.getElementById('edit-password');
        const passwordError = document.getElementById('password-error');
        
        if (!modal) return;
        
        // Reset modal state
        passwordSection.classList.remove('hidden');
        editFormSection.classList.add('hidden');
        passwordInput.value = '';
        passwordError.classList.add('hidden');
        
        // Show modal with animation
        modal.classList.remove('hidden');
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    async verifyEditPassword() {
        const passwordInput = document.getElementById('edit-password');
        const passwordError = document.getElementById('password-error');
        const verifyBtn = document.getElementById('verify-password');
        
        const password = passwordInput.value.trim();
        if (!password) {
            this.showPasswordError('Veuillez entrer votre mot de passe');
            return;
        }

        // Show loading state
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Vérification...';

        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                throw new Error('Utilisateur non authentifié');
            }

            // Verify password with Supabase
            const { error } = await this.supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            });

            if (error) {
                throw new Error('Mot de passe incorrect');
            }

            // Password is correct, show edit form
            this.showEditForm();
            passwordError.classList.add('hidden');

        } catch (error) {
            this.showPasswordError(error.message);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-unlock mr-2"></i>Vérifier';
        }
    }

    showPasswordError(message) {
        const passwordError = document.getElementById('password-error');
        const passwordInput = document.getElementById('edit-password');
        
        passwordError.textContent = message;
        passwordError.classList.remove('hidden');
        
        // Add shake animation
        passwordInput.classList.add('animate-shake');
        setTimeout(() => {
            passwordInput.classList.remove('animate-shake');
        }, 500);
    }

    showEditForm() {
      
        const passwordSection = document.getElementById('password-section');
        const editFormSection = document.getElementById('edit-form-section');
        const editForm = document.getElementById('edit-form');
        
        // Hide password section and show edit form
        passwordSection.classList.add('hidden');
        editFormSection.classList.remove('hidden');
      setTimeout(() => {
  this.setupEditFormValidation();
}, 50);
 const nooote = editForm.querySelector('textarea[name="notes"]');
      nooote.value="";

     // Attach dynamic listeners to update notes on change
const eventTypeSelect = editForm.querySelector('select[name="event_type"]');
const optionsCheckboxes = editForm.querySelectorAll('input[name="options"]');
const notesTextarea = editForm.querySelector('textarea[name="notes"]');

if (eventTypeSelect && notesTextarea && optionsCheckboxes.length > 0) {
  const update = () => {
    this.updateNotesTextarea(eventTypeSelect, optionsCheckboxes, notesTextarea);
  };

  eventTypeSelect.addEventListener('change', update);
  optionsCheckboxes.forEach(cb => cb.addEventListener('change', update));
}

      
        // Populate form with current reservation data
        if (this.reservationToEdit && editForm) {
          console.log("here1");
            const reservation = this.reservationToEdit;
            const eventTypeSelect = editForm.querySelector('select[name="event_type"]');
            const optionsCheckboxes = editForm.querySelectorAll('input[name="options"]');
            const notesTextarea = editForm.querySelector('textarea[name="notes"]');
            
            editForm.querySelector('input[name="nom"]').value = reservation.nom || '';
            editForm.querySelector('input[name="prenom"]').value = reservation.prenom || '';
            editForm.querySelector('input[name="cin"]').value = reservation.cin || '';
            editForm.querySelector('input[name="tel1"]').value = reservation.tel1 || '';
            editForm.querySelector('input[name="tel2"]').value = reservation.tel2 || '';
            editForm.querySelector('input[name="date_res"]').value = reservation.date_res || '';
            editForm.querySelector('select[name="horaire"]').value = reservation.horaire || '';
            editForm.querySelector('input[name="montant_tot"]').value = reservation.montant_tot || '';
            editForm.querySelector('input[name="avance"]').value = reservation.avance || '';
            editForm.querySelector('input[name="montant_rest"]').value = reservation.montant_rest || '';
            
          //here
this.populateEditForm(reservation);
            // Setup form validation and navigation
         

            this.setupEditFormNavigation();
            this.checkEditAvailability();
            
            // Add event listeners for dynamic notes update
           // Attach dynamic listeners to update notes on change




             
        }
    }

    populateEditForm(reservation) {
        const form = document.getElementById('edit-form');
        if (!form) return;

        // Parse notes to extract event type and options
        const notes = reservation.notes || '';
     // console.log('hello' );
        const noteLines = notes.split('\n').filter(line => line.trim());
        
        // Extract event type (first line)
        let eventType = 'Mariage'; // default
        let hasLights = false;
        let hasCafe = false;
        let manualNotes = [];
        
        if (noteLines.length > 0) {
            const firstLine = noteLines[0].trim();
            if (firstLine === 'Henna') {
                eventType = 'Henna';
            } else if (firstLine === 'Mariage') {
                eventType = 'Mariage';
            }
            
            // Check for options in subsequent lines
            for (let i = 1; i < noteLines.length; i++) {
                const line = noteLines[i].trim();
                if (line === 'Jeux de lumière') {
                    hasLights = true;
                } else if (line === 'Café Turk') {
                    hasCafe = true;
                } else if (line) {
                    // This is a manual note
                    manualNotes.push(line);
                }
            }
        }

        // Fill form fields
        form.querySelector('input[name="nom"]').value = reservation.nom || '';
        form.querySelector('input[name="prenom"]').value = reservation.prenom || '';
        form.querySelector('input[name="cin"]').value = reservation.cin || '';
        form.querySelector('input[name="tel1"]').value = reservation.tel1 || '';
        form.querySelector('input[name="tel2"]').value = reservation.tel2 || '';
        form.querySelector('input[name="date_res"]').value = reservation.date_res || '';
        form.querySelector('select[name="horaire"]').value = reservation.horaire || '';
        form.querySelector('input[name="montant_tot"]').value = reservation.montant_tot || '';
        form.querySelector('input[name="avance"]').value = reservation.avance || '';
        
        // Set event type
        const eventTypeSelect = form.querySelector('select[name="event_type"]');
        if (eventTypeSelect) {
            eventTypeSelect.value = eventType;
        }
        
        // Set options checkboxes
        const lightsCheckbox = form.querySelector('input[name="options"][value="Jeux de lumière"]');
        const cafeCheckbox = form.querySelector('input[name="options"][value="Café Turk"]');
        
        if (lightsCheckbox) {
            lightsCheckbox.checked = hasLights;
        }
        if (cafeCheckbox) {
            cafeCheckbox.checked = hasCafe;
        }
        
        // Build notes textarea content
        this.updateNotesTextarea();
        
        // Add manual notes if any
     
     
        if (manualNotes.length > 0) {
             const notesTextarea = form.querySelector('textarea[name="notes"]');
            if (notesTextarea) {
                const currentNotes = notesTextarea.value;
                const lines = currentNotes.split('\n');
                // Add manual notes after the structured content
                const finalNotes = [...lines, ...manualNotes].join('\n');
                notesTextarea.value = finalNotes;
            }
          
        }
     

        // Calculate remaining amount
        this.calculateRemainingAmount();
    }
    
   updateNotesTextarea(eventTypeSelect, optionsCheckboxes, notesTextarea) {
  // Rebuild notes from scratch
  const selectedEvent = eventTypeSelect.value;
  const selectedOptions = Array.from(optionsCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  // Extract manual notes (everything after auto-generated lines)
  const currentLines = notesTextarea.value.split('\n');
  const manualStartIndex = 1 + selectedOptions.length;
  const manualNotes = currentLines.slice(manualStartIndex).join('\n').trim();

  // Build new notes
  let newNotes = selectedEvent + '\n';
  selectedOptions.forEach(opt => {
    newNotes += opt + '\n';
  });
  if (manualNotes) {
    newNotes += manualNotes;
  }

  notesTextarea.value = newNotes;
}


    updateEditNotesTextarea() {
        const eventType = document.getElementById('edit-event-type').value;
        const cafeOption = document.getElementById('edit-cafe-option').checked;
        const lightOption = document.getElementById('edit-light-option').checked;
        const notesTextarea = document.getElementById('edit-notes-textarea');
        
        // Get current textarea content and extract manual notes (everything after options)
        const currentNotes = notesTextarea.value;
        const lines = currentNotes.split('\n');
        
        // Find where manual notes start (after event type and options)
        let manualNotesStartIndex = 1; // Start after event type
        if (cafeOption || lightOption) {
            manualNotesStartIndex = 1 + (cafeOption ? 1 : 0) + (lightOption ? 1 : 0);
        }
        
        // Extract manual notes (preserve user's manual input)
        const manualNotes = lines.slice(manualNotesStartIndex).join('\n').trim();
        
        // Build new notes structure
        let newNotes = eventType;
        
        if (cafeOption) {
            newNotes += '\nCafé Turk';
        }
        
        if (lightOption) {
            newNotes += '\nJeux de lumière';
        }
        
        if (manualNotes) {
            newNotes += '\n' + manualNotes;
        }
        
        notesTextarea.value = newNotes;
    }

    setupEditFormValidation() {
      console.log('editvalid');
        const editForm = document.getElementById('edit-form');
        if (!editForm) return;

        const cinInput = editForm.querySelector('input[name="cin"]');
        const tel1Input = editForm.querySelector('input[name="tel1"]');
        const tel2Input = editForm.querySelector('input[name="tel2"]');
        const montantInput = editForm.querySelector('input[name="montant_tot"]');
        const avanceInput = editForm.querySelector('input[name="avance"]');

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
               // Amount validation
         if (montantInput && avanceInput) {
  const validateAmounts = () => {
    const montant = parseFloat(montantInput.value) || 0;
    const avance = parseFloat(avanceInput.value) || 0;

    if (avance > montant) {
      avanceInput.setCustomValidity('L\'avance ne peut pas être supérieure au montant total');
      avanceInput.reportValidity();
      console.log('here');
    } else {
      avanceInput.setCustomValidity('');
      console.log('here');
    }
  };

  // Valider seulement quand l'utilisateur quitte le champ montant
  montantInput.addEventListener('blur', validateAmounts);

  // Et aussi quand il modifie l'avance
  avanceInput.addEventListener('input', validateAmounts);
}

        // Date and horaire change validation
        const dateInput = editForm.querySelector('input[name="date_res"]');
        const horaireSelect = editForm.querySelector('select[name="horaire"]');
        
        if (dateInput) {
            dateInput.addEventListener('change', () => this.checkEditAvailability());
        }
        if (horaireSelect) {
            horaireSelect.addEventListener('change', () => this.checkEditAvailability());
        }
        
        // Event listeners for notes updates
        
    }

    setupEditFormNavigation() {
        const editForm = document.getElementById('edit-form');
        if (!editForm) return;

        const inputs = [
            editForm.querySelector('input[name="nom"]'),
            editForm.querySelector('input[name="prenom"]'),
            editForm.querySelector('input[name="cin"]'),
            editForm.querySelector('input[name="tel1"]'),
            editForm.querySelector('input[name="tel2"]'),
            editForm.querySelector('input[name="date_res"]'),
            editForm.querySelector('input[name="montant_tot"]'),
            editForm.querySelector('input[name="avance"]')
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
                        const horaireSelect = editForm.querySelector('select[name="horaire"]');
                        if (horaireSelect) horaireSelect.focus();
                    }
                }
            });
        });
    }

    updateNotesTextarea() {
        const form = document.getElementById('edit-form');
        if (!form) return;
        
        const eventTypeSelect = form.querySelector('select[name="event_type"]');
        const notesTextarea = form.querySelector('textarea[name="notes"]');
        const lightsCheckbox = form.querySelector('input[name="options"][value="Jeux de lumière"]');
        const cafeCheckbox = form.querySelector('input[name="options"][value="Café Turk"]');
        
        if (!eventTypeSelect || !notesTextarea) return;
        
        // Get current manual notes (preserve user input after structured content)
        const currentNotes = notesTextarea.value;
        const currentLines = currentNotes.split('\n');
        
        // Find where manual notes start (after structured content)
        let manualNotesStartIndex = -1;
        for (let i = 0; i < currentLines.length; i++) {
            const line = currentLines[i].trim();
            if (line && 
                line !== 'Mariage' && 
                line !== 'Henna' && 
                line !== 'Jeux de lumière' && 
                line !== 'Café Turk') {
                manualNotesStartIndex = i;
                break;
            }
        }
        
        // Build new structured content
        let newNotes = [];
        
        // Add event type
        newNotes.push(eventTypeSelect.value);
        
        // Add selected options
        if (cafeCheckbox && cafeCheckbox.checked) {
            newNotes.push('Café Turk');
        }
        if (lightsCheckbox && lightsCheckbox.checked) {
            newNotes.push('Jeux de lumière');
        }
        
        // Add preserved manual notes
        if (manualNotesStartIndex >= 0) {
            const manualNotes = currentLines.slice(manualNotesStartIndex);
            newNotes = [...newNotes, ...manualNotes];
        }
        
        // Update textarea
        notesTextarea.value = newNotes.join('\n');
    }

    checkEditAvailability() {
        const editForm = document.getElementById('edit-form');
        if (!editForm || !this.reservationToEdit) return;

        const dateInput = editForm.querySelector('input[name="date_res"]');
        const horaireSelect = editForm.querySelector('select[name="horaire"]');
        const saveButton = editForm.querySelector('button[type="submit"]');
        const warning = document.getElementById('edit-availability-warning');
        const warningMessage = document.getElementById('edit-warning-message');

        const selectedDate = dateInput.value;
        const selectedHoraire = horaireSelect.value;

        if (!selectedDate || !selectedHoraire) {
            if (warning) warning.classList.add('hidden');
            if (saveButton) saveButton.disabled = false;
            return;
        }

        // Check if this date/horaire is taken by another reservation
        const conflictingReservation = this.reservations.find(res => 
            res.date_res === selectedDate && 
            res.horaire === selectedHoraire && 
            res.reservation_id !== this.reservationToEdit.reservation_id
        );

        if (conflictingReservation) {
            if (warning && warningMessage) {
                warningMessage.textContent = `La date ${this.formatDateWithDay(selectedDate)} pour "${selectedHoraire}" est déjà réservée par ${conflictingReservation.prenom} ${conflictingReservation.nom}`;
                warning.classList.remove('hidden');
            }
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            if (warning) warning.classList.add('hidden');
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    showConfirmEditModal() {
        const confirmModal = document.getElementById('confirm-edit-modal');
        if (confirmModal) {
            confirmModal.classList.remove('hidden');
            setTimeout(() => {
                const modalContent = confirmModal.querySelector('.modal-content');
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    }

    hideConfirmEditModal() {
        const confirmModal = document.getElementById('confirm-edit-modal');
        if (confirmModal) {
            const modalContent = confirmModal.querySelector('.modal-content');
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                confirmModal.classList.add('hidden');
            }, 300);
        }
    }

    async saveEditedReservation() {
        if (!this.reservationToEdit) return;

        const editForm = document.getElementById('edit-form');
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData);

        try {
            // Use notes directly from textarea (already formatted by updateEditNotesTextarea)
            const notes = data.notes.trim();

            const { error } = await this.supabase
                .from('reservations')
                .update({
                    nom: data.nom,
                    prenom: data.prenom,
                    cin: data.cin,
                    tel1: data.tel1 || null,
                    tel2: data.tel2 || null,
                    date_res: data.date_res,
                    horaire: data.horaire,
                    montant_tot: parseFloat(data.montant_tot) || null,
                    avance: parseFloat(data.avance) || null,
                    montant_rest: parseFloat(data.montant_rest) || null,
                    notes: notes
                })
                .eq('reservation_id', this.reservationToEdit.reservation_id);

            if (error) {
                throw error;
            }

            // Update local data
            await this.loadReservations();
            this.renderTable();
            this.updatePagination();
            this.updateAvailabilityCalendar();

            // Hide modals
            this.hideConfirmEditModal();
            this.hideEditModal();
            this.hideDetailsModal();

            this.showSuccessModal('Réservation modifiée avec succès');

        } catch (error) {
            console.error('Error updating reservation:', error);
            this.showError('Erreur lors de la modification de la réservation');
        }
    }

  //succes modal modif
  showSuccessModal(message) {
  const modal = document.getElementById('success-modal');
  const messageBox = document.getElementById('success-message');
  const closeBtn = document.getElementById('success-close-btn');

  if (modal && messageBox && closeBtn) {
    messageBox.textContent = message;
    modal.classList.remove('hidden');

    closeBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }
}


    hideEditModal() {
        const modal = document.getElementById('edit-modal');
        if (!modal) return;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            this.reservationToEdit = null;
        }, 300);
    }

    async loadReservations() {
        try {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await this.supabase
                .from('reservations')
                .select(`
                    *,
                    created_by_user:users!fk_reservations_created_by(username,nom)
                `)
                .gte('date_res', today)
                .order('date_res', { ascending: true });

            if (error) {
                throw error;
            }

            this.reservations = data || [];
            this.filteredReservations = [...this.reservations];
            this.renderTable();
            this.updatePagination();
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.showError('Erreur lors du chargement des réservations');
        }
    }



 
    async loadPreviousReservations() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

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
                .lt('date_res', yesterdayStr)
                .order('date_res', { ascending: false });

            if (error) {
                throw error;
            }

            this.previousReservations = data || [];
            console.log('Loaded previous reservations:', this.previousReservations.length);

        } catch (error) {
            console.error('Error loading previous reservations:', error);
            this.showError('Erreur lors du chargement des réservations précédentes');
        }
    }

    async showPreviousReservationsModal() {
        await this.loadPreviousReservations();
        this.renderPreviousReservations();
        
        const modal = document.getElementById('previous-reservations-modal');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    }

    hidePreviousReservationsModal() {
        const modal = document.getElementById('previous-reservations-modal');
        if (modal) {
            modal.querySelector('.modal-content').classList.remove('scale-100', 'opacity-100');
            modal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    renderPreviousReservations() {
        const tableBody = document.getElementById('previous-reservations-table');
        const countElement = document.getElementById('previous-count');
        const paginationInfo = document.getElementById('previous-pagination-info');
        const paginationControls = document.getElementById('previous-pagination-controls');
        
        if (!tableBody) return;

        // Filter reservations based on search term
        let filteredReservations = this.previousReservations;
        
        if (this.previousSearchTerm) {
            filteredReservations = this.previousReservations.filter(reservation => {
                const searchFields = [
                    reservation.nom || '',
                    reservation.prenom || '',
                    reservation.date_res || '',
                    reservation.horaire || '',
                    reservation.notes || '',
                    this.formatDate(reservation.date_res),
                    new Date(reservation.date_res).getFullYear().toString(),
                    this.getMonthName(new Date(reservation.date_res).getMonth())
                ];
                
                return searchFields.some(field => 
                    field.toLowerCase().includes(this.previousSearchTerm)
                );
            });
        }

        // Update count
        if (countElement) {
            countElement.textContent = `Total: ${filteredReservations.length} réservations`;
        }

        // Calculate pagination
        const totalPages = Math.ceil(filteredReservations.length / this.previousItemsPerPage);
        const startIndex = (this.previousCurrentPage - 1) * this.previousItemsPerPage;
        const endIndex = startIndex + this.previousItemsPerPage;
        const currentReservations = filteredReservations.slice(startIndex, endIndex);

        // Render table rows
        tableBody.innerHTML = '';
        
        if (currentReservations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        ${this.previousSearchTerm ? 'Aucune réservation trouvée pour cette recherche' : 'Aucune réservation précédente'}
                    </td>
                </tr>
            `;
        } else {
            currentReservations.forEach(reservation => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                const notes = reservation.notes ? 
                    reservation.notes.split('\n').filter(note => note.trim()).join(', ') : 
                    '-';
                
                row.innerHTML = `
                    <td class="px-4 py-3 text-sm">
                        <div class="font-medium text-gray-900">${this.formatDate(reservation.date_res)}</div>
                        <div class="text-gray-500">${this.formatDateDay(reservation.date_res)}</div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                        <div class="font-medium text-gray-900">${reservation.prenom} ${reservation.nom}</div>
                        ${reservation.tel1 ? `<div class="text-gray-500">${reservation.tel1}</div>` : ''}
                    </td>
                    <td class="px-4 py-3 text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reservation.horaire === 'nuit' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }">
                            ${reservation.horaire === 'nuit' ? 'Soir' : 'Après-midi'}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title="${notes}">
                        ${notes}
                    </td>
                    <td class="px-4 py-3 text-sm font-medium space-x-2">
                        <button onclick="agendaManager.showPreviousReservationDetails('${reservation.reservation_id}')" 
                                class="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded">
                            <i class="fas fa-eye mr-1"></i>Détails
                        </button>
                        <button onclick="window.open('contract-preview.html?id=${reservation.reservation_id}', '_blank')" 
                                class="text-green-600 hover:text-green-900 text-xs bg-green-50 hover:bg-green-100 px-2 py-1 rounded">
                            <i class="fas fa-print mr-1"></i>Imprimer
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }

        // Update pagination info
        if (paginationInfo && filteredReservations.length > 0) {
            const start = startIndex + 1;
            const end = Math.min(endIndex, filteredReservations.length);
            paginationInfo.textContent = `Affichage de ${start} à ${end} sur ${filteredReservations.length} réservations`;
        } else if (paginationInfo) {
            paginationInfo.textContent = '';
        }

        // Update pagination controls
        this.updatePreviousPaginationControls(totalPages, filteredReservations.length);
    }

    updatePreviousPaginationControls(totalPages, totalItems) {
        const paginationControls = document.getElementById('previous-pagination-controls');
        const prevMobile = document.getElementById('previous-prev-mobile');
        const nextMobile = document.getElementById('previous-next-mobile');
        
        if (!paginationControls) return;

        // Update mobile buttons
        if (prevMobile) {
            prevMobile.disabled = this.previousCurrentPage === 1;
            prevMobile.onclick = () => {
                if (this.previousCurrentPage > 1) {
                    this.previousCurrentPage--;
                    this.renderPreviousReservations();
                }
            };
        }

        if (nextMobile) {
            nextMobile.disabled = this.previousCurrentPage === totalPages || totalPages === 0;
            nextMobile.onclick = () => {
                if (this.previousCurrentPage < totalPages) {
                    this.previousCurrentPage++;
                    this.renderPreviousReservations();
                }
            };
        }

        // Update desktop pagination
        paginationControls.innerHTML = '';
        
        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = `relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
            this.previousCurrentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700'
        }`;
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = this.previousCurrentPage === 1;
        prevBtn.onclick = () => {
            if (this.previousCurrentPage > 1) {
                this.previousCurrentPage--;
                this.renderPreviousReservations();
            }
        };
        paginationControls.appendChild(prevBtn);

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.previousCurrentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                i === this.previousCurrentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                this.previousCurrentPage = i;
                this.renderPreviousReservations();
            };
            paginationControls.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = `relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
            this.previousCurrentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700'
        }`;
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = this.previousCurrentPage === totalPages;
        nextBtn.onclick = () => {
            if (this.previousCurrentPage < totalPages) {
                this.previousCurrentPage++;
                this.renderPreviousReservations();
            }
        };
        paginationControls.appendChild(nextBtn);
    }

    async showPreviousReservationDetails(reservationId) {
        try {
            const { data, error } = await this.supabase
                .from('reservations')
                .select(`
                    *,
                    users!fk_reservations_created_by(username, nom)
                `)
                .eq('reservation_id', reservationId)
                .single();

            if (error) throw error;

            const modal = document.getElementById('previous-details-modal');
            const content = document.getElementById('previous-details-content');
            
            if (!modal || !content) return;

            const reservation = data;
            const createdBy = reservation.users?.nom || reservation.users?.username || 'Inconnu';
            
            content.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-800 border-b pb-2">Informations Client</h4>
                        <div class="space-y-2">
                            <p><span class="font-medium">Nom:</span> ${reservation.nom}</p>
                            <p><span class="font-medium">Prénom:</span> ${reservation.prenom}</p>
                            ${reservation.cin ? `<p><span class="font-medium">CIN:</span> ${String(reservation.cin).padStart(8, '0')}</p>` : ''}
                            ${reservation.tel1 ? `<p><span class="font-medium">Téléphone 1:</span> ${reservation.tel1}</p>` : ''}
                            ${reservation.tel2 ? `<p><span class="font-medium">Téléphone 2:</span> ${reservation.tel2}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-800 border-b pb-2">Détails Réservation</h4>
                        <div class="space-y-2">
                            <p><span class="font-medium">Date:</span> ${this.formatDate(reservation.date_res)}</p>
                            <p><span class="font-medium">Jour:</span> ${this.formatDateDay(reservation.date_res)}</p>
                            <p><span class="font-medium">Horaire:</span> 
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    reservation.horaire === 'nuit' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                                }">
                                    ${reservation.horaire === 'nuit' ? 'Soir (20h30-01h00)' : 'Après-midi (15h30-20h00)'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-800 border-b pb-2">Informations Financières</h4>
                        <div class="space-y-2">
                            <p><span class="font-medium">Montant Total:</span> <span class="text-green-600 font-semibold">${reservation.montant_tot || 0} DT</span></p>
                            <p><span class="font-medium">Avance Payée:</span> <span class="text-blue-600 font-semibold">${reservation.avance || 0} DT</span></p>
                            <p><span class="font-medium">Reste à Payer:</span> <span class="text-red-600 font-semibold">${reservation.montant_rest || 0} DT</span></p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-800 border-b pb-2">Informations Système</h4>
                        <div class="space-y-2">
                            <p><span class="font-medium">Créé par:</span> ${createdBy}</p>
                            <p><span class="font-medium">Date de création:</span> ${this.formatDateTime(reservation.date_creation)}</p>
                            <p><span class="font-medium">ID Réservation:</span> ${reservation.reservation_id}</p>
                        </div>
                    </div>
                </div>
                
                ${reservation.notes ? `
                    <div class="mt-6">
                        <h4 class="font-semibold text-gray-800 border-b pb-2 mb-3">Notes</h4>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <pre class="whitespace-pre-wrap text-sm text-gray-700">${reservation.notes}</pre>
                        </div>
                    </div>
                ` : ''}
                
                <div class="mt-6 flex justify-center">
                    <button onclick="window.open('contract-preview.html?id=${reservation.reservation_id}', '_blank')" 
                            class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                        <i class="fas fa-print"></i>
                        Imprimer Contrat
                    </button>
                </div>
            `;

            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
            }, 10);

        } catch (error) {
            console.error('Error loading reservation details:', error);
            this.showError('Erreur lors du chargement des détails');
        }
    }


 

    renderTable() {
        const tableBody = document.getElementById('reservations-table');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageReservations = this.filteredReservations.slice(startIndex, endIndex);

        if (pageReservations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        Aucune réservation trouvée
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = pageReservations.map(reservation => `
            <tr class="table-row hover:bg-gray-50 transition-colors">
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                        ${this.formatDateWithDay(reservation.date_res)}
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">${reservation.prenom} ${reservation.nom}</div>
                    <div class="text-xs text-gray-500">${reservation.tel1 || ''}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <span class="horaire-badge ${reservation.horaire === 'nuit' ? 'horaire-nuit' : 'horaire-apres-midi'}">
                        ${this.formatHoraire(reservation.horaire)}
                    </span>
                </td>
                <td class="px-4 py-4 max-w-xs">
                    <div class="text-sm text-gray-500 truncate" title="${reservation.notes || ''}">${reservation.notes || '-'}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex space-x-2">
                        <button onclick="agendaManager.showDetailsModal('${reservation.reservation_id}')" 
                                class="action-btn action-btn-view" 
                                title="Voir les détails">
                            <i class="fas fa-eye"></i>
                            <span>Détails</span>
                        </button>
                        <button onclick="agendaManager.showDeleteModal('${reservation.reservation_id}')" 
                                class="action-btn action-btn-delete" 
                                title="Supprimer">
                            <i class="fas fa-trash"></i>
                            <span>Supprimer</span> 
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    applyFilters() {
        let filtered = [...this.reservations];
        
        // Ensure we only show upcoming reservations (double check)
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(reservation => reservation.date_res >= today);

        // Apply search filter
        if (this.currentSearchTerm) {
            const searchTerm = this.currentSearchTerm.toLowerCase();
            filtered = filtered.filter(reservation => {
                const fullName = `${reservation.prenom} ${reservation.nom}`.toLowerCase();
                const date = this.formatDate(reservation.date_res).toLowerCase();
                const month = this.getMonthName(new Date(reservation.date_res).getMonth()).toLowerCase();

                return fullName.includes(searchTerm) || 
                       date.includes(searchTerm) || 
                       month.includes(searchTerm) ||
                       String(reservation.tel1 || '').includes(searchTerm) ||
                       String(reservation.tel2 || '').includes(searchTerm);
            });
        }

        // Apply month filter
        if (this.currentMonthFilter) {
            filtered = filtered.filter(reservation => {
                const reservationMonth = new Date(reservation.date_res).getMonth() + 1;
                return reservationMonth === parseInt(this.currentMonthFilter);
            });
        }

        this.filteredReservations = filtered;
    }

   handleSearch(query) {
    if (!query.trim()) {
        this.filteredReservations = [...this.reservations];
    } else {
        const searchTerm = query.toLowerCase();
        this.filteredReservations = this.reservations.filter(reservation => {
            const fullName = `${reservation.prenom} ${reservation.nom}`.toLowerCase();
            const date = this.formatDate(reservation.date_res).toLowerCase();
            const month = this.getMonthName(new Date(reservation.date_res).getMonth()).toLowerCase();

            return fullName.includes(searchTerm) || 
                   date.includes(searchTerm) || 
                   month.includes(searchTerm) ||
                   String(reservation.tel1 || '').includes(searchTerm) ||
                   String(reservation.tel2 || '').includes(searchTerm);
        });
    }

    this.currentPage = 1;
    this.renderTable();
    this.updatePagination();
}


    handleMonthFilter(month) {
        if (!month) {
            this.filteredReservations = [...this.reservations];
        } else {
            this.filteredReservations = this.reservations.filter(reservation => {
                const reservationMonth = new Date(reservation.date_res).getMonth() + 1;
                return reservationMonth === parseInt(month);
            });
        }
        
        this.currentPage = 1;
        this.renderTable();
        this.updatePagination();
    }

    setupPagination() {
        const prevMobile = document.getElementById('prev-mobile');
        const nextMobile = document.getElementById('next-mobile');

        if (prevMobile) {
            prevMobile.addEventListener('click', () => this.previousPage());
        }

        if (nextMobile) {
            nextMobile.addEventListener('click', () => this.nextPage());
        }
    }

    updatePagination() {
        const totalItems = this.filteredReservations.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Update pagination info
        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo) {
            if (totalItems === 0) {
                paginationInfo.textContent = 'Aucune réservation';
            } else {
                paginationInfo.textContent = `Affichage de ${startItem} à ${endItem} sur ${totalItems} réservations`;
            }
        }

        // Update pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        if (paginationControls) {
            let controlsHTML = '';

            // Previous button
            controlsHTML += `
                <button ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="agendaManager.previousPage()" 
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${this.currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === this.currentPage) {
                    controlsHTML += `
                        <button class="relative inline-flex items-center px-4 py-2 border border-gold bg-gold text-sm font-medium text-black">
                            ${i}
                        </button>
                    `;
                } else {
                    controlsHTML += `
                        <button onclick="agendaManager.goToPage(${i})" 
                                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            ${i}
                        </button>
                    `;
                }
            }

            // Next button
            controlsHTML += `
                <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                        onclick="agendaManager.nextPage()" 
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${this.currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;

            paginationControls.innerHTML = controlsHTML;
        }

        // Update mobile pagination buttons
        const prevMobile = document.getElementById('prev-mobile');
        const nextMobile = document.getElementById('next-mobile');

        if (prevMobile) {
            prevMobile.disabled = this.currentPage === 1;
            prevMobile.classList.toggle('opacity-50', this.currentPage === 1);
        }

        if (nextMobile) {
            nextMobile.disabled = this.currentPage === totalPages;
            nextMobile.classList.toggle('opacity-50', this.currentPage === totalPages);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredReservations.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
            this.updatePagination();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
        this.updatePagination();
    }

    showDetailsModal(reservationId) {
     
        const reservation = this.reservations.find(r => r.reservation_id === reservationId);
        if (!reservation) return;
        
        this.selectedReservation = reservation;
        const modal = document.getElementById('details-modal');
        const content = document.getElementById('details-content');
        
        if (!modal || !content) return;
        
        // Populate modal content
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-100px)]">
                <div class="space-y-4">
                    <div class="detail-group">
                        <label class="detail-label">Client</label>
                        <div class="detail-value">${reservation.prenom} ${reservation.nom}</div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">CIN</label>
                        <div class="detail-value">${reservation.cin || 'Non renseigné'}</div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">Téléphones</label>
                        <div class="detail-value">
                            <div>${reservation.tel1 || 'Non renseigné'}</div>
                            ${reservation.tel2 ? `<div class="text-sm text-gray-600">${reservation.tel2}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">Date & Horaire</label>
                        <div class="detail-value">
                            <div class="font-semibold">${this.formatDateWithDay(reservation.date_res)}</div>
                            <span class="horaire-badge ${reservation.horaire === 'nuit' ? 'horaire-nuit' : 'horaire-apres-midi'} mt-1 inline-block">
                                ${this.formatHoraire(reservation.horaire)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="detail-group">
                        <label class="detail-label">Montant Total</label>
                        <div class="detail-value text-green-600 font-bold text-lg">${reservation.montant_tot || 0} DT</div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">Avance Payée</label>
                        <div class="detail-value text-blue-600 font-semibold">${reservation.avance || 0} DT</div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">Reste à Payer</label>
                        <div class="detail-value ${(reservation.montant_rest || 0) > 0 ? 'text-red-600' : 'text-green-600'} font-semibold">
                            ${reservation.montant_rest || 0} DT
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">Créé par</label>
                        <div class="detail-value">${reservation.created_by_user?.nom || 'Utilisateur inconnu'}</div>
                    </div>
                    
                    <div class="detail-group">
                        <label class="detail-label">Date de création</label>
                        <div class="detail-value text-sm text-gray-600">${this.formatDateTime(reservation.date_creation)}</div>
                    </div>
                </div>
            </div>
            
            <div class="mt-1 pt-6 border-t border-gray-200">
                <div class="flex flex-col gap-4">
                    ${reservation.notes ? `
                        <div class="detail-group">
                            <label class="detail-label">Notes</label>
                            <div class="detail-value bg-gray-50 p-3 rounded-md whitespace-pre-line">${reservation.notes}</div>
                        </div>
                    ` : ''}
                    
                    <div class="flex flex-col md:flex-row gap-3 justify-center md:justify-end">
                        <button onclick="agendaManager.showEditModal('${reservation.reservation_id}')"
                                class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center justify-center">
                            <i class="fas fa-edit mr-2"></i>
                            Modifier
                        </button>
                        <button onclick="agendaManager.printContract('${reservation.reservation_id}')"
                                class="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-darkgold transition-colors inline-flex items-center justify-center">
                            <i class="fas fa-print mr-2"></i>
                            Imprimer Contrat
                        </button>
                    </div>
                </div>
            </div>
`;
        
        // Show modal with animation
        modal.classList.remove('hidden');
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
    
    hideDetailsModal() {
        const modal = document.getElementById('details-modal');
        if (!modal) return;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            this.selectedReservation = null;
        }, 300);
    }

    showDeleteModal(reservationId) {
        this.reservationToDelete = reservationId;
        const reservation = this.reservations.find(r => r.reservation_id === reservationId);
        
        const modal = document.getElementById('delete-modal');
        const deletePassword = document.getElementById('delete-password');
        const deletePasswordError = document.getElementById('delete-password-error');
        
        if (modal) {
            // Reset modal state
            deletePassword.value = '';
            deletePasswordError.classList.add('hidden');
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
                deletePassword.focus();
            }, 10);
        }
    }

    hideDeleteModal() {
        this.reservationToDelete = null;
        const modal = document.getElementById('delete-modal');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    async verifyDeletePassword() {
        const deletePassword = document.getElementById('delete-password');
        const deletePasswordError = document.getElementById('delete-password-error');
        const verifyBtn = document.getElementById('verify-delete-password');
        
        const password = deletePassword.value.trim();
        if (!password) {
            this.showDeletePasswordError('Veuillez entrer votre mot de passe');
            return;
        }

        // Show loading state
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Vérification...';

        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                throw new Error('Utilisateur non authentifié');
            }

            // Verify password with Supabase
            const { error } = await this.supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            });

            if (error) {
                throw new Error('Mot de passe incorrect');
            }

            // Password is correct, proceed with deletion
            await this.confirmDelete();
            deletePasswordError.classList.add('hidden');

        } catch (error) {
            this.showDeletePasswordError(error.message);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-trash mr-2"></i>Supprimer';
        }
    }

    showDeletePasswordError(message) {
        const deletePasswordError = document.getElementById('delete-password-error');
        const deletePassword = document.getElementById('delete-password');
        
        deletePasswordError.textContent = message;
        deletePasswordError.classList.remove('hidden');
        
        // Add shake animation
        deletePassword.classList.add('animate-shake');
        setTimeout(() => {
            deletePassword.classList.remove('animate-shake');
        }, 500);
    }
  
    async confirmDelete() {
        if (!this.reservationToDelete) return;

        try {
            const { error } = await this.supabase
                .from('reservations')
                .delete()
                .eq('reservation_id', this.reservationToDelete);

            if (error) {
                throw error;
            }

            // Remove from local array
            this.reservations = this.reservations.filter(r => r.reservation_id !== this.reservationToDelete);
            this.filteredReservations = this.filteredReservations.filter(r => r.reservation_id !== this.reservationToDelete);

            // Update display
            this.renderTable();
            this.updatePagination();
            this.updateAvailabilityCalendar();

            this.hideDeleteModal();
           this.showDeleteSuccessModal('Réservation supprimée avec succès');

        } catch (error) {
            console.error('Error deleting reservation:', error);
            this.showError('Erreur lors de la suppression de la réservation');
        }
    }

  //delete modal success
  showDeleteSuccessModal(message) {
  const modal = document.getElementById('delete-success-modal');
  const messageBox = document.getElementById('delete-success-message');
  const closeBtn = document.getElementById('delete-success-close-btn');

  if (modal && messageBox && closeBtn) {
    messageBox.textContent = message;
    modal.classList.remove('hidden');

    closeBtn.onclick = () => {
      modal.classList.add('hidden');
    };

    // Fermeture automatique après 2.5 secondes
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 3000);
  }
}


    setupAvailabilityCalendar() {
        this.populateYears();
        this.updateAvailabilityCalendar();
    }

    populateYears() {
        const yearSelect = document.getElementById('availability-year');
        if (!yearSelect) return;

        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';

        for (let year = currentYear - 1; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }

    async updateAvailabilityCalendar() {
        const yearSelect = document.getElementById('availability-year');
        const monthSelect = document.getElementById('availability-month');
        const calendarDiv = document.getElementById('availability-calendar');

        if (!yearSelect || !monthSelect || !calendarDiv) return;

        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value) - 1; // JavaScript months are 0-indexed

        // Get reservations for this month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        try {
            const { data: monthReservations, error } = await this.supabase
                .from('reservations')
                .select('date_res, horaire')
                .gte('date_res', startDate.toISOString().split('T')[0])
                .lte('date_res', endDate.toISOString().split('T')[0]);

            if (error) {
                throw error;
            }

            this.renderAvailabilityCalendar(year, month, monthReservations || []);

        } catch (error) {
            console.error('Error loading availability:', error);
            this.showError('Erreur lors du chargement du calendrier');
        }
    }

    renderAvailabilityCalendar(year, month, reservations) {
        const calendarDiv = document.getElementById('availability-calendar');
        if (!calendarDiv) return;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create reservation map for quick lookup
        const reservationMap = {};
        reservations.forEach(res => {
            const dateKey = res.date_res;
            if (!reservationMap[dateKey]) {
                reservationMap[dateKey] = [];
            }
            reservationMap[dateKey].push(res.horaire);
        });

        let calendarHTML = '';

        // Add day headers
        const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-header text-center font-bold py-2 bg-gray-800 text-white rounded">${day}</div>`;
        });

        // Add empty cells for days before the first day of the month
        // Adjust for Monday start (0=Sunday, 1=Monday, etc.)
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1; // Convert Sunday (0) to 6, others shift by -1
        for (let i = 0; i < startDay; i++) {
            calendarHTML += '<div class="h-20 bg-gray-100 rounded"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            const dateKey = currentDate.toLocaleDateString('en-CA'); 
            const dayReservations = reservationMap[dateKey] || [];

            let dayClass = 'h-20 border border-gray-200 rounded p-1 ';
            let dayContent = `<div class="font-semibold text-sm">${day}</div>`;

            if (currentDate < today) {
                // Past date
                dayClass += 'bg-gray-300 text-gray-600';
            }else if (dayReservations.length === 2) {
                // Fully booked (both nuit and apres-midi)
                dayClass += 'bg-red-200 border-red-400';
                dayContent += '<div class="text-xs text-red-700">Complet</div>';
            } else if (dayReservations.length === 1) {
                // Partially booked
                 // Partially booked
    if (dayReservations.includes('nuit')) {
        // Nuit is booked → Après-midi is free
        dayClass += 'bg-yellow-100 border-yellow-400';
        dayContent += '<div class="text-xs text-yellow-700">Après-midi Libre</div>';
    } else {
        // Après-midi is booked → Nuit is free
        dayClass += 'bg-purple-100 border-purple-400';
        dayContent += '<div class="text-xs text-purple-700">Nuit Libre</div>';
    }
            }      else if (dayReservations.length === 0) {
                // Available
                dayClass += 'bg-green-100 border-green-400';
                dayContent += '<div class="text-xs text-green-700">Libre</div>';
            }

            calendarHTML += `<div class="${dayClass}">${dayContent}</div>`;
        }

        calendarDiv.innerHTML = calendarHTML;
    }

    // Utility methods
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateWithDay(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayName = dayNames[date.getDay()];
        
        return `${dayName} ${date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })}`;
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

    formatHoraire(horaire) {
        const horaireMap = {
            'nuit': 'Nuit',
            'apres-midi': 'Après-Midi'
        };
        return horaireMap[horaire] || horaire;
    }

    getMonthName(monthIndex) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[monthIndex] || '';
    }

    showError(message) {
        // You can implement a toast notification system here
        console.error(message);
        alert(message); // Simple fallback
    }

    showSuccess(message) {
        // You can implement a toast notification system here
        console.log(message);
        alert(message); // Simple fallback
    }

    async printContract(reservationId) {
        const reservation = this.reservations.find(r => r.reservation_id === reservationId);
        if (!reservation) return;

        window.open(`contract-preview.html?id=${reservationId}`, '_blank');
    }

    showPrintPreview(svgElement) {
        const previewModal = document.getElementById('print-preview-modal');
        const previewContent = document.getElementById('print-preview-content');

        if (previewModal && previewContent && svgElement) {
            previewContent.innerHTML = svgElement.outerHTML;

            const previewSvg = previewContent.querySelector('svg');
            if (previewSvg) {
                previewSvg.setAttribute('width', '100%');
               // previewSvg.setAttribute('height', 'auto');
             previewSvg.style.height = 'auto';

                previewSvg.style.maxWidth = '600px';
                previewSvg.id = 'preview-svg-display';
            }

            previewModal.classList.remove('hidden');
        }
    }

    async loadContractSVG(svgElement) {
        const paths = [
            '/contrat-web.svg',
            './contrat-web.svg',
            '/public/contrat-web.svg',
            './public/contrat-web.svg'
        ];
        
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    svgElement.innerHTML = await response.text();
                    return;
                }
            } catch (error) {
                console.log(`Failed to load SVG from ${path}`);
            }
        }
        
        // Fallback SVG elements
        svgElement.innerHTML = `
            <text id="nom" x="120" y="120" font-size="16" fill="gold"></text>
            <text id="prenom" x="200" y="120" font-size="16" fill="gold"></text>
            <text id="cin" x="50" y="160" font-size="14" fill="#333"></text>
            <text id="tel1" x="50" y="180" font-size="14" fill="#333"></text>
            <text id="tel2" x="50" y="200" font-size="14" fill="#333"></text>
            <text id="date" x="50" y="240" font-size="14" fill="#333"></text>
            <text id="layer-montant" x="60" y="350" font-size="14" fill="#333"></text>
            <text id="layer-avance" x="60" y="370" font-size="14" fill="#333"></text>
            <text id="layer-reste" x="60" y="395" font-size="14" fill="red"></text>
        `;
    }
 _fmtDate(s){
    return new Date(s).toLocaleDateString('fr-FR');
  }

    populateContractSVG(svgElement, reservation) {
        // Helper function to set SVG text content
        const setSVGText = (id, text) => {
            const element = svgElement.querySelector(`#${id}`);
            if (element) element.textContent = text;
        };

      const formattedCIN = String(reservation.cin).padStart(8, '0');
        // Populate SVG with reservation data
        setSVGText('nom', reservation.nom || '');
        setSVGText('prenom', reservation.prenom || '');
        setSVGText('cin', formattedCIN || '');
        setSVGText('tel1', reservation.tel1 || '');
       // setSVGText('tel2', reservation.tel2 || '');
      setSVGText('tel2',   reservation.tel2  || '');
    if(reservation.tel2!=null){
      setSVGText('tel2',   `/ ${reservation.tel2}`  || '');
    }
    
    if(reservation.horaire=='nuit'){
      setSVGText('horaire', 'De 20h30 à 1h00' || '');
    }
    else if(reservation.horaire=='apres-midi'){
setSVGText('horaire', 'De 15h30 à 20h00' || '');
    }
      
        setSVGText('date', reservation.date_res ?                               this._fmtDate(reservation.date_res) : '');
        
        const montant = reservation.montant_tot || 0;
        const avance = reservation.avance || 0;
        const reste = reservation.montant_rest || 0;
        
        setSVGText('total', ` ${montant} DT`);
        setSVGText('avance', ` ${avance} DT`);
        setSVGText('reste', ` ${reste} DT`);
    }




 
   triggerContractPrint() {
        const previewSvg = document.getElementById('PRINT-AREA');
        if (!previewSvg) {
            console.error('Preview SVG not found');
            return;
        }
       const clone = previewSvg.cloneNode(true); // clone the SVG only

        const f = document.createElement('iframe');
        f.style.position = 'absolute';
        f.style.left = '-9999px';
        document.body.appendChild(f);
        const d = f.contentWindow.document;
        d.open();
        d.write(`
            <html>
                <head>
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            svg { width: 100%; height: auto; }
                        }
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                    </style>
                </head>
                <body>${clone.outerHTML}</body>
            </html>
        `);
        d.close();
        f.onload = () => {
            f.contentWindow.focus();
            f.contentWindow.print();
            setTimeout(() => {
                if (f.parentNode) document.body.removeChild(f);
            }, 500);
        };
    }

    
    setupPrintPreviewModal() {
        const closePreview = document.getElementById('close-preview-agenda');
        const cancelPrint = document.getElementById('cancel-print-preview-agenda');
        const confirmPrint = document.getElementById('confirm-print-preview-agenda');
        const modal = document.getElementById('print-preview-modal');

        if (closePreview) {
            closePreview.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        if (cancelPrint) {
            cancelPrint.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        if (confirmPrint) {
            confirmPrint.addEventListener('click', () => {
                modal.classList.add('hidden');
                this.triggerContractPrint();
            });
        }
    }

  downloadExcel() {
    const monthNames = {
        '1': 'Janvier', '2': 'Février', '3': 'Mars', '4': 'Avril',
        '5': 'Mai', '6': 'Juin', '7': 'Juillet', '8': 'Août',
        '9': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };

    const searchInput = document.getElementById('search-input');
    const monthFilter = document.getElementById('month-filter');
    const searchValue = searchInput ? searchInput.value.trim() : '';
    const monthValue = monthFilter ? monthFilter.value : '';

    const titlePart = monthValue ? monthNames[monthValue] : (searchValue || 'Toutes');
    const fileName = `Mozart_reservation_${titlePart}.xlsx`;

    const data = this.filteredReservations.map(res => {
        const rawNotes = res.notes || '';
        const noteLines = rawNotes.split('\n').map(line => line.trim()).filter(line => line);

        const firstLine = noteLines[0] || '';
        const remainingLines = noteLines.slice(1);

        const optionExtras = [];
        const manualNotes = [];

        for (const line of remainingLines) {
            if (line.includes('Café Turk') || line.includes('Jeux de lumière')) {
                optionExtras.push(line);
            } else {
                manualNotes.push(line);
            }
        }

        const finalEventType = firstLine || res.event_type || '';
        const finalOptions = [res.options, ...optionExtras].filter(Boolean).join('\n');
        const finalNotes = manualNotes.join('\n');

        return {
            'Date': new Date(res.date_res).toLocaleDateString('fr-FR'),
            'Nom': res.nom || '',
            'Prénom': res.prenom || '',
            'CIN': res.cin || '',
            'Téléphone 1': res.tel1 || '',
            'Téléphone 2': res.tel2 || '',
            'Horaire': res.horaire || '',
            'Type Événement': finalEventType,
            'Options': finalOptions,
            'Montant Total (DT)': res.montant_tot || 0,
            'Avance (DT)': res.avance || 0,
            'Reste (DT)': res.montant_rest || 0,
            'Notes': finalNotes
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = [
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
        { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(ws['!ref']);
    const headers = Object.keys(data[0]);
    const dateColIndex = headers.indexOf('Date');
    const eventTypeColIndex = headers.indexOf('Type Événement');

    // Style header row
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;

        const header = ws[address].v;
        let fillColor = "FFD700"; // default gold

        if (header === 'Date') fillColor = "DDEBF7"; // light blue
        if (header === 'Type Événement') fillColor = "FFF2CC"; // light yellow

        ws[address].s = {
            font: { bold: true, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: fillColor } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Style Date and Type Événement cells
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const dateCell = XLSX.utils.encode_cell({ c: dateColIndex, r: R });
        const eventCell = XLSX.utils.encode_cell({ c: eventTypeColIndex, r: R });

        if (ws[dateCell]) {
            ws[dateCell].s = {
                fill: { fgColor: { rgb: "DDEBF7" } },
                font: { color: { rgb: "000000" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        if (ws[eventCell]) {
            ws[eventCell].s = {
                fill: { fgColor: { rgb: "FFF2CC" } },
                font: { color: { rgb: "000000" } },
                alignment: { horizontal: "left", vertical: "center" }
            };
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Réservations');
    XLSX.writeFile(wb, fileName);
}

   exportToPDF() {
    const monthNames = {
        '1': 'Janvier', '2': 'Février', '3': 'Mars', '4': 'Avril',
        '5': 'Mai', '6': 'Juin', '7': 'Juillet', '8': 'Août',
        '9': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };

    const searchInput = document.getElementById('search-input');
    const monthFilter = document.getElementById('month-filter');
    const searchValue = searchInput ? searchInput.value.trim() : '';
    const monthValue = monthFilter ? monthFilter.value : '';

    const titlePart = monthValue ? monthNames[monthValue] : (searchValue || 'Toutes');
    const fileName = `Mozart_reservation_${titlePart}.pdf`;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const data = this.filteredReservations.map(res => {
        const rawNotes = res.notes || '';
        const noteLines = rawNotes.split('\n').map(line => line.trim()).filter(line => line);

        const firstLine = noteLines[0] || '';
        const remainingLines = noteLines.slice(1);

        const optionExtras = [];
        const manualNotes = [];

        for (const line of remainingLines) {
            if (line.includes('Café Turk') || line.includes('Jeux de lumière')) {
                optionExtras.push(line);
            } else {
                manualNotes.push(line);
            }
        }

        const finalEventType = firstLine || res.event_type || '';
        const finalOptions = [res.options, ...optionExtras].filter(Boolean).join(', ');
        const finalNotes = manualNotes.join(', ');

        return [
            { content: new Date(res.date_res).toLocaleDateString('fr-FR'), styles: { textColor: [128, 0, 0] } }, // marron
            res.nom || '',
            res.prenom || '',
            res.cin || '',
            res.tel1 || '',
            res.horaire || '',
            { content: finalEventType, styles: { textColor: [0, 0, 255] } }, // blue
            finalOptions,
            `${res.montant_tot || 0} DT`,
            `${res.avance || 0} DT`,
            `${res.montant_rest || 0} DT`,
            finalNotes
        ];
    });

    doc.setFontSize(12);
    doc.text(`Réservations Mozart – ${titlePart}`, 14, 20);

    doc.autoTable({
        head: [[
            'Date', 'Nom', 'Prénom', 'CIN', 'Téléphone', 'Horaire',
            'Type Événement', 'Options', 'Montant Total', 'Avance', 'Reste', 'Notes'
        ]],
        body: data,
        startY: 30,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [0, 0, 0], // black borders
            lineWidth: 0.2,
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [200, 200, 200], // gray header
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    doc.save(fileName);
}


}

// Initialize agenda manager when DOM is loaded
let agendaManager;
document.addEventListener('DOMContentLoaded', () => {
    agendaManager = new AgendaManager();
});
