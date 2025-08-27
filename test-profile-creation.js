const { createClient } = require("@supabase/supabase-js");

// Supabase credentials
const supabaseUrl = "https://xqdzixbmnegeunjnzrla.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHppeGJtbmVnZXVuam56cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM4MzksImV4cCI6MjA3MDYwOTgzOX0.LfDmVEndKhd5iNT5ddg6X3FHyzC119Asp1QResR64DM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    console.log("🔍 Testing auth system...");

    // Check current auth state
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session error:", sessionError);
    } else if (session) {
      console.log("✅ Current session found:");
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Email: ${session.user.email}`);
      console.log(`   Name: ${session.user.user_metadata?.name || "No name"}`);

      // Now check if this user has a profile
      console.log("\n🔍 Checking for user profile...");
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.log("❌ Profile not found:", profileError.message);

        // Try to create profile for this user
        console.log("\n🔧 Attempting to create profile...");
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            id: session.user.id,
            email: session.user.email,
            name:
              session.user.user_metadata?.name ||
              session.user.email.split("@")[0],
            cash: 100,
            net_worth: 100,
          })
          .select()
          .single();

        if (createError) {
          console.error("❌ Profile creation failed:", createError);
        } else {
          console.log("✅ Profile created:", newProfile);
        }
      } else {
        console.log("✅ Profile found:", profile);
      }
    } else {
      console.log("ℹ️ No active session found");

      // Try to sign in with a test account
      console.log("\n🔧 You need to sign in first. Please:");
      console.log("1. Open http://localhost:8107 in your browser");
      console.log("2. Sign in with one of your test accounts");
      console.log("3. Run this script again");
    }
  } catch (error) {
    console.error("❌ Exception:", error);
  }
}

testAuth();
