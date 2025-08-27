const { createClient } = require('@supabase/supabase-js');

// Using the same credentials from the project
const supabaseUrl = "https://xqdzixbmnegeunjnzrla.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHppeGJtbmVnZXVuam56cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM4MzksImV4cCI6MjA3MDYwOTgzOX0.LfDmVEndKhd5iNT5ddg6X3FHyzC119Asp1QResR64DM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileCreationLogic() {
  try {
    console.log("🧪 Testing profile creation logic...");
    
    // Test the upsert logic that the new method uses
    const testUser = {
      id: "test-user-" + Date.now(),
      email: "test@example.com",
      full_name: "Test User"
    };
    
    console.log("📝 Testing profile upsert...");
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: testUser.id,
        email: testUser.email,
        name: testUser.full_name || testUser.email.split('@')[0],
        cash: 100.00,
        net_worth: 100.00
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Profile creation test failed:", error);
      console.log("This might be due to RLS policies (expected if not authenticated)");
    } else {
      console.log("✅ Profile creation test successful:", data);
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUser.id);
      console.log("🧹 Cleaned up test data");
    }
    
  } catch (error) {
    console.error("❌ Test failed with exception:", error);
  }
}

testProfileCreationLogic();