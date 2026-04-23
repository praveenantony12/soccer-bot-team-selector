-- Migration: Add player_tokens column to daily_data table
-- Run this in Supabase SQL Editor

-- Add the player_tokens column as JSONB (stores the tokens object)
ALTER TABLE daily_data
ADD COLUMN IF NOT EXISTS player_tokens JSONB DEFAULT '{}'::jsonb;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_daily_data_player_tokens
ON daily_data USING GIN (player_tokens);

COMMENT ON COLUMN daily_data.player_tokens IS 'Stores removal tokens for players: {playerName: {token, createdAt}}';
