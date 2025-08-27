// Test the improved date calculation
console.log("🔍 Testing improved date calculation...\n");

const currentYear = 2025;
const startDate = new Date(currentYear, 0, 1);
console.log("Start date:", startDate.toISOString().split("T")[0]);

// Old method (problematic)
const startDayOfWeekOld = startDate.getDay();
const adjustedStartDateOld = new Date(startDate);
adjustedStartDateOld.setDate(startDate.getDate() - startDayOfWeekOld);
console.log(
  "Old adjusted start date:",
  adjustedStartDateOld.toISOString().split("T")[0]
);

// New method (improved)
const startDayOfWeek = startDate.getDay();
const adjustedStartDate = new Date(
  startDate.getFullYear(),
  startDate.getMonth(),
  startDate.getDate() - startDayOfWeek
);
console.log(
  "New adjusted start date:",
  adjustedStartDate.toISOString().split("T")[0]
);

// Test August 19, 2025 calculation with new method
console.log("\n🎯 Testing August 19, 2025 with new method:");

// Generate grid positions for both methods
const testWeeks = 35; // Enough to cover August
const gridDaysOld = [];
const gridDaysNew = [];

// Old method
for (let week = 0; week < testWeeks; week++) {
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(adjustedStartDateOld);
    currentDate.setDate(adjustedStartDateOld.getDate() + week * 7 + day);
    gridDaysOld.push({
      date: currentDate.toISOString().split("T")[0],
      dayOfWeek: currentDate.getDay(),
      gridPosition: week * 7 + day,
      weekInGrid: week,
      dayInWeek: day,
    });
  }
}

// New method
for (let week = 0; week < testWeeks; week++) {
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(
      adjustedStartDate.getFullYear(),
      adjustedStartDate.getMonth(),
      adjustedStartDate.getDate() + week * 7 + day
    );
    gridDaysNew.push({
      date: currentDate.toISOString().split("T")[0],
      dayOfWeek: currentDate.getDay(),
      gridPosition: week * 7 + day,
      weekInGrid: week,
      dayInWeek: day,
    });
  }
}

// Find August 19 in both grids
const aug19Old = gridDaysOld.find((d) => d.date === "2025-08-19");
const aug19New = gridDaysNew.find((d) => d.date === "2025-08-19");

const headers = ["S", "M", "T", "W", "T", "F", "S"];

console.log("Old method result for Aug 19:");
if (aug19Old) {
  console.log("  Grid position:", aug19Old.gridPosition);
  console.log("  Week in grid:", aug19Old.weekInGrid);
  console.log("  Day in week:", aug19Old.dayInWeek);
  console.log("  Header position:", headers[aug19Old.dayInWeek]);
  console.log("  Actual day of week:", aug19Old.dayOfWeek);
  console.log("  Expected header:", headers[aug19Old.dayOfWeek]);
  console.log(
    "  Correct?",
    headers[aug19Old.dayInWeek] === headers[aug19Old.dayOfWeek]
  );
}

console.log("\nNew method result for Aug 19:");
if (aug19New) {
  console.log("  Grid position:", aug19New.gridPosition);
  console.log("  Week in grid:", aug19New.weekInGrid);
  console.log("  Day in week:", aug19New.dayInWeek);
  console.log("  Header position:", headers[aug19New.dayInWeek]);
  console.log("  Actual day of week:", aug19New.dayOfWeek);
  console.log("  Expected header:", headers[aug19New.dayOfWeek]);
  console.log(
    "  Correct?",
    headers[aug19New.dayInWeek] === headers[aug19New.dayOfWeek]
  );
}
