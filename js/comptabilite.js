
const { createClient } = supabase;
const supabaseClient = createClient('https://qyskiegopptbugbbxbtp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg'
);

class ComptabiliteManager {
    constructor() {
        this.selectedMonths = [];
        this.selectedYear = new Date().getFullYear();
        this.reservations = [];
        this.monthlyCharges = [];
        this.selectedChargeMonths = [];
        this.editingChargeId = null;
        this.expenses = {};
        this.init();
    }

    async init() {
        this.populateYears();
        this.populateChargeYears();
        this.bindEvents();
        await this.loadReservations();
       await this.loadMonthlyCharges();
    }

    populateYears() {
        const yearSelect = document.getElementById('year-filter');
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
        this.selectedYear = currentYear;
    }

    populateChargeYears() {
        const chargeYearSelect = document.getElementById('charge-year');
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 2; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            chargeYearSelect.appendChild(option);
        }
    }

    bindEvents() {
        document.getElementById('year-filter').addEventListener('change', (e) => {
            this.selectedYear = parseInt(e.target.value);
            this.displayChargesList();
        });

        document.querySelectorAll('.month-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const month = parseInt(btn.dataset.month);
                if (this.selectedMonths.includes(month)) {
                    this.selectedMonths = this.selectedMonths.filter(m => m !== month);
                    btn.classList.remove('active');
                } else {
                    this.selectedMonths.push(month);
                    btn.classList.add('active');
                }
                this.displayChargesList();
            });
        });

        document.querySelectorAll('.charge-month-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const month = parseInt(btn.dataset.month);
                if (this.selectedChargeMonths.includes(month)) {
                    this.selectedChargeMonths = this.selectedChargeMonths.filter(m => m !== month);
                    btn.classList.remove('bg-gold');
                    btn.classList.add('bg-gray-200');
                    btn.classList.remove('text-black');
                    btn.classList.add('text-gray-700');
                } else {
                    this.selectedChargeMonths.push(month);
                    btn.classList.add('bg-gold');
                    btn.classList.remove('bg-gray-200');
                    btn.classList.add('text-black');
                    btn.classList.remove('text-gray-700');
                }
            });
        });

        document.getElementById('apply-filter').addEventListener('click', () => {
            this.calculate();
        });

        document.getElementById('add-charge-btn').addEventListener('click', () => {
            this.addCharge();
        });

        document.getElementById('update-charge-btn').addEventListener('click', () => {
            this.updateCharge();
        });

        document.getElementById('cancel-edit-charge-btn').addEventListener('click', () => {
            this.cancelEditCharge();
        });

        document.getElementById('download-pdf-btn').addEventListener('click', () => {
            this.exportPDF();
        });

        document.getElementById('download-excel-btn').addEventListener('click', () => {
            this.exportExcel();
        });
    }

    async loadReservations() {
        try {
            const { data, error } = await supabaseClient
                .from('reservations')
                .select('*');
            if (error) throw error;
            this.reservations = data || [];
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
    }

    async loadMonthlyCharges() {
        try {
            const { data, error } = await supabaseClient
                .from('monthly_charges')
                .select('*');
            if (error) throw error;
            this.monthlyCharges = data || [];

          
        
            this.displayChargesList();
        } catch (error) {
            console.error('Error loading monthly charges:', error);
        }
    }

    getMonthName(month) {
        const months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return months[month];
    }

    isHotPeriod(month) {
        return month >= 6 && month <= 9;
    }

    async addCharge() {
        const year = parseInt(document.getElementById('charge-year').value);
        const label = document.getElementById('charge-label').value.trim() || 'Autre charge';
        const amount = parseFloat(document.getElementById('charge-amount').value) || 0;

        if (this.selectedChargeMonths.length === 0) {
            alert('Veuillez sélectionner au moins un mois');
            return;
        }

        if (amount <= 0) {
            alert('Veuillez entrer un montant valide');
            return;
        }

        try {
            for (const month of this.selectedChargeMonths) {
                const { error } = await supabaseClient
                    .from('monthly_charges')
                    .insert([{ year, month, label, amount }]);
                if (error) throw error;
            }

            this.clearChargeForm();
            await this.loadMonthlyCharges();
            alert('Charge(s) ajoutée(s) avec succès');
          this.calculate();
        } catch (error) {
            console.error('Error adding charge:', error);
            alert('Erreur lors de l\'ajout de la charge');
        }
    }

    async updateCharge() {
        if (!this.editingChargeId) return;

        const label = document.getElementById('charge-label').value.trim() || 'Autre charge';
        const amount = parseFloat(document.getElementById('charge-amount').value) || 0;

        if (amount <= 0) {
            alert('Veuillez entrer un montant valide');
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('monthly_charges')
                .update({ label, amount, updated_at: new Date().toISOString() })
                .eq('id', this.editingChargeId);

            if (error) throw error;

            this.cancelEditCharge();
            await this.loadMonthlyCharges();
            alert('Charge mise à jour avec succès');
          this.calculate();
        } catch (error) {
            console.error('Error updating charge:', error);
            alert('Erreur lors de la mise à jour');
        }
    }

    editCharge(chargeId) {
        const charge = this.monthlyCharges.find(c => c.id === chargeId);
        if (!charge) return;

        this.editingChargeId = chargeId;
        document.getElementById('charge-year').value = charge.year;
        document.getElementById('charge-label').value = charge.label;
        document.getElementById('charge-amount').value = charge.amount;

        document.querySelectorAll('.charge-month-chip').forEach(btn => {
            btn.classList.remove('bg-gold', 'text-black');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });

        const monthBtn = document.querySelector(`[data-month="${charge.month}"]`);
        if (monthBtn) {
            monthBtn.classList.add('bg-gold', 'text-black');
            monthBtn.classList.remove('bg-gray-200', 'text-gray-700');
        }

        this.selectedChargeMonths = [charge.month];

        document.getElementById('add-charge-btn').style.display = 'none';
        document.getElementById('update-charge-btn').style.display = 'inline-block';
        document.getElementById('cancel-edit-charge-btn').style.display = 'inline-block';
    }

    cancelEditCharge() {
        this.editingChargeId = null;
        this.clearChargeForm();
        document.getElementById('add-charge-btn').style.display = 'inline-block';
        document.getElementById('update-charge-btn').style.display = 'none';
        document.getElementById('cancel-edit-charge-btn').style.display = 'none';
    }

    async deleteCharge(chargeId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette charge?')) return;

        try {
            const { error } = await supabaseClient
                .from('monthly_charges')
                .delete()
                .eq('id', chargeId);

            if (error) throw error;
            await this.loadMonthlyCharges();
            this.calculate();
        } catch (error) {
            console.error('Error deleting charge:', error);
            alert('Erreur lors de la suppression');
        }
    }

    clearChargeForm() {
        document.getElementById('charge-label').value = '';
        document.getElementById('charge-amount').value = '';
        this.selectedChargeMonths = [];

        document.querySelectorAll('.charge-month-chip').forEach(btn => {
            btn.classList.remove('bg-gold', 'text-black');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
    }

    displayChargesList() {
        const container = document.getElementById('charges-list');
        container.innerHTML = '';

        if (!this.monthlyCharges || this.monthlyCharges.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Aucune charge configurée</p>';
            return;
        }

        const filteredCharges = this.monthlyCharges.filter(charge => {
            if (this.selectedMonths.length === 0) return false;
            return charge.year === this.selectedYear && this.selectedMonths.includes(charge.month);
        });

        if (filteredCharges.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Aucune charge pour cette période</p>';
            return;
        }

        const chargesByMonth = {};
        filteredCharges.forEach(charge => {
            if (!chargesByMonth[charge.month]) {
                chargesByMonth[charge.month] = [];
            }
            chargesByMonth[charge.month].push(charge);
        });

        Object.entries(chargesByMonth)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .forEach(([month, charges]) => {
                const monthDiv = document.createElement('div');
                monthDiv.className = 'border border-gray-200 rounded-lg p-4 bg-gray-50 mb-3';

                let html = `
                    <div class="font-bold text-gray-800 mb-3">${this.getMonthName(parseInt(month))}</div>
                `;

                charges.forEach(charge => {
                    html += `
                        <div class="flex justify-between items-center py-2 px-3 bg-white rounded mb-2 border border-gray-100">
                            <div>
                                <div class="font-semibold text-gray-800">${charge.label}</div>
                                <div class="text-sm text-gray-600">${charge.amount.toFixed(2)} DT</div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="comptabiliteManager.editCharge('${charge.id}')" class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="comptabiliteManager.deleteCharge('${charge.id}')" class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });

                monthDiv.innerHTML = html;
                container.appendChild(monthDiv);
            });
    }

    calculateExpenses() {
        this.expenses = {};

        this.selectedMonths.forEach(month => {
            const monthKey = `${this.selectedYear}-${String(month).padStart(2, '0')}`;

            if (!this.expenses[monthKey]) {
                this.expenses[monthKey] = {
                    servers: 0,
                    manager: 0,
                    lightingTechnician: 0,
                    cleaning: 0,
                    electricity: 0,
                    irpp: 0,
                    fixedMonthlyElectricity: 0,
                    monthlyCharges: 0,
                    total: 0
                };
            }

            const monthReservations = this.reservations.filter(res => {
                const resDate = new Date(res.date_res);
                return resDate.getFullYear() === this.selectedYear && resDate.getMonth() + 1 === month;
            });

            monthReservations.forEach(res => {
                const notesLines = (res.notes || 'Mariage').split('\n');
                const eventType = notesLines[0].trim() || 'Mariage';
                const hasLighting = res.notes && res.notes.includes('Jeux de lumière');

                if (eventType === 'Mariage') {
                    this.expenses[monthKey].servers += 12 * 40;
                } else if (eventType === 'Henna') {
                    this.expenses[monthKey].servers += 9 * 40;
                }

                this.expenses[monthKey].manager += 100;
                if (hasLighting) this.expenses[monthKey].lightingTechnician += 50;
                this.expenses[monthKey].cleaning += 55;

                if (this.isHotPeriod(month)) {
                    this.expenses[monthKey].electricity += 200;
                } else {
                    this.expenses[monthKey].electricity += 100;
                }
            });

            if (this.isHotPeriod(month)) {
                this.expenses[monthKey].irpp = 2000;
                this.expenses[monthKey].fixedMonthlyElectricity = 450;
            } else {
                this.expenses[monthKey].irpp = 1000;
                this.expenses[monthKey].fixedMonthlyElectricity = 450;
            }

            const monthCharges = this.monthlyCharges.filter(c => c.year === this.selectedYear && c.month === month);
            this.expenses[monthKey].monthlyCharges = monthCharges.reduce((sum, c) => sum + parseFloat(c.amount), 0);

            this.expenses[monthKey].total =
                this.expenses[monthKey].servers +
                this.expenses[monthKey].manager +
                this.expenses[monthKey].lightingTechnician +
                this.expenses[monthKey].cleaning +
                this.expenses[monthKey].electricity +
                this.expenses[monthKey].irpp +
                this.expenses[monthKey].fixedMonthlyElectricity +
                this.expenses[monthKey].monthlyCharges;
        });
    }

    calculate() {
        if (this.selectedMonths.length === 0) {
            alert('Veuillez sélectionner au moins un mois');
            return;
        }

        this.calculateExpenses();

      // monthly depenses
       this.loadMonthlyCharges();
      
        const filteredReservations = this.reservations.filter(res => {
            const resDate = new Date(res.date_res);
            return resDate.getFullYear() === this.selectedYear &&
                   this.selectedMonths.includes(resDate.getMonth() + 1);
        });

        const totalRemain = filteredReservations.reduce((sum, res) => {
            const montant = parseFloat(res.montant_tot) || 0;
            const avance = parseFloat(res.avance) || 0;
            return sum + (montant - avance);
        }, 0);

        const totalExpenses = Object.values(this.expenses).reduce((sum, exp) => {
            return sum + exp.total;
        }, 0);

        const netProfit = totalRemain - totalExpenses;

        document.getElementById('total-remain').textContent = `${totalRemain.toFixed(2)} DT`;
        document.getElementById('total-expenses').textContent = `${totalExpenses.toFixed(2)} DT`;
        document.getElementById('net-profit').textContent = `${netProfit.toFixed(2)} DT`;

        this.displayExpensesDetails();
        this.displayContractsDetails(filteredReservations);
    }

    displayExpensesDetails() {
        const container = document.getElementById('expenses-details');
        container.innerHTML = '';

        Object.entries(this.expenses).forEach(([monthKey, exp]) => {
            const [year, month] = monthKey.split('-');
            const monthNum = parseInt(month);
            const monthName = this.getMonthName(monthNum);

            const monthDiv = document.createElement('div');
            monthDiv.className = 'border border-gray-200 rounded-lg p-4 mb-4';

            const monthReservations = this.reservations.filter(res => {
                const resDate = new Date(res.date_res);
                return resDate.getFullYear() === parseInt(year) && resDate.getMonth() + 1 === monthNum;
            });

            const totalContractsCount = monthReservations.length;
            const hennaCount = monthReservations.filter(res => {
                const notesLines = (res.notes || 'Mariage').split('\n');
                const eventType = notesLines[0].trim() || 'Mariage';
                return eventType === 'Henna';
            }).length;
            const marriageCount = monthReservations.filter(res => {
                const notesLines = (res.notes || 'Mariage').split('\n');
                const eventType = notesLines[0].trim() || 'Mariage';
                return eventType === 'Mariage' || eventType === '';
            }).length;
            const monthRemain = monthReservations.reduce((sum, res) => {
                const montant = parseFloat(res.montant_tot) || 0;
                const avance = parseFloat(res.avance) || 0;
                return sum + (montant - avance);
            }, 0);
            const monthNetProfit = monthRemain - exp.total;

            const html = `
                <h3 class="font-bold text-gray-800 mb-4">${monthName} ${year}</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3 border-b pb-2">Détails des Charges</h4>
                        ${this.createExpenseRow('Serveurs', exp.servers)}
                        ${this.createExpenseRow('Gérant', exp.manager)}
                        ${this.createExpenseRow('Technicien Lumière', exp.lightingTechnician)}
                        ${this.createExpenseRow('Nettoyage', exp.cleaning)}
                        ${this.createExpenseRow('Électricité Consommation', exp.electricity)}
                        ${this.createExpenseRow('Électricité (fixe)', exp.fixedMonthlyElectricity)}
                        ${this.createExpenseRow('IRPP', exp.irpp)}
                        ${exp.monthlyCharges > 0 ? this.createExpenseRow('Charges Mensuels', exp.monthlyCharges) : ''}
                        <div class="border-t border-gray-300 mt-3 pt-3">
                            ${this.createExpenseRow('Total Charges', exp.total, true)}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3 border-b pb-2">Statistiques</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center py-2 text-gray-700">
                                <span>Total Contrats</span>
                                <span class="font-bold">${totalContractsCount}</span>
                            </div>
                            <div class="flex justify-between items-center py-2 text-gray-700">
                                <span>Contrats Mariage</span>
                                <span class="font-bold text-blue-600">${marriageCount}</span>
                            </div>
                            <div class="flex justify-between items-center py-2 text-gray-700">
                                <span>Contrats Henna</span>
                                <span class="font-bold text-purple-600">${hennaCount}</span>
                            </div>
                            <div class="border-t border-gray-300 mt-3 pt-3">
                                <div class="flex justify-between items-center py-2 text-gray-700">
                                    <span>Reste à Payer</span>
                                    <span class="font-bold text-green-600">${monthRemain.toFixed(2)} DT</span>
                                </div>
                            </div>
                            <div class="bg-yellow-50 border-t border-gray-300 mt-3 pt-3 rounded">
                                <div class="flex justify-between items-center py-2 font-bold text-gray-900">
                                    <span>Bénéfice Net</span>
                                    <span class="${monthNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}">${monthNetProfit.toFixed(2)} DT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            monthDiv.innerHTML = html;
            container.appendChild(monthDiv);
        });
    }

    createExpenseRow(label, amount, bold = false) {
        const className = bold ? 'font-bold text-gray-900' : 'text-gray-700';
        return `
            <div class="flex justify-between items-center py-2 ${className}">
                <span>${label}</span>
                <span>${amount.toFixed(2)} DT</span>
            </div>
        `;
    }

    displayContractsDetails(contracts) {
        const container = document.getElementById('contracts-details');
        container.innerHTML = '';

        if (contracts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Aucun contrat pour cette période</p>';
            return;
        }

        contracts.forEach(res => {
            const remain = (parseFloat(res.montant_tot) || 0) - (parseFloat(res.avance) || 0);
            const resDate = new Date(res.date_res).toLocaleDateString('fr-FR');

            const div = document.createElement('div');
            div.className = 'border border-gray-200 rounded-lg p-3 bg-gray-50';
            div.innerHTML = `
                <div class="font-semibold text-gray-800">${res.nom} ${res.prenom}</div>
                <div class="text-sm text-gray-600">📅 ${resDate} - ${res.horaire}</div>
                <div class="text-sm text-gray-600">💰 Montant: ${res.montant_tot} DT | Avance: ${res.avance} DT</div>
                <div class="text-sm font-semibold text-blue-600">Reste: ${remain.toFixed(2)} DT</div>
            `;
            container.appendChild(div);
        });
    }

exportPDF() {
    if (this.selectedMonths.length === 0) {
        alert("Veuillez calculer d'abord");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Titre principal
    doc.setFontSize(18);
    doc.text("RAPPORT COMPTABILITÉ", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Période
    doc.setFontSize(10);
    doc.text(
        `Période: ${this.selectedMonths.map(m => this.getMonthName(m)).join(", ")} ${this.selectedYear}`,
        15,
        yPosition
    );
    yPosition += 10;

    // Résumé global
    const totalRemain = parseFloat(document.getElementById("total-remain").textContent);
    const totalExpenses = parseFloat(document.getElementById("total-expenses").textContent);
    const netProfit = parseFloat(document.getElementById("net-profit").textContent);

    const summaryData = [
        ["Reste à Payer (Contrats)", `${totalRemain.toFixed(2)} DT`],
        ["Total Dépenses", `${totalExpenses.toFixed(2)} DT`],
        ["Bénéfice Net", `${netProfit.toFixed(2)} DT`],
    ];

    doc.autoTable({
        startY: yPosition,
        head: [["Description", "Montant"]],
        body: summaryData,
        theme: "grid",
        styles: { lineColor: [0, 0, 0], lineWidth: 0.3 }, // bordures noires
        headStyles: { fillColor: [255, 215, 0], textColor: [0, 0, 0], fontStyle: "bold" },
        bodyStyles: { textColor: [0, 0, 0] },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text("Détails des Dépenses par Mois:", 15, yPosition);
    yPosition += 8;

    // Boucle sur tous les mois sélectionnés
    Object.entries(this.expenses).forEach(([monthKey, exp]) => {
        const [year, month] = monthKey.split("-");
        const monthNum = parseInt(month);
        const monthName = this.getMonthName(monthNum);

        // Réservations du mois
        const monthReservations = this.reservations.filter(res => {
            const resDate = new Date(res.date_res);
            return resDate.getFullYear() === parseInt(year) && resDate.getMonth() + 1 === monthNum;
        });

        const totalContractsCount = monthReservations.length;
        const hennaCount = monthReservations.filter(res => {
            const notesLines = (res.notes || "Mariage").split("\n");
            const eventType = notesLines[0].trim() || "Mariage";
            return eventType === "Henna";
        }).length;
        const marriageCount = monthReservations.filter(res => {
            const notesLines = (res.notes || "Mariage").split("\n");
            const eventType = notesLines[0].trim() || "Mariage";
            return eventType === "Mariage" || eventType === "";
        }).length;

        const monthRemain = monthReservations.reduce((sum, res) => {
            const montant = parseFloat(res.montant_tot) || 0;
            const avance = parseFloat(res.avance) || 0;
            return sum + (montant - avance);
        }, 0);
        const monthNetProfit = monthRemain - exp.total;

        // Charges
        const expenseData = [
            ["Serveurs", `${exp.servers.toFixed(2)} DT`],
            ["Gérant", `${exp.manager.toFixed(2)} DT`],
            ["Technicien Lumière", `${exp.lightingTechnician.toFixed(2)} DT`],
            ["Nettoyage", `${exp.cleaning.toFixed(2)} DT`],
            ["Électricité (contrats)", `${exp.electricity.toFixed(2)} DT`],
            ["Électricité (fixe)", `${exp.fixedMonthlyElectricity.toFixed(2)} DT`],
            ["IRPP", `${exp.irpp.toFixed(2)} DT`],
            ...(exp.monthlyCharges > 0 ? [["Charges Mensuels", `${exp.monthlyCharges.toFixed(2)} DT`]] : []),
            ["Total Dépenses", `${exp.total.toFixed(2)} DT`],
        ];

        // Statistiques
        const statisticsData = [
            ["Total Contrats", totalContractsCount],
            ["Contrats Mariage", marriageCount],
            ["Contrats Henna", hennaCount],
            ["Reste à Payer", `${monthRemain.toFixed(2)} DT`],
            ["Bénéfice Net", `${monthNetProfit.toFixed(2)} DT`],
        ];

        // Fusionner charges et statistiques avec une colonne vide au milieu
        const mergedData = [];
        const maxLength = Math.max(expenseData.length, statisticsData.length);
        for (let i = 0; i < maxLength; i++) {
            mergedData.push([
                expenseData[i] ? expenseData[i][0] : "",
                expenseData[i] ? expenseData[i][1] : "",
                "", // colonne vide pour espacement
                statisticsData[i] ? statisticsData[i][0] : "",
                statisticsData[i] ? statisticsData[i][1] : "",
            ]);
        }

        // Nouvelle page si nécessaire
        if (doc.lastAutoTable && doc.lastAutoTable.finalY + 80 > pageHeight) {
            doc.addPage();
            yPosition = 15;
        }

        // Titre du mois
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 150);
        doc.text(`${monthName} ${year}`, 15, yPosition);
        yPosition += 5;

        // Tableau fusionné
        doc.autoTable({
            startY: yPosition,
            head: [["Catégorie", "Montant", "", "Statistiques", "Valeur"]],
            body: mergedData,
            theme: "grid",
            styles: { lineColor: [0, 0, 0], lineWidth: 0.3 }, // bordures noires
            headStyles: { fillColor: [80, 80, 80], textColor: [255, 255, 255], fontStyle: "bold" },
            bodyStyles: { textColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 50, fillColor: [255, 230, 200] }, // Charges
                1: { cellWidth: 40, fillColor: [255, 230, 200] },
                2: { cellWidth: 10 }, // espace vide
                3: { cellWidth: 50, fillColor: [200, 230, 200] }, // Statistiques
                4: { cellWidth: 40, fillColor: [200, 230, 200] },
            },
        });

        yPosition = doc.lastAutoTable.finalY + 8;
    });

    doc.save(`comptabilite_${this.selectedYear}.pdf`);
}
    exportExcel() {
        if (this.selectedMonths.length === 0) {
            alert('Veuillez calculer d\'abord');
            return;
        }

        const wb = XLSX.utils.book_new();

        const summaryData = [
            ['RÉSUMÉ COMPTABILITÉ'],
            [`Période: ${this.selectedMonths.map(m => this.getMonthName(m)).join(', ')} ${this.selectedYear}`],
            [],
            ['Description', 'Montant'],
            ['Reste à Payer (Contrats)', parseFloat(document.getElementById('total-remain').textContent)],
            ['Total Dépenses', parseFloat(document.getElementById('total-expenses').textContent)],
            ['Bénéfice Net', parseFloat(document.getElementById('net-profit').textContent)]
        ];

        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Résumé');

        const expenseRows = [['DÉTAILS DES DÉPENSES']];
        Object.entries(this.expenses).forEach(([monthKey, exp]) => {
            const [year, month] = monthKey.split('-');
            const monthNum = parseInt(month);
            const monthName = this.getMonthName(monthNum);

            const monthReservations = this.reservations.filter(res => {
                const resDate = new Date(res.date_res);
                return resDate.getFullYear() === parseInt(year) && resDate.getMonth() + 1 === monthNum;
            });

            const totalContractsCount = monthReservations.length;
            const hennaCount = monthReservations.filter(res => {
                const notesLines = (res.notes || 'Mariage').split('\n');
                const eventType = notesLines[0].trim() || 'Mariage';
                return eventType === 'Henna';
            }).length;
            const marriageCount = monthReservations.filter(res => {
                const notesLines = (res.notes || 'Mariage').split('\n');
                const eventType = notesLines[0].trim() || 'Mariage';
                return eventType === 'Mariage' || eventType === '';
            }).length;
            const monthRemain = monthReservations.reduce((sum, res) => {
                const montant = parseFloat(res.montant_tot) || 0;
                const avance = parseFloat(res.avance) || 0;
                return sum + (montant - avance);
            }, 0);
            const monthNetProfit = monthRemain - exp.total;

            expenseRows.push([]);
            expenseRows.push([`${monthName} ${year}`]);
            expenseRows.push(['Serveurs', exp.servers]);
            expenseRows.push(['Gérant', exp.manager]);
            expenseRows.push(['Technicien Lumière', exp.lightingTechnician]);
            expenseRows.push(['Nettoyage', exp.cleaning]);
            expenseRows.push(['Électricité (contrats)', exp.electricity]);
            expenseRows.push(['Électricité (fixe)', exp.fixedMonthlyElectricity]);
            expenseRows.push(['IRPP', exp.irpp]);
            if (exp.monthlyCharges > 0) {
                expenseRows.push(['Charges Mensuels', exp.monthlyCharges]);
            }
            expenseRows.push(['TOTAL DÉPENSES', exp.total]);
            expenseRows.push([]);
            expenseRows.push(['--- STATISTIQUES ---']);
            expenseRows.push(['Total Contrats', totalContractsCount]);
            expenseRows.push(['Contrats Mariage', marriageCount]);
            expenseRows.push(['Contrats Henna', hennaCount]);
            expenseRows.push(['Reste à Payer', monthRemain]);
            expenseRows.push(['Bénéfice Net Mois', monthNetProfit]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(expenseRows);
        XLSX.utils.book_append_sheet(wb, ws2, 'Dépenses');

        XLSX.writeFile(wb, `comptabilite_${this.selectedYear}.xlsx`);
    }
}

let comptabiliteManager;
document.addEventListener('DOMContentLoaded', () => {
    comptabiliteManager = new ComptabiliteManager();
});
