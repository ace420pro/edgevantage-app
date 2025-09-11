# EdgeVantage Deployment Guide

## Current Setup
- **Frontend Domain**: www.edgevantagepro.com (via Vercel)
- **Backend**: Needs to be deployed to Vercel
- **Database**: MongoDB Atlas

## Step 1: Deploy Backend to Vercel

### 1.1 Login to Vercel CLI
```bash
vercel login
```

### 1.2 Deploy Backend
```bash
cd backend
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No** (create new)
- Project name? **edgevantage-backend**
- Directory? **./backend**

### 1.3 Note Your Backend URL
After deployment, you'll receive a URL like:
```
https://edgevantage-backend-xxxxx.vercel.app
```

## Step 2: Configure Backend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **edgevantage-backend** project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string from MongoDB Atlas |
| `FRONTEND_URL` | https://www.edgevantagepro.com |

## Step 3: Configure Frontend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **frontend project** (connected to www.edgevantagepro.com)
3. Go to **Settings** → **Environment Variables**
4. Add:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | https://edgevantage-backend-xxxxx.vercel.app |

Replace `xxxxx` with your actual backend URL from Step 1.3

## Step 4: Redeploy Frontend

```bash
cd .. # Go back to root directory
vercel --prod
```

Or trigger a redeployment from the Vercel dashboard.

## Step 5: Test Your Application

1. Visit www.edgevantagepro.com
2. Fill out the application form
3. Submit and verify it works without errors
4. Check MongoDB Atlas to confirm the data was saved

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
FRONTEND_URL=https://www.edgevantagepro.com
```

### Frontend (.env)
```
REACT_APP_API_URL=https://edgevantage-backend-xxxxx.vercel.app
```

## Troubleshooting

### CORS Errors
- Ensure your domain is listed in `backend/server.js` CORS configuration
- Check that environment variables are set correctly in Vercel

### Connection Errors
- Verify MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0 for simplicity)
- Check that REACT_APP_API_URL doesn't have a trailing slash
- Ensure backend is actually deployed and running

### Form Submission Fails
- Check browser console for errors
- Verify API endpoint is accessible: `https://your-backend.vercel.app/api/health`
- Check MongoDB connection string is correct

## Production Checklist

- [ ] Backend deployed to Vercel
- [ ] MongoDB URI configured in backend environment
- [ ] Frontend URL configured in backend environment
- [ ] API URL configured in frontend environment
- [ ] Frontend redeployed with new environment variables
- [ ] CORS configured for production domain
- [ ] Form submission tested successfully
- [ ] Data appearing in MongoDB Atlas