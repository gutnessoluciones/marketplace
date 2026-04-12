-- Migration: Developer zone helper functions
-- These functions provide DB metrics for the admin developer panel.

-- Get current database size in MB
CREATE OR REPLACE FUNCTION get_db_size_mb()
RETURNS TABLE(size_mb numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 2) AS size_mb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get row counts for all application tables (using pg_stat_user_tables)
CREATE OR REPLACE FUNCTION get_table_row_counts()
RETURNS TABLE("table" text, rows bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.relname::text AS "table",
    s.n_live_tup AS rows
  FROM pg_stat_user_tables s
  WHERE s.schemaname = 'public'
  ORDER BY s.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION get_db_size_mb() TO service_role;
GRANT EXECUTE ON FUNCTION get_table_row_counts() TO service_role;
