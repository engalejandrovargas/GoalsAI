# Google OAuth Credentials Setup

## After getting your credentials from Google Cloud Console:

### 1. Update backend/.env:
```bash
GOOGLE_CLIENT_ID="your_actual_client_id_here"
GOOGLE_CLIENT_SECRET="your_actual_client_secret_here"
```

### 2. Update frontend/.env:
```bash
VITE_GOOGLE_CLIENT_ID="your_actual_client_id_here"
```

### 3. Restart both servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 4. Test the flow:
- Visit: http://localhost:5173
- Click "Continue with Google"
- Sign in with your Google account
- Should redirect to dashboard or onboarding

## Important Notes:
- Keep your Client Secret private - never commit it to version control
- The redirect URI must exactly match: http://localhost:5001/auth/google/callback
- JavaScript origins must include: http://localhost:5173

## Troubleshooting:
If you get "redirect_uri_mismatch" error:
1. Check the redirect URI in Google Cloud Console
2. Make sure it's exactly: http://localhost:5001/auth/google/callback
3. No trailing slash, correct port number

If you get CORS errors:
1. Make sure JavaScript origins includes: http://localhost:5173
2. Clear browser cache and cookies