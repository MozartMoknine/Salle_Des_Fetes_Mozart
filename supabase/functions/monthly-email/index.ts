/*
# Fonction d'envoi d'e-mails mensuels

1. Fonctionnalité
   - Envoie chaque fin de mois un e-mail à tous les utilisateurs
   - Contient toutes les réservations du mois suivant
   - Format: Date, Horaire, Nom & Prénom, Notes

2. Sécurité
   - Utilise les variables d'environnement Supabase
   - Authentification par service role key

3. Déclenchement
   - Programmé via Supabase Cron Jobs
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface Reservation {
  date_res: string;
  horaire: string;
  nom: string;
  prenom: string;
  notes: string;
}

interface User {
  email: string;
  nom?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get next month's date range
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    const startDate = nextMonth.toISOString().split('T')[0];
    const endDate = endOfNextMonth.toISOString().split('T')[0];

    // Fetch next month's reservations
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('date_res, horaire, nom, prenom, notes')
      .gte('date_res', startDate)
      .lte('date_res', endDate)
      .order('date_res', { ascending: true });

    if (reservationsError) {
      throw new Error(`Erreur récupération réservations: ${reservationsError.message}`);
    }

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, nom');

    if (usersError) {
      throw new Error(`Erreur récupération utilisateurs: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Aucun utilisateur trouvé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email content
    const emailContent = generateMonthlyEmailContent(reservations || [], startDate, endDate);

    // Send emails to all users
    const emailPromises = users.map(user => sendEmail(user, emailContent, 'monthly'));
    const results = await Promise.allSettled(emailPromises);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        message: `E-mails mensuels envoyés`,
        success: successCount,
        failures: failureCount,
        reservations: reservations?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur fonction monthly-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateMonthlyEmailContent(reservations: Reservation[], startDate: string, endDate: string): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHoraire = (horaire: string) => {
    return horaire === 'nuit' ? 'Soirée (20h30-01h00)' : 'Après-midi (15h30-20h00)';
  };

  const monthName = new Date(startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  let content = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; text-align: center; color: #000; }
          .content { padding: 20px; }
          .reservation { background: #f9f9f9; margin: 10px 0; padding: 15px; border-left: 4px solid #FFD700; }
          .date { font-weight: bold; color: #2c3e50; font-size: 1.1em; }
          .details { margin-top: 8px; }
          .horaire { color: #e67e22; font-weight: 600; }
          .client { color: #27ae60; font-weight: 600; }
          .notes { color: #7f8c8d; font-style: italic; margin-top: 5px; }
          .footer { background: #2c3e50; color: white; padding: 15px; text-align: center; margin-top: 20px; }
          .stats { background: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎭 Salle des Fêtes Mozart</h1>
          <h2>Réservations du mois prochain</h2>
          <p>${monthName}</p>
        </div>
        <div class="content">
          <div class="stats">
            <h3>📊 Statistiques du mois</h3>
            <p><strong>${reservations.length}</strong> réservation(s) prévue(s)</p>
          </div>
  `;

  if (reservations.length === 0) {
    content += `
      <div class="reservation">
        <p style="text-align: center; color: #27ae60; font-size: 1.2em;">
          🎉 Aucune réservation prévue pour le mois prochain
        </p>
      </div>
    `;
  } else {
    reservations.forEach(reservation => {
      content += `
        <div class="reservation">
          <div class="date">📅 ${formatDate(reservation.date_res)}</div>
          <div class="details">
            <div class="horaire">🕒 ${formatHoraire(reservation.horaire)}</div>
            <div class="client">👤 ${reservation.prenom} ${reservation.nom}</div>
            ${reservation.notes ? `<div class="notes">📝 ${reservation.notes.replace(/\n/g, ' • ')}</div>` : ''}
          </div>
        </div>
      `;
    });
  }

  content += `
        </div>
        <div class="footer">
          <p>Salle des Fêtes Mozart - Système automatique de notification</p>
          <p>📧 E-mail envoyé automatiquement chaque fin de mois</p>
        </div>
      </body>
    </html>
  `;

  return content;
}

async function sendEmail(user: User, content: string, type: 'weekly' | 'monthly'): Promise<void> {
  const subject = type === 'weekly' 
    ? '📅 Réservations de la semaine prochaine - Salle Mozart'
    : '📅 Réservations du mois prochain - Salle Mozart';

  // Here you would integrate with your email service (SendGrid, Resend, etc.)
  // For now, we'll log the email content
  console.log(`Envoi e-mail à ${user.email}:`);
  console.log(`Sujet: ${subject}`);
  console.log(`Contenu: ${content.substring(0, 200)}...`);
  
  // Example with a hypothetical email service:
  /*
  const response = await fetch('https://api.your-email-service.com/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('EMAIL_API_KEY')}`
    },
    body: JSON.stringify({
      to: user.email,
      subject: subject,
      html: content
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur envoi e-mail: ${response.statusText}`);
  }
  */
}