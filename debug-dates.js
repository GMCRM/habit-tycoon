// Debug script to test date calculations
console.log("=== Date Debugging ===");

const currentYear = new Date().getFullYear();
const startDate = new Date(currentYear, 0, 1); // January 1
console.log(
  "Start date (Jan 1):",
  startDate.toDateString(),
  "day of week:",
  startDate.getDay()
);

// Calculate adjustment to Sunday
const startDayOfWeek = startDate.getDay();
console.log("Days to subtract to reach Sunday:", startDayOfWeek);

const adjustedStartDate = new Date(
  startDate.getFullYear(),
  startDate.getMonth(),
  startDate.getDate() - startDayOfWeek
);
console.log(
  "Adjusted start date:",
  adjustedStartDate.toDateString(),
  "day of week:",
  adjustedStartDate.getDay()
);

// Test first week generation
console.log("\n=== First Week Generation ===");
for (let day = 0; day < 7; day++) {
  const currentDate = new Date(
    adjustedStartDate.getFullYear(),
    adjustedStartDate.getMonth(),
    adjustedStartDate.getDate() + day
  );
  const dateStr = currentDate.toISOString().split("T")[0];
  console.log(
    `Position ${day}: ${dateStr} = ${currentDate.toDateString()} (day of week: ${currentDate.getDay()})`
  );
}

// Test August dates specifically
console.log("\n=== August 2024 Test ===");
const aug15 = new Date(2024, 7, 15); // August 15, 2024
const aug20 = new Date(2024, 7, 20); // August 20, 2024
console.log("Aug 15:", aug15.toDateString(), "day of week:", aug15.getDay());
console.log("Aug 20:", aug20.toDateString(), "day of week:", aug20.getDay());
console.log("Aug 15 string:", aug15.toISOString().split("T")[0]);
console.log("Aug 20 string:", aug20.toISOString().split("T")[0]);

// Test range generation like the service does
console.log("\n=== Service Date Range Test ===");
const serviceStartDate = new Date(2025, 0, 1); // Jan 1, 2025
const serviceEndDate = new Date(2025, 11, 31); // Dec 31, 2025

console.log(
  "Service range:",
  serviceStartDate.toDateString(),
  "to",
  serviceEndDate.toDateString()
);

// Generate some sample dates in August 2024 (outside the 2025 range)
const testDate = new Date(2024, 7, 20); // Aug 20, 2024
console.log("Test date Aug 20, 2024:", testDate.toDateString());
console.log("Is Aug 20, 2024 >= Jan 1, 2025?", testDate >= serviceStartDate);
console.log("Is Aug 20, 2024 <= Dec 31, 2025?", testDate <= serviceEndDate);
