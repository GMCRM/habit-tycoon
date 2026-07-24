-- Get the full ownership breakdown (name + shares) for a business's stock.
-- SECURITY DEFINER so any authenticated user can see who holds shares of a
-- business they're browsing (e.g. on the Available Stocks or Portfolio
-- pages), not just their own holdings — stock_holdings' RLS policy only
-- lets a user see their own rows or rows for businesses they own.
CREATE OR REPLACE FUNCTION get_stock_owners(business_id_param UUID) RETURNS TABLE (
    owner_name TEXT,
    shares_owned INTEGER,
    is_business_owner BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT up.name,
    bs.shares_owned_by_owner,
    true
FROM business_stocks bs
    JOIN user_profiles up ON up.id = bs.business_owner_id
WHERE bs.habit_business_id = business_id_param
    AND bs.shares_owned_by_owner > 0
UNION ALL
SELECT up.name,
    sh.shares_owned,
    false
FROM stock_holdings sh
    JOIN business_stocks bs ON bs.id = sh.stock_id
    JOIN user_profiles up ON up.id = sh.holder_id
WHERE bs.habit_business_id = business_id_param
    AND sh.shares_owned > 0
ORDER BY shares_owned DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_stock_owners(UUID) TO authenticated;
