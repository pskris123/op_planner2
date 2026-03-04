# 🚀 Quick Start Guide - Momentum Backend Setup

## Step 1: Install MongoDB
(Already setup)

## Step 2: Set Up Supabase Auth
1. Go to https://supabase.com/ and create a new project.
2. Go to "Authentication" -> "Providers" and enable "Google".
3. Configure the Google Provider with your Google Client ID and Secret.
4. Set "Site URL" to `http://localhost:8080` and add `http://localhost:8080/**` to "Redirect URIs" in Supabase -> Authentication -> Settings.
5. Add the following redirect URI to your Google Cloud Console: `https://<your-project-id>.supabase.co/auth/v1/callback`
5. **Copy the Project URL, Anon Key, and Service Role Key** from "Project Settings" -> "API".

## Step 3: Configure Environment Variables
1. Open `backend/.env` file.
2. Update these values:
```env
MONGODB_URI=your-mongodb-connection-string
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

## Step 4: Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

## Step 5: Serve the Frontend
```bash
# In the Momentum folder
npx http-server -p 8080
```

## Troubleshooting
- **"Supabase is not initialized"**: Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correctly set in `api-integration.js` (or move them to a config file/use build tools if applicable).
- **"Invalid token"**: Ensure the `Authorization` header is being sent correctly in `api-integration.js`.
