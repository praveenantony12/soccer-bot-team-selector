-- Migration: remove old daily_data rows (only today's row is ever used)
-- Run in Supabase SQL Editor. Adjust the time zone if TEAM_TIMEZONE differs.

-- 1) One-time backlog cleanup
DELETE FROM daily_data
WHERE date < (now() AT TIME ZONE 'America/New_York')::date;

-- 2) Optional DB-side safety net (independent of the app server).
--    Requires the pg_cron extension (Database > Extensions > pg_cron).
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'purge-old-daily-data',
--   '10 5 * * *', -- 05:10 UTC, after local midnight year-round
--   $$DELETE FROM daily_data WHERE date < (now() AT TIME ZONE 'America/New_York')::date$$
-- );
