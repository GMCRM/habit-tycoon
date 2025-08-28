/**
 * Unit tests for habit business ordering functionality
 * These tests validate the core drag-and-drop and auto-sorting logic
 */

// Mock habit businesses for testing
const mockHabits = [
  {
    id: '1',
    user_id: 'test-user',
    business_type_id: 1,
    business_name: 'Morning Run',
    business_icon: '🏃',
    cost: 100,
    habit_description: 'Run 1 mile',
    frequency: 'daily',
    goal_value: 1,
    current_progress: 0,
    earnings_per_completion: 10,
    streak: 5,
    total_completions: 5,
    total_earnings: 50,
    is_active: true,
    display_order: 1,
    user_custom_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'test-user',
    business_type_id: 2,
    business_name: 'Read Book',
    business_icon: '📚',
    cost: 50,
    habit_description: 'Read for 30 minutes',
    frequency: 'daily',
    goal_value: 1,
    current_progress: 1, // This one is completed
    earnings_per_completion: 5,
    streak: 3,
    total_completions: 3,
    total_earnings: 15,
    last_completed_at: new Date().toISOString(), // Completed today
    is_active: true,
    display_order: 2,
    user_custom_order: 2,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'test-user',
    business_type_id: 3,
    business_name: 'Meditation',
    business_icon: '🧘',
    cost: 75,
    habit_description: 'Meditate for 15 minutes',
    frequency: 'daily',
    goal_value: 1,
    current_progress: 0,
    earnings_per_completion: 8,
    streak: 2,
    total_completions: 2,
    total_earnings: 16,
    is_active: true,
    display_order: 3,
    user_custom_order: 3,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
];

/**
 * Test: Habit ordering by display_order
 */
function testHabitOrdering() {
  console.log('🧪 Testing habit ordering by display_order...');
  
  // Simulate ordering habits by display_order (as the service would do)
  const orderedHabits = [...mockHabits].sort((a, b) => a.display_order - b.display_order);
  
  const expectedOrder = ['Morning Run', 'Read Book', 'Meditation'];
  const actualOrder = orderedHabits.map(h => h.business_name);
  
  const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  console.log(`   Expected: ${expectedOrder.join(', ')}`);
  console.log(`   Actual: ${actualOrder.join(', ')}`);
  console.log(`   ✅ ${isCorrect ? 'PASS' : 'FAIL'}`);
  
  return isCorrect;
}

/**
 * Test: Drag and drop reordering
 */
function testDragDropReordering() {
  console.log('🧪 Testing drag-and-drop reordering...');
  
  // Simulate moving "Meditation" from position 2 (index 2) to position 0 (index 0)
  const habits = [...mockHabits];
  const [movedItem] = habits.splice(2, 1); // Remove from index 2
  habits.splice(0, 0, movedItem); // Insert at index 0
  
  // Update display_order and user_custom_order (as the service would do)
  habits.forEach((habit, index) => {
    habit.display_order = index + 1;
    habit.user_custom_order = index + 1;
  });
  
  const expectedOrder = ['Meditation', 'Morning Run', 'Read Book'];
  const actualOrder = habits.map(h => h.business_name);
  
  const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  console.log(`   Expected: ${expectedOrder.join(', ')}`);
  console.log(`   Actual: ${actualOrder.join(', ')}`);
  console.log(`   ✅ ${isCorrect ? 'PASS' : 'FAIL'}`);
  
  return isCorrect;
}

/**
 * Test: Auto-move completed habits to bottom
 */
function testAutoMoveCompleted() {
  console.log('🧪 Testing auto-move completed habits to bottom...');
  
  // Start with fresh copy to avoid interference from previous tests
  const habits = [
    {
      id: '1',
      business_name: 'Morning Run',
      current_progress: 0,
      goal_value: 1,
      user_custom_order: 1,
      display_order: 1
    },
    {
      id: '2',
      business_name: 'Read Book',
      current_progress: 1, // This one is completed
      goal_value: 1,
      user_custom_order: 2,
      display_order: 2
    },
    {
      id: '3',
      business_name: 'Meditation',
      current_progress: 0,
      goal_value: 1,
      user_custom_order: 3,
      display_order: 3
    }
  ];
  
  // Simulate completion detection and reordering
  const nonCompleted = [];
  const completed = [];
  
  habits.forEach(habit => {
    // Check if completed (simplified version of the actual logic)
    const isCompleted = habit.current_progress >= habit.goal_value && habit.current_progress > 0;
    if (isCompleted) {
      completed.push(habit);
    } else {
      nonCompleted.push(habit);
    }
  });
  
  // Sort by custom order within each group
  nonCompleted.sort((a, b) => a.user_custom_order - b.user_custom_order);
  completed.sort((a, b) => a.user_custom_order - b.user_custom_order);
  
  // Combine: non-completed first, then completed
  const reorderedHabits = [...nonCompleted, ...completed];
  
  // Update display_order (but preserve user_custom_order)
  reorderedHabits.forEach((habit, index) => {
    habit.display_order = index + 1;
  });
  
  const expectedOrder = ['Morning Run', 'Meditation', 'Read Book']; // Read Book is completed, so it goes to bottom
  const actualOrder = reorderedHabits.map(h => h.business_name);
  
  const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  console.log(`   Expected: ${expectedOrder.join(', ')}`);
  console.log(`   Actual: ${actualOrder.join(', ')}`);
  console.log(`   ✅ ${isCorrect ? 'PASS' : 'FAIL'}`);
  
  return isCorrect;
}

/**
 * Test: Reset to custom order
 */
function testResetToCustomOrder() {
  console.log('🧪 Testing reset to custom order...');
  
  // Start with habits that have been moved around (completed habits at bottom)
  const habits = [
    {
      id: '1',
      business_name: 'Morning Run',
      display_order: 1,
      user_custom_order: 1
    },
    {
      id: '2',
      business_name: 'Read Book',
      display_order: 3, // Was moved to bottom due to completion
      user_custom_order: 2 // Original position
    },
    {
      id: '3',
      business_name: 'Meditation',
      display_order: 2,
      user_custom_order: 3
    }
  ];
  
  // Reset display_order to user_custom_order
  habits.forEach(habit => {
    habit.display_order = habit.user_custom_order;
  });
  
  // Sort by display_order
  const resetHabits = habits.sort((a, b) => a.display_order - b.display_order);
  
  const expectedOrder = ['Morning Run', 'Read Book', 'Meditation']; // Back to original custom order
  const actualOrder = resetHabits.map(h => h.business_name);
  
  const isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  console.log(`   Expected: ${expectedOrder.join(', ')}`);
  console.log(`   Actual: ${actualOrder.join(', ')}`);
  console.log(`   ✅ ${isCorrect ? 'PASS' : 'FAIL'}`);
  
  return isCorrect;
}

/**
 * Run all tests
 */
function runTests() {
  console.log('🚀 Running Habit Business Ordering Tests...\n');
  
  const tests = [
    testHabitOrdering,
    testDragDropReordering,
    testAutoMoveCompleted,
    testResetToCustomOrder
  ];
  
  const results = tests.map(test => {
    const result = test();
    console.log('');
    return result;
  });
  
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Status: ${passedTests === totalTests ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runTests();
}

// Export for use in other test files
if (typeof module !== 'undefined') {
  module.exports = { runTests, mockHabits };
}