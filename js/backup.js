// Backup and Restore functionality
class BackupManager {
    constructor() {
        this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg';
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        // Password for backup/restore operations (you should change this)
        this.BACKUP_PASSWORD = 'Mozart2024!';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStatistics();
    }

    bindEvents() {
        // Backup functionality
        document.getElementById('create-backup-btn').addEventListener('click', () => {
            this.handleCreateBackup();
        });

        // Restore functionality
        document.getElementById('restore-password').addEventListener('input', (e) => {
            this.validateRestorePassword(e.target.value);
        });

        document.getElementById('restore-file').addEventListener('change', (e) => {
            this.validateRestoreFile(e.target.files[0]);
        });

        document.getElementById('restore-backup-btn').addEventListener('click', () => {
            this.showConfirmationModal();
        });

        // Modal events
        document.getElementById('cancel-restore').addEventListener('click', () => {
            this.hideConfirmationModal();
        });

        document.getElementById('confirm-restore').addEventListener('click', () => {
            this.handleRestoreBackup();
        });
    }

    async handleCreateBackup() {
        const password = document.getElementById('backup-password').value;
        const errorDiv = document.getElementById('backup-password-error');
        const btn = document.getElementById('create-backup-btn');
        const btnText = document.getElementById('backup-btn-text');
        const spinner = document.getElementById('backup-spinner');

        // Validate password
        if (password !== this.BACKUP_PASSWORD) {
            errorDiv.textContent = 'Mot de passe incorrect';
            errorDiv.classList.remove('hidden');
            return;
        }

        errorDiv.classList.add('hidden');

        // Set loading state
        btn.disabled = true;
        btnText.textContent = 'Création en cours...';
        spinner.classList.remove('hidden');

        try {
            // Fetch all reservations
            const { data: reservations, error } = await this.supabase
                .from('reservations')
                .select('*')
                .order('date_creation', { ascending: false });

            if (error) {
                throw new Error(`Erreur lors de la récupération des données: ${error.message}`);
            }

            // Create backup object
            const backup = {
                version: '1.0',
                created_at: new Date().toISOString(),
                created_by: authManager.getCurrentUser()?.email || 'unknown',
                total_records: reservations.length,
                data: reservations
            };

            // Download as JSON file
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mozart-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Store last backup date
            localStorage.setItem('lastBackupDate', new Date().toISOString());
            this.loadStatistics();

            this.showMessage('Sauvegarde créée avec succès!', 'success');

        } catch (error) {
            console.error('Erreur création sauvegarde:', error);
            this.showMessage(`Erreur: ${error.message}`, 'error');
        } finally {
            // Reset loading state
            btn.disabled = false;
            btnText.textContent = 'Créer la Sauvegarde';
            spinner.classList.add('hidden');
            document.getElementById('backup-password').value = '';
        }
    }

    validateRestorePassword(password) {
        const fileInput = document.getElementById('restore-file');
        const restoreBtn = document.getElementById('restore-backup-btn');
        const errorDiv = document.getElementById('restore-password-error');

        if (password === this.BACKUP_PASSWORD) {
            fileInput.disabled = false;
            errorDiv.classList.add('hidden');
            this.checkRestoreReady();
        } else if (password.length > 0) {
            fileInput.disabled = true;
            restoreBtn.disabled = true;
            errorDiv.textContent = 'Mot de passe incorrect';
            errorDiv.classList.remove('hidden');
        } else {
            fileInput.disabled = true;
            restoreBtn.disabled = true;
            errorDiv.classList.add('hidden');
        }
    }

    validateRestoreFile(file) {
        const restoreBtn = document.getElementById('restore-backup-btn');

        if (file && file.type === 'application/json') {
            this.selectedFile = file;
            this.checkRestoreReady();
        } else {
            this.selectedFile = null;
            restoreBtn.disabled = true;
        }
    }

    checkRestoreReady() {
        const password = document.getElementById('restore-password').value;
        const restoreBtn = document.getElementById('restore-backup-btn');

        if (password === this.BACKUP_PASSWORD && this.selectedFile) {
            restoreBtn.disabled = false;
        } else {
            restoreBtn.disabled = true;
        }
    }

    showConfirmationModal() {
        document.getElementById('confirmation-modal').classList.remove('hidden');
    }

    hideConfirmationModal() {
        document.getElementById('confirmation-modal').classList.add('hidden');
    }

    async handleRestoreBackup() {
        this.hideConfirmationModal();

        const btn = document.getElementById('restore-backup-btn');
        const btnText = document.getElementById('restore-btn-text');
        const spinner = document.getElementById('restore-spinner');

        // Set loading state
        btn.disabled = true;
        btnText.textContent = 'Restauration en cours...';
        spinner.classList.remove('hidden');

        try {
            // Read file content
            const fileContent = await this.readFileAsText(this.selectedFile);
            const backup = JSON.parse(fileContent);

            // Validate backup structure
            if (!backup.data || !Array.isArray(backup.data)) {
                throw new Error('Format de sauvegarde invalide');
            }

            // Get current user for created_by field
            const currentUser = authManager.getCurrentUser();
            if (!currentUser) {
                throw new Error('Utilisateur non authentifié');
            }

            // Delete all existing reservations
            const { error: deleteError } = await this.supabase
                .from('reservations')
                .delete()
                .neq('reservation_id', 0); // Delete all records

            if (deleteError) {
                throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
            }

            // Insert backup data
            const dataToInsert = backup.data.map(record => ({
                ...record,
                created_by: currentUser.id, // Update created_by to current user
                date_creation: new Date().toISOString() // Update creation date
            }));

            const { error: insertError } = await this.supabase
                .from('reservations')
                .insert(dataToInsert);

            if (insertError) {
                throw new Error(`Erreur lors de l'insertion: ${insertError.message}`);
            }

            this.showMessage(`Restauration réussie! ${backup.data.length} réservations restaurées.`, 'success');
            this.loadStatistics();

        } catch (error) {
            console.error('Erreur restauration:', error);
            this.showMessage(`Erreur: ${error.message}`, 'error');
        } finally {
            // Reset form and loading state
            btn.disabled = true;
            btnText.textContent = 'Restaurer la Sauvegarde';
            spinner.classList.add('hidden');
            document.getElementById('restore-password').value = '';
            document.getElementById('restore-file').value = '';
            document.getElementById('restore-file').disabled = true;
            this.selectedFile = null;
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Erreur lecture fichier'));
            reader.readAsText(file);
        });
    }

    async loadStatistics() {
        try {
            // Get total reservations
            const { count: totalCount, error: totalError } = await this.supabase
                .from('reservations')
                .select('*', { count: 'exact', head: true });

            if (totalError) throw totalError;

            // Get upcoming reservations
            const today = new Date().toISOString().split('T')[0];
            const { count: upcomingCount, error: upcomingError } = await this.supabase
                .from('reservations')
                .select('*', { count: 'exact', head: true })
                .gte('date_res', today);

            if (upcomingError) throw upcomingError;

            // Update UI
            document.getElementById('total-reservations').textContent = totalCount || 0;
            document.getElementById('upcoming-reservations').textContent = upcomingCount || 0;

            // Last backup date
            const lastBackup = localStorage.getItem('lastBackupDate');
            if (lastBackup) {
                const date = new Date(lastBackup).toLocaleDateString('fr-FR');
                document.getElementById('last-backup').textContent = date;
            } else {
                document.getElementById('last-backup').textContent = 'Jamais';
            }

        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
        }
    }

    showMessage(message, type) {
        const container = document.getElementById('message-container');
        const messageDiv = document.createElement('div');
        
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        messageDiv.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg mb-4 flex items-center animate-fade-in`;
        messageDiv.innerHTML = `
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
            <button class="ml-auto text-white hover:text-gray-200" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize backup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackupManager();
});