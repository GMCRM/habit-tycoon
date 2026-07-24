-- Fix get_stock_owners: ORDER BY on a UNION ALL must reference a result
-- column name shared by both branches. The original SELECTs left column 2
-- unaliased, so Postgres named it after the *first* branch's column
-- (shares_owned_by_owner), and `ORDER BY shares_owned DESC` couldn't resolve
-- to it — failing at call time with:
--   invalid UNION/INTERSECT/EXCEPT ORDER BY clause
--   Only result column names can be used, not expressions or functions.
-- Aliasing every column to match the RETURNS TABLE names fixes it.
CREATE OR REPLACE FUNCTION get_stock_owners(business_id_param UUID) RETURNS TABLE (
    owner_name TEXT,
    shares_owned INTEGER,
    is_business_owner BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT up.name AS owner_name,
    bs.shares_owned_by_owner AS shares_owned,
    true AS is_business_owner
FROM business_stocks bs
    JOIN user_profiles up ON up.id = bs.business_owner_id
WHERE bs.habit_business_id = business_id_param
    AND bs.shares_owned_by_owner > 0
UNION ALL
SELECT up.name AS owner_name,
    sh.shares_owned AS shares_owned,
    false AS is_business_owner
FROM stock_holdings sh
    JOIN business_stocks bs ON bs.id = sh.stock_id
    JOIN user_profiles up ON up.id = sh.holder_id
WHERE bs.habit_business_id = business_id_param
    AND sh.shares_owned > 0
ORDER BY shares_owned DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_stock_owners(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
