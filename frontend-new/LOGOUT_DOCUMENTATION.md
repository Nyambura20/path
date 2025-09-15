# Logout Functionality Documentation

## Overview
The logout functionality has been integrated with both the frontend React application and the Django backend. Users can log out through the navigation menu, which redirects them to a dedicated logout page that handles the logout process gracefully.

## Frontend Implementation

### Logout Page (`/src/pages/Logout.js`)
- **Route:** `/logout`
- **Features:**
  - Displays loading spinner while logging out
  - Shows success message after logout
  - Provides navigation options to home page or login
  - Automatic redirect to home page after 2 seconds
  - Thank you message for better user experience
  - Dark theme compatible

### Navigation Integration
- **Location:** User dropdown menu in Navbar
- **Behavior:** "Sign Out" link redirects to `/logout` page
- **Styling:** Updated for dark theme with proper hover effects

### Authentication Context
- **Logout Method:** Calls backend API and clears local storage
- **Token Management:** Removes both access and refresh tokens
- **State Management:** Updates authentication state and user data

## Backend Implementation

### Logout Endpoint
- **URL:** `POST /api/users/logout/`
- **Authentication:** Required (IsAuthenticated)
- **Function:** Blacklists the provided refresh token
- **Response:** Success message

### JWT Token Handling
- **Blacklisting:** Uses `rest_framework_simplejwt` token blacklisting
- **Security:** Properly invalidates refresh tokens
- **Session Management:** Calls Django's logout function

## User Experience Flow

1. **User clicks "Sign Out"** in the navigation dropdown
2. **Redirected to `/logout` page** with loading spinner
3. **Backend API call** to logout endpoint with refresh token
4. **Token blacklisting** occurs on the server
5. **Local storage cleared** on the frontend
6. **Success message displayed** with navigation options
7. **Automatic redirect** to home page after 2 seconds

## Dark Theme Integration
- Background: Dark charcoal (`darkbg-900`)
- Text: Light gray for readability
- Accent: Green primary color for branding
- Loading spinner: Consistent with theme
- Buttons: Styled with dark theme classes

## Security Features
- **Token Invalidation:** Refresh tokens are blacklisted on logout
- **Local Storage Cleanup:** All authentication data removed
- **Protected Endpoint:** Logout requires valid authentication
- **Error Handling:** Graceful handling of logout errors

## Testing
- Frontend accessible at: `http://localhost:3000`
- Backend API at: `http://127.0.0.1:8000/api/users/logout/`
- Navigation flow works from any authenticated page
- Proper error handling and user feedback

## Future Enhancements
- Mobile responsive logout page
- Session timeout handling
- Multiple device logout functionality
- Logout confirmation dialog (optional)
