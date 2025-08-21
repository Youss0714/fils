-- Liste des fonctions sans search_path fixé
SELECT n.nspname AS schema,
       p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proconfig IS NULL;
