/*
  # Add Provenance Tracking to Tracks

  ## Changes
  - Add `provider_task_id` to tracks table for external provider tracking
  - Add `prompt_hash` for content verification and audit trail
  - Both fields are important for legal compliance and debugging

  ## Fields Added
  - `provider_task_id` (text) - External provider's task/job ID
  - `prompt_hash` (text) - SHA256 hash of the prompt for provenance

  ## Note
  These fields enable full audit trail for generated content, supporting
  DMCA compliance and content attribution requirements.
*/

-- Add provider_task_id to tracks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'provider_task_id'
  ) THEN
    ALTER TABLE tracks ADD COLUMN provider_task_id text;
  END IF;
END $$;

-- Add prompt_hash to tracks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'prompt_hash'
  ) THEN
    ALTER TABLE tracks ADD COLUMN prompt_hash text;
  END IF;
END $$;

-- Create index on provider_task_id for lookups
CREATE INDEX IF NOT EXISTS idx_tracks_provider_task_id ON tracks(provider_task_id) WHERE provider_task_id IS NOT NULL;