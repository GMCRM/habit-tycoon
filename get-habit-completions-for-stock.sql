-- Function to get habit completion history for stock viewing
-- This function allows investors to see completion patterns of businesses they're viewing/investing in
DROP FUNCTION IF EXISTS get_habit_completions_for_stock(
    UUID,
    TIMESTAMP WITH TIME ZONE,
    TIMESTAMP WITH TIME ZONE
);
CREATE OR REPLACE FUNCTION get_habit_completions_for_stock(
        input_uuid UUID,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE
    ) RETURNS TABLE (
        id UUID,
        completed_at TIMESTAMP WITH TIME ZONE,
        streak_count INTEGER,
        habit_business_id UUID
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE target_business_id UUID;
BEGIN -- First, try to find if input_uuid is a business ID
SELECT id INTO target_business_id
FROM habit_businesses
WHERE id = input_uuid;
-- If not found, try to find the business ID by stock ID
IF target_business_id IS NULL THEN
SELECT habit_business_id INTO target_business_id
FROM business_stocks
WHERE id = input_uuid;
END IF;
-- If still not found, return empty
IF target_business_id IS NULL THEN RETURN;
END IF;
-- Check if the business has a stock (is publicly available for investment)
IF NOT EXISTS (
    SELECT 1
    FROM business_stocks bs
        INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    WHERE hb.id = target_business_id
) THEN -- Business doesn't have a stock, return empty result
RETURN;
END IF;
-- Return completion history for the business
-- This is allowed because the business has a public stock available for investment
RETURN QUERY
SELECT hc.id,
    hc.completed_at,
    hc.streak_count,
    hc.habit_business_id
FROM habit_completions hc
WHERE hc.habit_business_id = target_business_id
    AND hc.completed_at >= start_date
    AND hc.completed_at <= end_date
ORDER BY hc.completed_at ASC;
END;
$$;
$$;
-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION get_habit_completions_for_stock(
        UUID,
        TIMESTAMP WITH TIME ZONE,
        TIMESTAMP WITH TIME ZONE
    ) TO authenticated;
COMMENT ON FUNCTION get_habit_completions_for_stock(
    UUID,
    TIMESTAMP WITH TIME ZONE,
    TIMESTAMP WITH TIME ZONE
) IS 'Get habit completion history for businesses that have public stocks available for investment. Used by the stock market interface to show habit completion patterns to potential investors.';