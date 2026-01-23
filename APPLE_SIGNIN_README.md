# Apple Sign-In Implementation

This implementation adds Apple Sign-In functionality to the NHD application, allowing users to authenticate using their Apple ID.

## Prerequisites

1. **Apple Developer Account**: You need an active Apple Developer account to set up Apple Sign-In.
2. **Service ID**: Create a Service ID in your Apple Developer account for web authentication.

## Apple Developer Console Setup

### 1. Create an App ID (if you don't have one)
- Go to [Apple Developer Console](https://developer.apple.com/account/)
- Navigate to "Certificates, Identifiers & Profiles"
- Click on "Identifiers" and create a new App ID
- Enable "Sign In with Apple" capability

### 2. Create a Service ID
- In the same "Identifiers" section, create a new Service ID
- This will be used as your `client_id` for web authentication
- Enable "Sign In with Apple" for this Service ID
- Configure the domains and return URLs:
  - Primary App Domain: `nawahomeofdates.com` (your domain)
  - Return URLs: 
    - `https://www.nawahomeofdates.com/auth/apple/callback` (production)
    - `https://localhost:3000/auth/apple/callback` (development)

### 3. Create a Private Key
- Go to "Keys" section in Apple Developer Console
- Create a new key and enable "Sign In with Apple"
- Download the `.p8` file (keep it secure!)
- Note the Key ID

## Configuration

### Frontend Configuration
Update the environment variables in your `.env` files:

**Development (.env.development):**
```env
REACT_APP_APPLE_CLIENT_ID=com.nawa.service-id
REACT_APP_APPLE_REDIRECT_URI=https://localhost:3000/auth/apple/callback
```

**Production (.env.production):**
```env
REACT_APP_APPLE_CLIENT_ID=com.nawa.service-id
REACT_APP_APPLE_REDIRECT_URI=https://www.nawahomeofdates.com/auth/apple/callback
```

### Backend Configuration (Optional - for token verification)
If you want to verify Apple tokens on the backend, add to `appsettings.json`:

```json
{
  "Apple": {
    "ClientId": "com.nawa.service-id",
    "TeamId": "YOUR_TEAM_ID",
    "KeyId": "YOUR_KEY_ID",
    "PrivateKey": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----"
  }
}
```

## How It Works

### Frontend Flow
1. User clicks "Login with Apple" button
2. Apple Sign-In SDK opens authentication popup
3. User authenticates with Apple
4. Apple returns identity token and user information
5. Frontend sends this data to backend API
6. Backend creates/authenticates user and returns JWT token

### Backend Flow
1. Receives Apple authentication data
2. Extracts user information from Apple's identity token
3. Checks if user exists by email
4. If new user: creates account and auto-verifies (since Apple verified email)
5. If existing user: updates Apple ID if not set
6. Returns JWT token for application authentication

## Database Changes

No database changes are required! The implementation uses the existing `ProviderId` field in the `Customer` table to store the unique Apple user identifier.

## API Endpoints

### POST /api/Customer/LoginWithApple
Handles Apple Sign-In authentication.

**Request Body:**
```json
{
  "identityToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjhOSFp4bHp...",
  "authCode": "c1234567890abcdef...",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@privaterelay.appleid.com",
  "providerId": ""
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "john.doe@privaterelay.appleid.com",
    "fullName": "John Doe"
  },
  "message": "Apple login successful"
}
```

## Security Features

1. **Email Verification**: Apple users are automatically verified since Apple has already verified their email
2. **Privacy**: Supports Apple's private relay email addresses
3. **Token Validation**: Identity tokens can be validated against Apple's public keys
4. **Secure Storage**: Apple ID is stored securely in the database

## Testing

1. **Development**: Use localhost URLs in Apple Developer Console
2. **HTTPS Required**: Apple Sign-In requires HTTPS even in development
3. **Domain Verification**: Make sure your domain is properly configured in Apple Developer Console

## Deployment Notes

1. Update Service ID configuration in Apple Developer Console with production URLs
2. Ensure HTTPS is properly configured
3. Update environment variables for production
4. Test the complete flow in production environment

## Troubleshooting

### Common Issues:
1. **"invalid_client" error**: Check Service ID configuration and client_id
2. **"redirect_uri_mismatch"**: Verify return URLs in Service ID configuration  
3. **Popup blocked**: User needs to allow popups for Apple Sign-In
4. **Network errors**: Check CORS and HTTPS configuration

### Debug Tips:
- Check browser console for JavaScript errors
- Verify Apple Developer Console configuration
- Test with Apple's validation tools
- Check server logs for API errors

## Files Modified/Created

### Backend:
- `NHD.Core/Services/Model/Customer/AppleLoginModel.cs` (new)
- `NHD.Core/Services/Customers/ICustomerService.cs` (modified)
- `NHD.Core/Services/Customers/CustomerService.cs` (modified)
- `NHD.Core/Models/Customer.cs` (modified - added AppleId field)
- `NHD.Web.UI/Controllers/Website/CustomerController.cs` (modified)

### Frontend:
- `ClientApp.Web/src/api/common/AppleSignIn.ts` (new)
- `ClientApp.Web/src/api/base/apiUrls.ts` (modified)
- `ClientApp.Web/src/pages/Auth/Login.tsx` (modified)
- `.env.development` (modified)
- `.env.production` (modified)

## Next Steps

1. Set up Apple Developer Console as described above
2. Replace placeholder Service ID with your actual Service ID
3. Test the implementation in development
4. Deploy and test in production
5. Consider adding Google Sign-In for complete social login support