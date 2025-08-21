DO $$
DECLARE
    func RECORD;
    alter_cmd TEXT;
BEGIN
    FOR func IN
        SELECT n.nspname AS schema_name,
               p.proname AS function_name,
               pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proconfig IS NULL
    LOOP
        alter_cmd := FORMAT(
            'ALTER FUNCTION %I.%I(%s) SET search_path = public;',
            func.schema_name,
            func.function_name,
            func.args
        );
        RAISE NOTICE 'Correction: %', alter_cmd;
        EXECUTE alter_cmd;
    END LOOP;
END $$;
