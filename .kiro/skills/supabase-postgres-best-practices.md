---
inclusion: auto
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:

- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category                 | Impact      | Prefix      |
| -------- | ------------------------ | ----------- | ----------- |
| 1        | Query Performance        | CRITICAL    | `query-`    |
| 2        | Connection Management    | CRITICAL    | `conn-`     |
| 3        | Security & RLS           | CRITICAL    | `security-` |
| 4        | Schema Design            | HIGH        | `schema-`   |
| 5        | Concurrency & Locking    | MEDIUM-HIGH | `lock-`     |
| 6        | Data Access Patterns     | MEDIUM      | `data-`     |
| 7        | Monitoring & Diagnostics | LOW-MEDIUM  | `monitor-`  |
| 8        | Advanced Features        | LOW         | `advanced-` |

## 1. Query Performance (CRITICAL)

- Always add indexes for columns used in WHERE, JOIN, and ORDER BY clauses
- Use partial indexes for queries that filter on a subset of rows
- Avoid SELECT \* — only select the columns you need
- Use EXPLAIN ANALYZE to verify query plans before deploying
- Prefer EXISTS over IN for subqueries with large result sets
- Avoid functions on indexed columns in WHERE clauses (breaks index usage)

## 2. Connection Management (CRITICAL)

- Use connection pooling (PgBouncer/Supavisor) for serverless and high-concurrency apps
- Set appropriate pool sizes based on your Postgres max_connections
- Use transaction mode pooling for short-lived queries
- Close connections promptly — don't hold idle connections
- Monitor active vs idle connections with pg_stat_activity

## 3. Security & RLS (CRITICAL)

- Enable RLS on all tables that store user data
- Write RLS policies that use indexed columns (auth.uid(), tenant_id)
- Avoid expensive functions in RLS policies — they run on every row
- Use security definer functions sparingly and audit them
- Test RLS policies with different roles to verify access control
- Never expose service_role key to the client

## 4. Schema Design (HIGH)

- Use appropriate data types (e.g., uuid for IDs, timestamptz for dates)
- Normalize data to reduce redundancy, denormalize only for proven performance needs
- Add NOT NULL constraints where applicable
- Use foreign keys for referential integrity
- Partition large tables (>10M rows) by date or tenant
- Prefer BIGINT over SERIAL for primary keys in new tables

## 5. Concurrency & Locking (MEDIUM-HIGH)

- Keep transactions short to minimize lock contention
- Use SELECT ... FOR UPDATE SKIP LOCKED for queue-like patterns
- Avoid long-running transactions that block autovacuum
- Use advisory locks for application-level coordination
- Monitor for deadlocks and lock waits in pg_stat_activity

## 6. Data Access Patterns (MEDIUM)

- Eliminate N+1 queries by using JOINs or batch fetching
- Use cursor-based pagination (WHERE id > $last_id) instead of OFFSET
- Batch INSERT/UPDATE operations instead of row-by-row
- Use UPSERT (ON CONFLICT) for idempotent writes
- Prefer server-side filtering over client-side filtering

## 7. Monitoring & Diagnostics (LOW-MEDIUM)

- Enable pg_stat_statements to track slow queries
- Regularly run EXPLAIN ANALYZE on critical queries
- Monitor table bloat and schedule VACUUM as needed
- Track index usage with pg_stat_user_indexes
- Set up alerts for connection count, replication lag, and disk usage

## 8. Advanced Features (LOW)

- Use GIN indexes for JSONB and full-text search columns
- Use GiST indexes for PostGIS geometry queries
- Leverage materialized views for expensive aggregations (refresh on schedule)
- Use pg_cron for scheduled maintenance tasks
- Consider unlogged tables for ephemeral/staging data

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
