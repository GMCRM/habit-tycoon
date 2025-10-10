# Admin Portal Setup

## Overview
The admin portal provides exclusive access to all testing and debugging tools for the Habit Tycoon app. Access is restricted to the admin email address only.

## Admin Access
- **Admin Email:** `grantmatai@gmail.com`
- **Portal URL:** `/admin`
- **Access Method:** Shield icon in the header (visible only when logged in as admin)

## Features Included in Admin Portal

### User Profile Management
- View complete user profile data
- Force create/fix user profiles
- Delete account (with confirmation)
- Refresh profile data
- Check all profiles in database

### Database & Auth Testing
- Test database connection
- Test authentication system
- View session information
- Run all tests at once

### Habit Business Debugging
- Debug habit business status
- View completion records and streaks
- Test reset outdated habits function
- Emergency cleanup of habit duplicates
- Debug specific habit state with timezone info

### Stock & Dividend Testing
- Test dividend processing system
- Add $1,000,000 test money for purchases
- Fix stock prices
- Fix lemonade stock prices
- View dividend debug information

### Security Implementation
1. **Admin Guard** (`src/app/guards/admin.guard.ts`)
   - Checks if logged-in user matches admin email
   - Redirects non-admin users to home page
   - Logs all access attempts

2. **Admin Service** (`src/app/services/admin.service.ts`)
   - Provides `isAdmin()` method to check admin status
   - Used throughout app to show/hide admin features

3. **Route Protection** (`src/app/app.routes.ts`)
   - Admin route uses `canActivate: [adminGuard]`
   - Prevents direct URL access by non-admin users

4. **UI Conditional Display** (`src/app/home/home.page.html`)
   - Admin button only visible when `isAdmin` is true
   - Shield icon distinguishes admin access

## Usage

### As Admin (grantmatai@gmail.com):
1. Log in to the app
2. Click the yellow "Admin" button (with shield icon) in the header
3. Access all testing and debugging tools

### As Regular User:
- Admin button is not visible
- Cannot access `/admin` route (redirected to home)
- No indication of admin portal existence

## File Structure
```
src/app/
├── guards/
│   └── admin.guard.ts          # Route guard for admin access
├── services/
│   └── admin.service.ts        # Admin status checking service
├── dev-tools/
│   ├── dev-tools.page.ts       # Admin portal logic
│   └── dev-tools.page.html     # Admin portal UI (renamed to "Admin Portal")
├── app.routes.ts               # Routes with admin protection
└── home/
    ├── home.page.ts            # Includes admin check and button
    └── home.page.html          # Shows admin button when authorized
```

## Notes
- All testing features that were previously in `/dev-tools` are now in `/admin`
- The old `/dev-tools` route has been replaced with `/admin`
- Only the admin email can see or access any admin-related features
- Non-admin users have no indication that the admin portal exists
