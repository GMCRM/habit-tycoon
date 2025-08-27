# Mobile Habit Grid Test Guide

## Test the Mobile Responsive Habit Grid

### What Changed:

- **Desktop (768px+)**: Shows full calendar year (12 months) as before
- **Mobile (≤768px)**: Shows only 3 months with current month centered
  - 1 month before current month
  - Current month (center)
  - 1 month after current month

### How to Test:

1. **Open the app**: Navigate to http://localhost:8101
2. **Go to Stocks page**: Use bottom navigation
3. **View Available Stocks or Portfolio**: Both tabs show habit grids

### Testing Different Screen Sizes:

#### Desktop Testing (≥769px):

- Habit grid should show full year (12 months)
- All month labels visible (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
- Wide grid container (min-width: 800px)

#### Mobile Testing (≤768px):

1. **Browser Dev Tools Method**:
   - Open Chrome DevTools (F12)
   - Click Device Toggle (Ctrl+Shift+M)
   - Select iPhone, iPad, or set custom width to 375px
2. **Resize Browser Window**:
   - Make browser window narrow (≤768px wide)
3. **Expected Mobile Behavior**:
   - Only 3 months visible in habit grid
   - Current month should be in the center
   - If current month is August:
     - Should see: **July**, **August**, **September**
   - Smaller grid cells (10px instead of 12px)
   - Very compact container (min-width: 250px instead of 800px)
   - Smaller month labels (9px font-size)

### Current Month Centering Logic:

- **1 month before**: Current month - 1
- **Current month**: The center month
- **1 month after**: Current month + 1

### Example for August 2025:

- **Desktop**: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
- **Mobile**: **Jul**, **Aug**, **Sep**

### Visual Indicators:

- Grid cells should be smaller on mobile
- Month labels should be smaller
- Overall grid width should be more compact
- Should fit better in mobile viewport without excessive horizontal scrolling

### Screen Size Detection:

- The component listens for window resize events
- Automatically switches between desktop/mobile layouts
- No page refresh needed when resizing
