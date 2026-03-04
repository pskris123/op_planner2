# 🚀 Momentum Backend - Quick Reference

## Start the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```
Expected output:
```
✅ MongoDB Connected: cluster0.mongodb.net
🚀 Server running on port 5000
```

### 2. Serve Frontend
Choose one:
```bash
# VS Code Live Server (recommended)
Right-click index.html → "Open with Live Server"

# OR Python
python -m http.server 3000

# OR Node.js
npx http-server -p 3000
```

## First-Time Setup Checklist

- [ ] Install MongoDB (Atlas or local)
- [ ] Create Google OAuth credentials
- [ ] Update `backend/.env` with:
  - `MONGODB_URI`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `FRONTEND_URL`
- [ ] Run `npm install` in backend folder
- [ ] Start backend server
- [ ] Serve frontend
- [ ] Test login

## Environment Variables

Edit `backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/momentum

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend
FRONTEND_URL=http://127.0.0.1:5500
```

## Common Issues

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### MongoDB connection failed
- Check connection string format
- Verify database user password
- Whitelist IP in MongoDB Atlas

### Google OAuth error
- Verify redirect URI: `http://localhost:5000/auth/google/callback`
- Check Client ID and Secret
- Ensure Google+ API is enabled

### CORS error
- Match `FRONTEND_URL` exactly (including port)
- Restart backend after changing `.env`

## File Structure

```
Momentum/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── api.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── index.html
├── styles.css
├── auth-styles.css
├── script.js
├── api-integration.js
├── api-render.js
├── SETUP_GUIDE.md
└── INTEGRATION_GUIDE.md
```

## API Endpoints

Base URL: `http://localhost:5000`

### Auth
- `GET /auth/google` - Login
- `GET /auth/user` - Current user
- `GET /auth/logout` - Logout

### Goals
- `GET /api/goals` - List
- `POST /api/goals` - Create
- `PUT /api/goals/:id` - Update
- `DELETE /api/goals/:id` - Delete

### Tasks
- `GET /api/focus-tasks` - List
- `POST /api/focus-tasks` - Create
- `PUT /api/focus-tasks/:id` - Update
- `DELETE /api/focus-tasks/:id` - Delete

### Events
- `GET /api/events` - List
- `POST /api/events` - Create
- `PUT /api/events/:id` - Update
- `DELETE /api/events/:id` - Delete

## Testing

1. Open frontend in browser
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Create a goal with steps
5. Create a focus task
6. Create a calendar event
7. Refresh page - data persists!
8. Logout and login - data still there!

## Next Steps

- [ ] Test all features locally
- [ ] Deploy backend (Heroku/Railway/Render)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Update production environment variables
- [ ] Set up custom domain (optional)

## Support

- Backend README: `backend/README.md`
- Setup Guide: `SETUP_GUIDE.md`
- Integration Guide: `INTEGRATION_GUIDE.md`
- Walkthrough: See artifacts
