/*
# Table pour les logs d'envoi d'e-mails

1. Nouvelle Table
   - `email_logs`
     - `id` (uuid, primary key)
     - `email_type` (text) - 'weekly' ou 'monthly'
     - `sent_at` (timestamp)
     - `recipient_count` (integer)
     - `success_count` (integer)
     - `failure_count` (integer)
     - `reservations_count` (integer)
     - `created_at` (timestamp)

2. Sécurité
   - Enable RLS sur `email_logs` table
   - Add policy pour les utilisateurs authentifiés
*/

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type text NOT NULL CHECK (email_type IN ('weekly', 'monthly')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  reservations_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert email logs"
  ON email_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);