const { createClient } = require("@supabase/supabase-js");

// Supabase credentials from environment
const supabaseUrl = "https://xqdzixbmnegeunjnzrla.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHppeGJtbmVnZXVuam56cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM4MzksImV4cCI6MjA3MDYwOTgzOX0.LfDmVEndKhd5iNT5ddg6X3FHyzC119Asp1QResR64DM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUsers() {
  try {
    console.log("🔍 Testing database connection...");

    // First, let's check basic connectivity
    const { data: testData, error: testError } = await supabase
      .from("user_profiles")
      .select("count", { count: "exact", head: true });

    if (testError) {
      console.error("❌ Basic connection error:", testError);
      return;
    }

    console.log(`✅ Database connected. Row count: ${testData}`);

    console.log("\n🔍 Checking user_profiles table without auth...");

    const { data: profiles, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching profiles:", error);
      console.log(
        "\n🔄 This might be due to RLS policies. Let me check with different settings..."
      );

      // Try with RLS bypass (won't work without service role key, but let's see the error)
      console.log("\n🔍 Trying to understand RLS restrictions...");
      console.log("Error code:", error.code);
      console.log("Error details:", error.details);
      console.log("Error hint:", error.hint);
    } else {
      console.log(`\n📊 Found ${profiles.length} user profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ${profile.name || "No name"}`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Cash: $${profile.cash || 0}`);
        console.log(`   Net Worth: $${profile.net_worth || 0}`);
        console.log(`   Created: ${profile.created_at}`);
      });
    }

    // Let's also check if we can see ANY data without filters
    console.log("\n🔍 Checking for any data at all...");
    const { data: anyData, error: anyError } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(5);

    if (anyError) {
      console.error("❌ Error getting any data:", anyError);
    } else {
      console.log(`📊 Can see ${anyData.length} rows (ID only)`);
    }
  } catch (error) {
    console.error("❌ Exception:", error);
  }
}

debugUsers();
