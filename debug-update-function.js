// Temporary debug script to update the database function
// Run this in the browser console on your app

async function updateDatabaseFunction() {
  const { createClient } = window.supabase;
  const supabase = createClient("your-supabase-url", "your-supabase-anon-key");

  const sql = `
    -- Drop the old function first
    DROP FUNCTION IF EXISTS get_habit_completions_for_stock(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);

    -- Create the new flexible function
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
    DECLARE
        target_business_id UUID;
    BEGIN 
        -- First, try to find the business ID directly (if input_uuid is a business ID)
        SELECT hb.id INTO target_business_id
        FROM habit_businesses hb
        WHERE hb.id = input_uuid;
        
        -- If not found, try to find it via stock ID (if input_uuid is a stock ID)
        IF target_business_id IS NULL THEN
            SELECT bs.habit_business_id INTO target_business_id
            FROM business_stocks bs
            WHERE bs.id = input_uuid;
        END IF;
        
        -- If still no business found, return empty result
        IF target_business_id IS NULL THEN
            RETURN;
        END IF;

        -- Verify the business has a stock (is publicly available for investment)
        IF NOT EXISTS (
            SELECT 1
            FROM business_stocks bs
            WHERE bs.habit_business_id = target_business_id
        ) THEN
            -- Business doesn't have a stock, return empty result
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
  `;

  try {
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });
    if (error) {
      console.error("Error updating function:", error);
    } else {
      console.log("Function updated successfully:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function
updateDatabaseFunction();
