# EdgeVantage Serverless Deployment Guide

## Overview
This guide covers deploying the EdgeVantage application with its serverless backend to Vercel.

## Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- MongoDB database (MongoDB Atlas recommended)
- Resend account for email services (optional but recommended)

## Environment Variables Setup

### 1. Required Environment Variables
Set these in your Vercel dashboard or via CLI:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edgevantage?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-change-this

# Frontend URL (for email links)
FRONTEND_URL=https://your-domain.vercel.app

# Email Service (Optional - for sending emails)
RESEND_API_KEY=re_your_resend_api_key
```

### 2. Setting Environment Variables via Vercel CLI

```bash
# Set production environment variables
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add FRONTEND_URL production
vercel env add RESEND_API_KEY production

# Set preview environment variables (optional)
vercel env add MONGODB_URI preview
vercel env add JWT_SECRET preview
vercel env add FRONTEND_URL preview
vercel env add RESEND_API_KEY preview
```

### 3. Setting Environment Variables via Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable for Production (and Preview if desired)

## Deployment Steps

### 1. Initial Deployment
```bash
# Build the React frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### 2. Automatic Deployments
After initial setup, every push to your main branch will automatically deploy to production.

### 3. Preview Deployments
Every push to non-main branches creates a preview deployment with full serverless functions.

## Database Setup

### 1. MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster (Free tier is sufficient for testing)
3. Create a database user with read/write permissions
4. Whitelist your IP addresses (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to environment variables

### 2. Database Collections
The application will automatically create these collections:
- `users` - User accounts
- `leads` - Applications/leads
- `affiliates` - Affiliate partners (optional)
- `shipments` - Equipment shipment tracking (optional)
- `appointments` - User appointments (optional)
- `earnings` - Earnings tracking (optional)

## Email Service Setup (Optional)

### Using Resend (Recommended)
1. Create a Resend account
2. Verify your domain (or use their sandbox for testing)
3. Get your API key
4. Add `RESEND_API_KEY` to environment variables

### Alternative Email Services
You can modify `api/lib/email-service.js` to use other services like:
- SendGrid
- Mailgun
- AWS SES
- NodeMailer with SMTP

## Testing Your Deployment

### 1. Health Check
Test that your serverless functions are working:
```bash
curl https://your-domain.vercel.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "leadCount": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Lead Submission
```bash
curl -X POST https://your-domain.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-0123",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "hasResidence": "yes",
    "hasInternet": "yes",
    "hasSpace": "yes"
  }'
```

### 3. Test Authentication
```bash
# Register a user
curl -X POST https://your-domain.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST https://your-domain.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Domain Setup

### 1. Custom Domain
1. In Vercel Dashboard, go to your project
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update your DNS records as instructed

### 2. Update Environment Variables
After adding a custom domain, update:
```bash
FRONTEND_URL=https://your-custom-domain.com
```

## Performance Optimization

### 1. Function Regions
The serverless functions will automatically run in the optimal region based on user location.

### 2. Connection Pooling
MongoDB connections are cached to minimize cold start times.

### 3. Function Size
Each function is optimized to be as small as possible for faster cold starts.

## Monitoring & Logging

### 1. Vercel Dashboard
- View function invocations
- Monitor response times
- Check error rates
- Review function logs

### 2. MongoDB Atlas Monitoring
- Monitor database performance
- Track connection usage
- Set up alerts for errors

### 3. Custom Logging
All functions include comprehensive console logging for debugging:
- Request details
- Database operations
- Error tracking
- Performance metrics

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Errors
```
MongoNetworkError: failed to connect to server
```
**Solution:** Check your MONGODB_URI and network access in Atlas

#### 2. JWT Verification Errors
```
JsonWebTokenError: invalid signature
```
**Solution:** Ensure JWT_SECRET is consistent across all environments

#### 3. CORS Errors
```
Access to fetch has been blocked by CORS policy
```
**Solution:** CORS is configured in each function - ensure your domain is supported

#### 4. Cold Start Issues
**Solution:** Functions use connection caching to minimize cold starts

### Debugging Steps
1. Check Vercel function logs in dashboard
2. Verify environment variables are set correctly
3. Test database connection using `/api/health` endpoint
4. Check MongoDB Atlas logs for connection issues

## Security Considerations

### 1. Environment Variables
- Never commit secrets to git
- Use strong, unique JWT secrets
- Rotate API keys regularly

### 2. Database Security
- Use strong database passwords
- Limit IP access where possible
- Enable MongoDB Atlas security features

### 3. API Rate Limiting
Consider adding rate limiting to prevent abuse:
```javascript
// Example rate limiting could be added to functions
const rateLimit = new Map();
// Implementation would track requests per IP
```

## Scaling Considerations

### 1. Database
- MongoDB Atlas auto-scales
- Consider upgrading cluster tier for production
- Set up read replicas for high-traffic scenarios

### 2. Functions
- Vercel automatically scales functions
- Each function can handle thousands of concurrent requests
- No server management required

### 3. Monitoring Limits
Keep an eye on:
- Function execution time (max 10s for hobby plan)
- Function invocations (usage limits)
- Database connection limits

## Backup Strategy

### 1. Database Backups
- MongoDB Atlas provides automatic backups
- Consider point-in-time recovery for production

### 2. Code Backups
- Git repository serves as code backup
- Vercel maintains deployment history

## Support

For issues with:
- **Vercel:** Vercel documentation and support
- **MongoDB Atlas:** MongoDB documentation and support
- **Application:** Check the logs and contact your development team

## Production Checklist

Before going live:
- [ ] All environment variables set
- [ ] Custom domain configured
- [ ] Database properly secured
- [ ] Email service configured and tested
- [ ] All functions tested individually
- [ ] End-to-end user flow tested
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] SSL certificate verified
- [ ] Performance testing completed

Your EdgeVantage application is now ready for production! 🚀