# Google Sign-In Implementation

This implementation adds Google Sign-In functionality to the NHD application, allowing users to authenticate using their Google account.

## Prerequisites

1. **Google Cloud Console Account**: You need access to Google Cloud Console to set up OAuth 2.0 credentials.
2. **OAuth 2.0 Client ID**: Create OAuth 2.0 credentials for web authentication.

## Google Cloud Console Setup

### 1. Create a New Project (if needed)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one

### 2. Enable Google Identity Services
- Go to "APIs & Services" > "Library"
- Search for "Google Identity" and enable it
- Also enable "Google+ API" if you need additional user profile information

### 3. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Choose "External" user type (unless you have Google Workspace)
- Fill in required information:
  - App name: "Nawa Home of Dates"
  - User support email: your email
  - Authorized domains: `nawahomeofdates.com`
  - Developer contact information: your email
- Add scopes: email, profile, openid

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- Choose "Web application"
- Configure:
  - Name: "NHD Web Client"
  - Authorized JavaScript origins:
    - `https://www.nawahomeofdates.com` (production)
    - `https://localhost:3000` (development)
  - Authorized redirect URIs:
    - `https://www.nawahomeofdates.com` (production)
    - `https://localhost:3000` (development)
- Download the credentials JSON file

## Configuration

### Frontend Configuration
Update the environment variables in your `.env` files:

**Development (.env.development):**
```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
```

**Production (.env.production):**
```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
```

## How It Works

### Frontend Flow
1. User clicks "Login with Google" button
2. Google Identity Services library loads and prompts user authentication
3. User authenticates with Google and grants permissions
4. Google returns an ID token containing user information
5. Frontend parses the JWT token to extract user details
6. Frontend sends the token and user data to backend API
7. Backend creates/authenticates user and returns JWT token

### Backend Flow
1. Receives Google authentication data including ID token
2. Extracts user information from the token payload
3. Checks if user exists by email address
4. If new user: creates account and auto-verifies (since Google verified email)
5. If existing user: updates ProviderId if not set
6. Returns JWT token for application authentication

## Security Features

1. **JWT Token Verification**: ID tokens from Google are parsed and validated
2. **Email Verification**: Google users are automatically verified since Google has verified their email
3. **Unique Provider ID**: Google's unique user ID is stored in ProviderId field
4. **Secure Integration**: Uses official Google Identity Services library

## API Endpoints

### POST /api/Customer/LoginWithGoogle
Handles Google Sign-In authentication.

**Request Body:**
```json
{
  "idToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6...",
  "accessToken": "",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "providerId": "1234567890123456789",
  "picture": "https://lh3.googleusercontent.com/a/photo.jpg"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "john.doe@gmail.com",
    "fullName": "John Doe"
  },
  "message": "Google login successful"
}
```

## Testing

### Development Testing
1. Set up OAuth credentials with localhost:3000 as authorized origin
2. Update REACT_APP_GOOGLE_CLIENT_ID with your development client ID
3. Test the login flow in development environment

### Production Testing
1. Update OAuth credentials with your production domain
2. Deploy with production client ID
3. Test the complete authentication flow

## Integration with Existing System

- **Uses ProviderId Field**: Leverages existing ProviderId column in Customer table
- **No Database Changes**: No additional database migrations required
- **Consistent Architecture**: Follows same pattern as Apple Sign-In
- **JWT Compatible**: Integrates seamlessly with existing JWT authentication

## Files Created/Modified

### Backend:
- `NHD.Core/Services/Model/Customer/GoogleLoginModel.cs` (new)
- `NHD.Core/Services/Customers/ICustomerService.cs` (modified)
- `NHD.Core/Services/Customers/CustomerService.cs` (modified)
- `NHD.Web.UI/Controllers/Website/CustomerController.cs` (modified)

### Frontend:
- `ClientApp.Web/src/api/common/GoogleSignIn.ts` (new)
- `ClientApp.Web/src/api/base/apiUrls.ts` (modified)
- `ClientApp.Web/src/pages/Auth/Login.tsx` (modified)
- `.env.development` (modified)
- `.env.production` (modified)

## Next Steps

1. Set up Google Cloud Console project as described above
2. Create OAuth 2.0 credentials for web application
3. Replace placeholder client ID with your actual Google client ID
4. Test the implementation in development environment
5. Configure production credentials and deploy
6. Consider implementing refresh token handling for long-lived sessions

## Troubleshooting

### Common Issues:
1. **"Invalid client" error**: Check that client ID is correct and matches environment
2. **"Unauthorized origin"**: Verify authorized JavaScript origins in Google Cloud Console
3. **"Access blocked"**: Check OAuth consent screen configuration and verification status
4. **Popup blocked**: Ensure popups are allowed for Google authentication

### Debug Tips:
- Check browser console for JavaScript errors
- Verify Google Cloud Console project configuration
- Test with incognito mode to avoid cached authentication
- Check network tab for API request/response details
- Ensure HTTPS is used even in development (required by Google)

## Benefits

- **No Database Changes**: Uses existing ProviderId field
- **Modern Implementation**: Uses latest Google Identity Services
- **Secure**: Follows Google's recommended authentication flow
- **User Friendly**: One-click authentication for Google users
- **Scalable**: Can easily extend to support additional OAuth providers