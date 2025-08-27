// Debug script to test grid alignment logic
console.log("🔍 Testing grid alignment logic...\n");

// Replicate the grid generation logic
const currentYear = 2025;
const startDate = new Date(currentYear, 0, 1); // January 1, 2025
const endDate = new Date(currentYear + 1, 0, 1); // January 1, 2026

console.log(
  "📅 Start date:",
  startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log(
  "📅 Start date day of week:",
  startDate.getDay(),
  "(0=Sun, 1=Mon, ..., 6=Sat)"
);

// Adjust startDate to begin on Sunday (like GitHub)
const startDayOfWeek = startDate.getDay();
const adjustedStartDate = new Date(startDate);
adjustedStartDate.setDate(startDate.getDate() - startDayOfWeek);

console.log(
  "\n📅 Adjusted start date:",
  adjustedStartDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("📅 Adjusted start date day of week:", adjustedStartDate.getDay());

// Test first week of grid
console.log("\n📊 First week of grid (should be S M T W T F S):");
const gridDays = [];
for (let week = 0; week < 2; week++) {
  // Test first 2 weeks
  console.log(`\nWeek ${week}:`);
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(adjustedStartDate);
    currentDate.setDate(adjustedStartDate.getDate() + week * 7 + day);

    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay();
    const dayName = currentDate.toLocaleDateString("en-US", {
      weekday: "short",
    });

    console.log(`  ${day}: ${dateStr} = ${dayName} (${dayOfWeek})`);
    gridDays.push({ date: dateStr, dayOfWeek, dayName });
  }
}

// Test specific date: August 19, 2025
console.log("\n🎯 Testing August 19, 2025 specifically:");
const aug19 = new Date(2025, 7, 19);
console.log(
  "August 19, 2025 =",
  aug19.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("Day of week:", aug19.getDay(), "(should be 2 for Tuesday)");

// Find August 19 in our grid
const daysDiff = Math.floor(
  (aug19.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24)
);
const weekNumber = Math.floor(daysDiff / 7);
const dayInWeek = daysDiff % 7;

console.log("Days from grid start:", daysDiff);
console.log("Week number in grid:", weekNumber);
console.log("Day in week (0=Sun, 1=Mon, ..., 6=Sat):", dayInWeek);
console.log("Grid position:", weekNumber * 7 + dayInWeek);

// Verify the grid headers alignment
const headers = ["S", "M", "T", "W", "T", "F", "S"];
console.log("Expected header for August 19:", headers[dayInWeek]);
console.log(
  'August 19 should appear under the "' + headers[dayInWeek] + '" column'
);
