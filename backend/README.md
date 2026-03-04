# Momentum Backend

Backend server for the Momentum productivity app with Google OAuth authentication.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Cloud Console project with OAuth 2.0 credentials

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/momentum`

**Option B: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
   - Copy the Client ID and Client Secret

### 4. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# Session
SESSION_SECRET=your-random-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend URL (update this based on how you serve your frontend)
FRONTEND_URL=http://localhost:3000
# or for file:// protocol: http://127.0.0.1:5500
```

### 5. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/user` - Get current user
- `GET /auth/logout` - Logout

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `PUT /api/goals/:goalId/steps/:stepId` - Toggle step

### Focus Tasks
- `GET /api/focus-tasks` - Get all tasks
- `POST /api/focus-tasks` - Create task
- `PUT /api/focus-tasks/:id` - Update task
- `DELETE /api/focus-tasks/:id` - Delete task

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event(s)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Testing

Test the API using:
- Browser: Visit `http://localhost:5000`
- Postman or Thunder Client
- cURL commands

## Troubleshooting

**MongoDB Connection Issues:**
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check network access settings in MongoDB Atlas

**Google OAuth Issues:**
- Verify redirect URI matches exactly in Google Console
- Check that Google+ API is enabled
- Ensure credentials are correct in `.env`

**CORS Issues:**
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- For local files, use `http://127.0.0.1:5500` or your local server port
