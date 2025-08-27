// Test timezone fixes
console.log("🔍 Testing timezone fixes...\n");

// Test the local date function
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const now = new Date();
const utcDate = now.toISOString().split("T")[0];
const localDate = getLocalDateString(now);

console.log("Current time:", now.toString());
console.log("UTC date:", utcDate);
console.log("Local date:", localDate);
console.log("Timezone offset (minutes):", now.getTimezoneOffset());
console.log("Are they different?", utcDate !== localDate);

if (utcDate !== localDate) {
  console.log(
    "⚠️ UTC and local dates differ - this was causing the alignment issue!"
  );
} else {
  console.log("✅ UTC and local dates match in this timezone");
}

// Test specific dates
console.log("\n📅 Testing specific dates:");
const aug19 = new Date(2025, 7, 19); // August 19, 2025
const aug20 = new Date(2025, 7, 20); // August 20, 2025

console.log("Aug 19 UTC:", aug19.toISOString().split("T")[0]);
console.log("Aug 19 Local:", getLocalDateString(aug19));
console.log("Aug 19 Day of week:", aug19.getDay(), "(should be 2 for Tuesday)");

console.log("Aug 20 UTC:", aug20.toISOString().split("T")[0]);
console.log("Aug 20 Local:", getLocalDateString(aug20));
console.log(
  "Aug 20 Day of week:",
  aug20.getDay(),
  "(should be 3 for Wednesday)"
);
