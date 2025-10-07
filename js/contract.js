import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://qyskiegopptbugbbxbtp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg' 
);

// —————————————  
// ContractPreview: handles form, preview SVG & saving
// —————————————
export class ContractPreview {
  constructor(formSelector, previewSelector) {
    this.form          = document.querySelector(formSelector);
    this.svg           = document.querySelector(previewSelector);
    this.submitting    = false;
    this.isSaved       = false;
    this.reservations  = [];
    this.dateInput     = this.form.querySelector('input[name="date"]');
    this.horaireInputs = Array.from(
      this.form.querySelectorAll('input[name="horaire"]')
    );
    this.warning       = document.getElementById('availability-warning');
    this.submitBtn  = document.getElementById('save-btn');
    this.printBtn   = document.getElementById('print-btn');
    console.log(this.submitBtn);



    if (!this.form || !this.svg) {
      console.error('Form or SVG element not found');
      return;
    }

    this.init();
  }

  async init() {
    await this.loadSVG();
    this.setDefaults();
    await this.fetchReservations();     // initial load for inline availability
    this.bindEvents();
    this.updatePreview();
  }

  // Load all existing reservations once (for inline availability)
  async fetchReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select('date_res, horaire, nom, prenom');
    if (!error) this.reservations = data;
  }

  async loadSVG() {
    const paths = [
      '/contrat-web.svg',
      './contrat-web.svg',
      '/public/contrat-web.svg',
      './public/contrat-web.svg'
    ];
    for (const p of paths) {
      try {
        const r = await fetch(p);
        if (r.ok) {
          this.svg.innerHTML = await r.text();
          return;
        }
      } catch {}
    }
    
    // fallback elements
    this.svg.innerHTML = `
      <rect x="0" y="0" width="400" height="600" fill="white" stroke="#ddd" stroke-width="1"/>
      
      <!-- Header -->
      <rect x="10" y="10" width="380" height="60" fill="#FFD700" rx="5"/>
      <text x="200" y="35" font-size="18" font-weight="bold" text-anchor="middle" fill="#000">SALLE DES FÊTES MOZART</text>
      <text x="200" y="55" font-size="14" text-anchor="middle" fill="#000">CONTRAT DE LOCATION</text>
      
      <!-- Client Info Section -->
      <text x="20" y="100" font-size="14" font-weight="bold" fill="#333">INFORMATIONS CLIENT:</text>
      <line x1="20" y1="105" x2="380" y2="105" stroke="#FFD700" stroke-width="2"/>
      
      <text x="20" y="130" font-size="12" fill="#666">Nom:</text>
      <text id="nom" x="80" y="130" font-size="14" font-weight="bold" fill="#000"></text>
      
      <text x="200" y="130" font-size="12" fill="#666">Prénom:</text>
      <text id="prenom" x="260" y="130" font-size="14" font-weight="bold" fill="#000"></text>
      
      <text x="20" y="155" font-size="12" fill="#666">CIN:</text>
      <text id="cin" x="80" y="155" font-size="14" fill="#000"></text>
      
      <text x="20" y="180" font-size="12" fill="#666">Téléphone 1:</text>
      <text id="tel1" x="100" y="180" font-size="14" fill="#000"></text>
      
      <text x="20" y="205" font-size="12" fill="#666">Téléphone 2:</text>
      <text id="tel2" x="100" y="205" font-size="14" fill="#000"></text>
      
      <!-- Event Info Section -->
      <text x="20" y="240" font-size="14" font-weight="bold" fill="#333">INFORMATIONS ÉVÉNEMENT:</text>
      <line x1="20" y1="245" x2="380" y2="245" stroke="#FFD700" stroke-width="2"/>
      
      <text x="20" y="270" font-size="12" fill="#666">Date de l'événement:</text>
      <text id="date" x="150" y="270" font-size="14" font-weight="bold" fill="#000"></text>

       <text x="20" y="270" font-size="12" fill="#666">Horaire de l'événement:</text>
      <text id="horaire" x="150" y="270" font-size="14" font-weight="bold" fill="#000"></text>
      
      <!-- Payment Info Section -->
      <text x="20" y="320" font-size="14" font-weight="bold" fill="#333">INFORMATIONS PAIEMENT:</text>
      <line x1="20" y1="325" x2="380" y2="325" stroke="#FFD700" stroke-width="2"/>
      
      <text x="20" y="350" font-size="12" fill="#666">Montant Total:</text>
      <text id="total" x="120" y="350" font-size="14" font-weight="bold" fill="#27ae60"></text>
      
      <text x="20" y="375" font-size="12" fill="#666">Avance Payée:</text>
      <text id="avance" x="120" y="375" font-size="14" font-weight="bold" fill="#3498db"></text>
      
      <text x="20" y="400" font-size="12" fill="#666">Reste à Payer:</text>
      <text id="reste" x="120" y="400" font-size="14" font-weight="bold" fill="red"></text>
      
      <!-- Footer -->
      <rect x="10" y="450" width="380" height="40" fill="#f8f9fa" stroke="#ddd" stroke-width="1" rx="5"/>
      <text x="200" y="470" font-size="12" text-anchor="middle" fill="#666">Merci de votre confiance</text>
      <text x="200" y="485" font-size="10" text-anchor="middle" fill="#999">Salle des Fêtes Mozart - Contrat généré automatiquement</text>
    `;

  }

  setDefaults() {
   const ev = this.form.querySelector('#event-type');
const lt = this.form.querySelector('#light-option');
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


bindEvents() {
    // Form navigation with Enter key
    this.setupFormNavigation();
    
  // Live SVG preview updates
  this.form.addEventListener('input', () => {
    this.isSaved = false;
    this.updatePreview();
  });

  this.form.addEventListener('change', () => {
    this.isSaved = false;
    this.updatePreview();
  });

    // Form validation
    this.setupFormValidation();

  // Inline availability check on date change
// Inline availability check on date change
this.dateInput.addEventListener('change', () => {
  const selectedDate = new Date(this.dateInput.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  // Prevent selecting past dates
  if (selectedDate < today) {
    this.dateInput.value = '';
    this.warning.textContent = '⚠️ Vous ne pouvez pas sélectionner une date passée.';
    console.log('dd','⚠️ Vous ne pouvez pas sélectionner une date passée.')
    this.warning.style.display = 'block';
    this.submitBtn.disabled = true;
    this.printBtn.disabled = true;
    this.printBtn.classList.add('opacity-50', 'cursor-not-allowed');
    this.submitBtn.classList.add('btn-disabled');
    return;
  }

  this.warning.style.display = 'none';
  this.submitBtn.disabled = false;
  this.printBtn.disabled  = false;


  this.inlineCheck();
  this.updatePreview();

  const selectedYear  = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;

  const yearSelect  = document.getElementById('availability-year');
  const monthSelect = document.getElementById('availability-month');

  if (yearSelect && monthSelect) {
    const currentYear  = parseInt(yearSelect.value);
    const currentMonth = parseInt(monthSelect.value);

    const needsUpdate = selectedYear !== currentYear || selectedMonth !== currentMonth;
 
    // Always highlight current day first
    window.avCal?.highlightSelectedDay(this.dateInput.value);

    if (needsUpdate) {
      // Delay refresh to allow visual continuity
      setTimeout(() => {
        yearSelect.value  = selectedYear;
        monthSelect.value = selectedMonth;

         if (this.dateInput.value !==''){
           
        window.avCal?.updateAvailabilityCalendar().then(() => {
          window.avCal?.highlightSelectedDay(this.dateInput.value);
          document.getElementById('availability-calendar')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
         }
      }, 300);
    }
  }
});



  // Inline availability check on horaire change
  this.horaireInputs.forEach(radio => {
    radio.addEventListener('change', () => this.inlineCheck());
  });

  // Auto-check "Jeux de lumière" if event type is Mariage
  const eventType = this.form.querySelector('#event-type');
  if (eventType) {
    eventType.addEventListener('change', () => {
      const lightOption = this.form.querySelector('#light-option');
      if (eventType.value === 'Mariage' && lightOption) {
        lightOption.checked = true;
      }
    });
  }
}

  setupFormNavigation() {
    const inputs = [
      this.form.querySelector('#nom'),
      this.form.querySelector('#prenom'),
      this.form.querySelector('#cin'),
      this.form.querySelector('#telephone'),
      this.form.querySelector('#telephone2'),
      this.form.querySelector('#date'),
      this.form.querySelector('#montant'),
      this.form.querySelector('#avance')
    ].filter(input => input !== null);

    inputs.forEach((input, index) => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextIndex = index + 1;
          if (nextIndex < inputs.length) {
            inputs[nextIndex].focus();
          } else {
            // Focus on event type select
            const eventType = this.form.querySelector('#event-type');
            if (eventType) eventType.focus();
          }
        }
      });
    });
  }

  setupFormValidation() {
    const montantInput = this.form.querySelector('#montant');
    const avanceInput = this.form.querySelector('#avance');
    const cinInput = this.form.querySelector('#cin');
    const tel1Input = this.form.querySelector('#telephone');
    const tel2Input = this.form.querySelector('#telephone2');
    

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



  updatePreview() {
    //console.log(this.svg.innerHTML);
     const horaires= this.form.querySelector('input[name="horaire"]:checked')?.value;
    
    const d = Object.fromEntries(new FormData(this.form));
    this._setSVG('nom',    d.nom     || '');
    this._setSVG('prenom', d.prenom  || '');
    this._setSVG('cin',    d.cin     || '');
    this._setSVG('tel1',   d.telephone  || '');
    this._setSVG('tel2',   d.telephone2  || '');
    if(d.telephone2!=''){
      this._setSVG('tel2',   `/ ${d.telephone2}`  || '');
    }
    
    if(horaires=='nuit'){
      this._setSVG('horaire', 'De 20h30 à 1h00' || '');
    }
    else if(horaires=='apres-midi'){
      this._setSVG('horaire', 'De 15h30 à 20h00' || '');
    }
    
    this._setSVG('date',   d.date ? this._fmtDate(d.date) : '');
    
    const montant = parseInt(d.montant||4200,10);
    const avance  = parseInt(d.avance||500, 10);
    const reste   = montant - avance;

    this._setSVG('total', ` ${montant} DT`);
    this._setSVG('avance',  `  ${avance} DT`);
    this._setSVG('reste',   ` ${reste} DT`);
  }
  _setSVG(id, txt){
    const el = this.svg.querySelector(`#${id}`);
    if(el) el.textContent = txt;
  }
  _fmtDate(s){
    return new Date(s).toLocaleDateString('fr-FR');
  }

  // inline check to disable Enregistrer if slot taken
  inlineCheck(){
    const date    = this.dateInput.value;
    const horaire = this.form.querySelector('input[name="horaire"]:checked')?.value;
    if(!date||!horaire){
      this.warning.style.display='none';
      this.submitBtn.disabled=false;
      
    this.printBtn.disabled = false;
    this.printBtn.classList.remove('opacity-50', 'cursor-not-allowed');

      return;
    }
    const taken = this.reservations
      .some(r=>r.date_res===date&&r.horaire===horaire);
    if(taken){
      // Show enhanced warning
      const enhancedWarning = document.getElementById('availability-warning-enhanced');
      const warningMessage = document.getElementById('warning-message');
      if (enhancedWarning && warningMessage) {
        warningMessage.textContent = `La date ${this._fmtDate(date)} pour "${horaire}" est déjà réservée`;
        enhancedWarning.classList.remove('hidden');
      }
      
      this.submitBtn.disabled=true;
       this.printBtn.disabled  = true;

  // Optional: add disabled styling
  this.printBtn.classList.add('opacity-50', 'cursor-not-allowed');
this.submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      // document.getElementById('PRINT').disabled=true;
    } else {
      // Hide enhanced warning
      const enhancedWarning = document.getElementById('availability-warning-enhanced');
      if (enhancedWarning) {
        enhancedWarning.classList.add('hidden');
      }
      
      this.submitBtn.disabled=false;
       this.printBtn.disabled  = false;

  this.printBtn.classList.remove('opacity-50', 'cursor-not-allowed');
this.submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // submission + database insert
  async handleSubmit() {
    if(this.submitting||this.isSaved) return;
    this.submitting=true;

    const d       = Object.fromEntries(new FormData(this.form));
    const montant = parseInt(d.montant||4200,10);
    const avance  = parseInt(d.avance||500, 10);
    const reste   = montant - avance;

    let notes = `${d.event_type}\n`;
    this.form.querySelectorAll('input[name="options"]:checked')
      .forEach(o=>notes+=o.value+'\n');

    const manualnotes=  document.getElementById('notes');
    // Add manual notes if provided
    if (manualnotes) {
      notes += manualnotes.value;
    }

    const { data:{session} } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if(!uid){
      alert("Utilisateur non authentifié.");
      this.submitting=false;
      return;
    }

    const { error } = await supabase
      .from('reservations')
      .insert({
        nom:          d.nom,
        prenom:       d.prenom,
        cin:          d.cin,
        tel1:         d.telephone||null,
        tel2:         d.telephone2||null,
        date_res:     d.date,
        horaire:      d.horaire,
        montant_tot:  montant,
        avance:       avance,
        montant_rest: reste,
        notes,
        created_by:   uid
      });

    if(error){
      console.error('Erreur Supabase:',error.message);
      alert("Erreur lors de l'enregistrement.");
      this.submitting=false;
      return;
    }

    this.isSaved=false; // allow re-save if user changes
    this.submitting=false;
    document.getElementById('success-modal')
      .classList.remove('hidden');

    // refresh both inline & availability calendars
    await this.fetchReservations();
    if(window.avCal) await window.avCal.updateAvailabilityCalendar();
  }
}

// —————————————  
// AvailabilityCalendar: the month-grid view with colored slots
// —————————————
class AvailabilityCalendar {
  constructor(preview) {
    this.preview      = preview;
    this.dateInput    = preview.dateInput;
    this.horaireInputs= preview.horaireInputs;
    this.yearSelect   = document.getElementById('availability-year');
     
    this.monthSelect  = document.getElementById('availability-month');
    this.calendarDiv  = document.getElementById('availability-calendar');
    this.init();
  }

  clearHighlight() {
  this.calendarDiv.querySelectorAll('.selected')
    .forEach(el => el.classList.remove('selected'));
}
  init(){
    // populate years (current±1)
    const now = new Date(), cy=now.getFullYear();
    
    // Add null check to prevent appendChild error
    if (!this.yearSelect || !this.monthSelect) {
      console.error('Year or month select elements not found');
      return;
    }
    
    for(let y=cy-1; y<=cy+5; y++){
      const o=document.createElement('option');
      o.value=y; o.textContent=y;
      this.yearSelect.appendChild(o);
    }
    this.yearSelect.value  = cy;
    this.monthSelect.value = now.getMonth()+1; // HTML uses 1–12

    // re-render on controls change
  this.yearSelect.addEventListener('change', () => {
    this.clearHighlight();
    this.updateAvailabilityCalendar();
  });

  this.monthSelect.addEventListener('change', () => {
    this.clearHighlight();
    this.updateAvailabilityCalendar();
  });

    // initial render
    this.updateAvailabilityCalendar();
  }
//highlight selected day
 highlightSelectedDay(dateStr) {
  const targetDate = new Date(dateStr);
  const targetDay  = targetDate.getDate();

  const allSquares = this.calendarDiv.querySelectorAll('div');

  allSquares.forEach(square => {
    square.classList.remove('selected');

    const dayLabel = square.querySelector('.font-semibold');
    const dayValue = parseInt(dayLabel?.textContent);

    if (dayValue === targetDay) {
      square.classList.add('selected');
    }
  });
}

  // fetch and render
  async updateAvailabilityCalendar(){
    this.clearHighlight();
    const year  = +this.yearSelect.value;
    const month = +this.monthSelect.value - 1; // JS months 0–11
    const start = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const end   = `${year}-${String(month+1).padStart(2,'0')}-` +
      String(new Date(year, month+1,0).getDate()).padStart(2,'0');

    const { data, error } = await supabase
      .from('reservations')
      .select('date_res, horaire')
      .gte('date_res', start)
      .lte('date_res', end);

    if(error){
      console.error('Error loading availability:',error);
      return;
    }
    this.renderAvailabilityCalendar(year, month, data||[]);
  }

 renderAvailabilityCalendar(year, month, reservations) {
    this.clearHighlight();
  this.calendarDiv.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const today    = new Date();
  today.setHours(0, 0, 0, 0);

  // Add day headers - Start with Monday
  const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header text-center font-bold py-2 bg-gray-800 text-white rounded';
    header.textContent = day;
    this.calendarDiv.appendChild(header);
  });

  // Map date → array of horaires
  const map = {};
  reservations.forEach(r => {
    map[r.date_res] = map[r.date_res] || [];
    map[r.date_res].push(r.horaire);
  });

  // Blank cells before first day - Adjust for Monday start
  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1; // Convert Sunday (0) to 6, others shift by -1
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'h-20 bg-gray-100 rounded';
    this.calendarDiv.appendChild(empty);
  }

  // Render each day
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayRes  = map[dateKey] || [];
    const cur     = new Date(year, month, d);
    cur.setHours(0, 0, 0, 0);

    const cell = document.createElement('div');
    cell.className = 'h-20 border border-gray-200 rounded p-1 cursor-pointer';
    cell.innerHTML = `<div class="font-semibold text-sm">${d}</div>`;

    // Style based on availability
    if (cur < today) {
      cell.classList.add('bg-gray-300', 'text-gray-600');
      cell.classList.remove('cursor-pointer');
    } else if (dayRes.length === 2) {
      cell.classList.add('bg-red-200', 'border-red-400');
      cell.innerHTML += `<div class="text-xs text-red-700">Complet</div>`;
    } else if (dayRes.length === 1) {
      cell.classList.add('bg-yellow-100', 'border-yellow-400');
      const avail = dayRes.includes('nuit') ? 'Après-midi libre' : 'Nuit libre';
      cell.innerHTML += `<div class="text-xs text-yellow-700">${avail}</div>`;
    } else {
      cell.classList.add('bg-green-100', 'border-green-400');
      cell.innerHTML += `<div class="text-xs text-green-700">Libre</div>`;
    }

    // Clickable only if today or future
    if (cur >= today) {
      cell.addEventListener('click', () => {
        // Remove previous highlight
        this.calendarDiv.querySelectorAll('.selected')
          .forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');

        if (dayRes.length === 2) {
          const modal = document.getElementById('complet-modal');
          const msg   = document.getElementById('complet-message');
          msg.textContent = `Date : ${dateKey} est déjà complet (Nuit et Après-midi).`;
          modal.classList.remove('hidden');
        } else {
          // Update form date
          this.preview.dateInput.value = dateKey;
          
          // Scroll to top and focus on nom field
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            const nomField = document.getElementById('nom');
            if (nomField) {
              nomField.focus();
            }
          }, 500); // Wait for scroll to complete
          
          this.preview.updatePreview();
          this.preview.inlineCheck();

          if (dayRes.length === 1) {
            const slot = dayRes.includes('nuit') ? 'Nuit' : 'Après-midi';
            showToast(`⚠️ Attention : ${slot} déjà réservé pour ${dateKey}`);
          }
        }
      });
    }

    this.calendarDiv.appendChild(cell);
  }

  // Highlight selected day if visible
  this.highlightSelectedDay(this.preview.dateInput.value);
}

}

// —————————————  
// Bootstrapping & Print logic
// —————————————
let preview, avCal, printAfterSave=false;

document.addEventListener('DOMContentLoaded', ()=>{
  preview = new ContractPreview('#contract-form','#contract-svg');
  avCal   = new AvailabilityCalendar(preview);

  // expose for preview to call
  window.avCal = avCal;

  // close modal hides message
  document.getElementById('close-modal')?.addEventListener('click', ()=>{
    document.getElementById('success-modal')
      .classList.add('hidden');
  });
// close complet modal hides message
  document.getElementById('close-complet')?.addEventListener('click', () => {
  document.getElementById('complet-modal')?.classList.add('hidden');
});

  // Save sets print flag
  preview.form.querySelector('button[type="submit"]')
    ?.addEventListener('click', ()=> printAfterSave=true);

  // unified form submit
  preview.form.addEventListener('submit', async e=>{
    e.preventDefault();
    if(!preview.form.checkValidity()){
      preview.form.reportValidity();
      return;
    }
    await preview.handleSubmit();

    if(printAfterSave){
      triggerPrint(document.getElementById('PRINT'));
      printAfterSave=false;
    }
  });

  // print-confirm flow (unchanged)
  document.getElementById('print-btn')?.addEventListener('click', ()=>{
    document.getElementById('print-confirm-modal')
      .classList.remove('hidden');
  });
  document.getElementById('cancel-print')?.addEventListener('click', ()=>{
    document.getElementById('print-confirm-modal')
      .classList.add('hidden');
  });
  document.getElementById('confirm-print')?.addEventListener('click', ()=>{
    document.getElementById('print-confirm-modal')
      .classList.add('hidden');
    if(!preview.form.checkValidity()){
      preview.form.reportValidity();
      return;
    }
    if(preview.isSaved){
      triggerPrint(document.getElementById('PRINT'));
    } else {
      printAfterSave=true;
      preview.form.requestSubmit();
    }
  });
  
});

function triggerPrint(printArea){
  const f=document.createElement('iframe');
  f.style.position='absolute'; f.style.left='-9999px';
  document.body.appendChild(f);
  const d=f.contentWindow.document;
  d.open();
  d.write(`
    <html>
      <head><style>
        @media print {
          body{margin:0;padding:0;}
          #PRINT, svg{width:100%;height:auto;}
        }
      </style></head>
      <body>${printArea.outerHTML}</body>
    </html>
  `);
  d.close();
  f.onload = ()=> {
    f.contentWindow.focus();
    f.contentWindow.print();
    document.body.removeChild(f);
  };
}
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toast-message');
  
  msg.textContent = message;
  toast.classList.remove('hidden');
  
  // Add slide-in animation
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    // Add slide-out animation
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.style.transform = '';
      toast.style.opacity = '';
    }, 300);
  }, duration);
}