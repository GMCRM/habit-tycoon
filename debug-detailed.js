// More detailed debugging
console.log("🔍 Detailed debugging for August 19, 2025...\n");

const adjustedStartDate = new Date(2024, 11, 29); // December 29, 2024 (Sunday)
const aug19 = new Date(2025, 7, 19); // August 19, 2025

console.log("Adjusted start date:", adjustedStartDate.toISOString());
console.log("August 19, 2025:", aug19.toISOString());
console.log("Start date day of week:", adjustedStartDate.getDay());
console.log("Aug 19 day of week:", aug19.getDay());

// Calculate days difference
const timeDiff = aug19.getTime() - adjustedStartDate.getTime();
const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

console.log("\nTime difference (ms):", timeDiff);
console.log("Days difference:", daysDiff);

// Manual verification
console.log("\nManual day counting:");
let currentDate = new Date(adjustedStartDate);
let count = 0;
while (currentDate <= aug19) {
  if (
    currentDate.toISOString().split("T")[0] ===
    aug19.toISOString().split("T")[0]
  ) {
    console.log(
      `Day ${count}: ${
        currentDate.toISOString().split("T")[0]
      } = ${currentDate.toLocaleDateString("en-US", { weekday: "short" })}`
    );
    console.log("Day of week:", currentDate.getDay());
    console.log("Week number:", Math.floor(count / 7));
    console.log("Day in week:", count % 7);
    break;
  }
  currentDate.setDate(currentDate.getDate() + 1);
  count++;
}

// Test the exact calculation from our component
console.log("\n🧮 Component calculation replication:");
const testDate = new Date(adjustedStartDate);
const targetDays = 232; // From our previous calculation
testDate.setDate(adjustedStartDate.getDate() + targetDays);
console.log("Date at position 232:", testDate.toISOString().split("T")[0]);
console.log("Expected: 2025-08-19");
console.log("Match:", testDate.toISOString().split("T")[0] === "2025-08-19");

// Let's try the correct calculation
console.log("\n✅ Correct calculation:");
const correctDaysDiff = Math.round(
  (aug19.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24)
);
console.log("Correct days diff:", correctDaysDiff);
console.log("Correct week:", Math.floor(correctDaysDiff / 7));
console.log("Correct day in week:", correctDaysDiff % 7);

const headers = ["S", "M", "T", "W", "T", "F", "S"];
console.log("Should be under:", headers[correctDaysDiff % 7]);
