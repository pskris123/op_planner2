# 🎯 Frontend-Backend Integration Guide

## Overview

Your Momentum app now has two modes of operation:

1. **Backend Mode** (Recommended): Uses Google Authentication + MongoDB for data persistence
2. **Standalone Mode**: Uses localStorage (original functionality)

## Files Added/Modified

### New Files
- `backend/` - Complete Node.js backend with Express and MongoDB
- `api-integration.js` - API service layer and authentication management
- `api-render.js` - Render functions that work with API data
- `auth-styles.css` - Styles for authentication UI
- `SETUP_GUIDE.md` - Step-by-step setup instructions

### Modified Files
- `index.html` - Added authentication UI and API scripts
- `script.js` - Original file (still used for planner rendering)

## How It Works

### Authentication Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. User approves access
4. Redirected back to app
5. Session created, user data loaded from MongoDB

### Data Flow
- **Before**: Data stored in browser localStorage
- **After**: Data stored in MongoDB, synced across devices
- API calls use `credentials: 'include'` for session cookies

## Running the App

### Option 1: With Backend (Full Features)

1. **Start MongoDB** (Atlas or local)
2. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Serve Frontend** (choose one):
   - VS Code Live Server (port 5500)
   - `python -m http.server 3000`
   - `npx http-server -p 3000`

4. **Update backend/.env**:
   ```env
   FRONTEND_URL=http://127.0.0.1:5500  # or your frontend URL
   ```

### Option 2: Standalone (No Backend)

Just open `index.html` in a browser. The app will work with localStorage.

## Key Features

### With Backend
✅ Google Authentication
✅ Data synced across devices
✅ Secure data storage in MongoDB
✅ Multi-user support
✅ Session management

### Without Backend
✅ All features work locally
✅ No login required
✅ Data in browser only
✅ Single device

## Troubleshooting

### "Please log in" messages
- Backend is not running
- Not authenticated
- Session expired

### CORS errors
- Check `FRONTEND_URL` in `backend/.env`
- Must match exactly (including port)
- Restart backend after changing .env

### Data not saving
- Check browser console for errors
- Verify backend is running
- Check MongoDB connection

## API Endpoints Reference

All endpoints require authentication (except /auth/google).

### Authentication
- `GET /auth/google` - Initiate login
- `GET /auth/user` - Get current user
- `GET /auth/logout` - Logout

### Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Focus Tasks
- `GET /api/focus-tasks` - List tasks
- `POST /api/focus-tasks` - Create task
- `PUT /api/focus-tasks/:id` - Update task
- `DELETE /api/focus-tasks/:id` - Delete task

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event(s)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Configure MongoDB (Atlas recommended)
3. ✅ Update backend/.env with your credentials
4. ✅ Start backend server
5. ✅ Serve frontend
6. ✅ Test login and data persistence
7. 🚀 Deploy to production (optional)

## Deployment Options

- **Backend**: Heroku, Railway, Render, Fly.io
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas (free tier available)

Remember to update environment variables for production!
