// Check January 1, 2025 alignment
const jan1 = new Date(2025, 0, 1);
console.log(
  "January 1, 2025:",
  jan1.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log(
  "Day of week:",
  jan1.getDay(),
  "(0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)"
);

// Current logic: subtract day of week
const startDayOfWeek = jan1.getDay(); // 3 (Wednesday)
const adjustedStartDate = new Date(
  jan1.getFullYear(),
  jan1.getMonth(),
  jan1.getDate() - startDayOfWeek
);
console.log(
  "\nCurrent adjusted start date:",
  adjustedStartDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("Day of week:", adjustedStartDate.getDay());

// The problem: December 29, 2024 is Saturday (6), not Sunday (0)
// We need to start from the Sunday BEFORE January 1, which is December 30, 2024

// Correct logic: find the Sunday of the week containing January 1
const correctedStart = new Date(jan1);
correctedStart.setDate(
  jan1.getDate() - jan1.getDay() + (jan1.getDay() === 0 ? 0 : 7)
); // Move to next Sunday if not already Sunday
correctedStart.setDate(correctedStart.getDate() - 7); // Then go back one week to get the Sunday before

console.log(
  "\nCorrected start date:",
  correctedStart.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("Day of week:", correctedStart.getDay());

// Actually, let's try a simpler approach: just ensure we start on a Sunday
const simpleStart = new Date(jan1);
const daysBack = jan1.getDay() === 0 ? 0 : jan1.getDay(); // If Sunday, go back 0 days, otherwise go back to previous Sunday
simpleStart.setDate(jan1.getDate() - daysBack);
if (simpleStart.getDay() !== 0) {
  simpleStart.setDate(simpleStart.getDate() - 7); // Go back one more week
}

console.log(
  "\nSimple approach:",
  simpleStart.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
);
console.log("Day of week:", simpleStart.getDay());
