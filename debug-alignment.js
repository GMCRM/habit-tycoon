// Test exact grid alignment for current issue
console.log("🔍 Testing exact grid alignment issue...\n");

// Replicate exact component logic
const currentYear = 2025;
const startDate = new Date(currentYear, 0, 1); // January 1, 2025
console.log(
  "Start date:",
  startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("Start date day of week:", startDate.getDay());

// Adjust startDate to begin on Sunday (component logic)
const startDayOfWeek = startDate.getDay();
const adjustedStartDate = new Date(
  startDate.getFullYear(),
  startDate.getMonth(),
  startDate.getDate() - startDayOfWeek
);
console.log(
  "Adjusted start date:",
  adjustedStartDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("Adjusted start date day of week:", adjustedStartDate.getDay());

// Generate grid exactly like component
const gridDays = [];
const weeksNeeded = 54; // Approximate

for (let week = 0; week < weeksNeeded; week++) {
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(
      adjustedStartDate.getFullYear(),
      adjustedStartDate.getMonth(),
      adjustedStartDate.getDate() + week * 7 + day
    );
    const dateStr = currentDate.toISOString().split("T")[0];

    gridDays.push({
      date: dateStr,
      dayOfWeek: currentDate.getDay(),
      dayName: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
      week: week,
      dayInWeek: day,
      gridPosition: week * 7 + day,
    });

    // Stop after we have enough data
    if (gridDays.length > 250) break;
  }
  if (gridDays.length > 250) break;
}

// Find key dates
const today = new Date(2025, 7, 20); // August 20, 2025
const todayStr = today.toISOString().split("T")[0];
const yesterday = new Date(2025, 7, 19); // August 19, 2025
const yesterdayStr = yesterday.toISOString().split("T")[0];

console.log("\n🎯 Key dates analysis:");
console.log(
  "Today (Aug 20):",
  today.toLocaleDateString("en-US", { weekday: "long" }),
  "- Day of week:",
  today.getDay()
);
console.log(
  "Yesterday (Aug 19):",
  yesterday.toLocaleDateString("en-US", { weekday: "long" }),
  "- Day of week:",
  yesterday.getDay()
);

// Find these dates in grid
const todayInGrid = gridDays.find((d) => d.date === todayStr);
const yesterdayInGrid = gridDays.find((d) => d.date === yesterdayStr);

console.log("\n📊 Grid positions:");
if (yesterdayInGrid) {
  const headers = ["S", "M", "T", "W", "T", "F", "S"];
  console.log("Aug 19 (Tuesday) in grid:");
  console.log("  Position:", yesterdayInGrid.gridPosition);
  console.log("  Week:", yesterdayInGrid.week);
  console.log("  Day in week:", yesterdayInGrid.dayInWeek);
  console.log("  Grid header:", headers[yesterdayInGrid.dayInWeek]);
  console.log("  Actual day:", headers[yesterdayInGrid.dayOfWeek]);
  console.log(
    "  Correct alignment:",
    headers[yesterdayInGrid.dayInWeek] === headers[yesterdayInGrid.dayOfWeek]
  );
}

if (todayInGrid) {
  const headers = ["S", "M", "T", "W", "T", "F", "S"];
  console.log("\nAug 20 (Wednesday) in grid:");
  console.log("  Position:", todayInGrid.gridPosition);
  console.log("  Week:", todayInGrid.week);
  console.log("  Day in week:", todayInGrid.dayInWeek);
  console.log("  Grid header:", headers[todayInGrid.dayInWeek]);
  console.log("  Actual day:", headers[todayInGrid.dayOfWeek]);
  console.log(
    "  Correct alignment:",
    headers[todayInGrid.dayInWeek] === headers[todayInGrid.dayOfWeek]
  );
}

// Check if we're off by one
console.log("\n🔍 Off-by-one check:");
console.log("Grid days around Aug 19-20:");
for (let i = 0; i < gridDays.length; i++) {
  const day = gridDays[i];
  if (day.date === yesterdayStr || day.date === todayStr) {
    const headers = ["S", "M", "T", "W", "T", "F", "S"];
    console.log(
      `${day.date}: Grid pos ${i}, Week ${day.week}, Day ${day.dayInWeek} (${
        headers[day.dayInWeek]
      }), Actual ${day.dayOfWeek} (${headers[day.dayOfWeek]})`
    );
  }
}
