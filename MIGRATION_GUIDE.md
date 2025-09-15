# EdgeVantage Migration Guide: Next.js 14 + Supabase

## ✅ Migration Complete!

Your EdgeVantage application has been successfully migrated from React CRA + Express/MongoDB to Next.js 14 + Supabase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `edgevantage`
   - Database Password: (save this securely)
   - Region: Choose closest to your users

#### Run Database Migration
1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to create all tables and functions

#### Get Your API Keys
1. Go to Settings → API in Supabase Dashboard
2. Copy these values:
   - `Project URL` → Your Supabase URL
   - `anon public` → Your Anon Key
   - `service_role` → Your Service Role Key (keep this secret!)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-here

# Company Information
NEXT_PUBLIC_COMPANY_PHONE=(817) 204-6783
NEXT_PUBLIC_COMPANY_SMS=+18172046783
NEXT_PUBLIC_COMPANY_EMAIL=support@edgevantagepro.com

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXX

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

## 📁 New Project Structure

```
edgevantage-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with analytics
│   ├── page.tsx             # Main application (3-step flow)
│   ├── globals.css          # Global styles
│   └── api/                 # API Routes
│       └── leads/           # Lead management endpoints
├── components/              # React components
│   └── pages/              # Page components
│       ├── Overview.tsx    # Step 1: Overview & qualification
│       ├── Application.tsx # Step 2: Application form
│       └── Confirmation.tsx # Step 3: Success confirmation
├── lib/                     # Utility libraries
│   ├── api/                # API client functions
│   └── supabase/           # Supabase configuration
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript definitions
└── supabase/               # Database migrations
```

## 🔄 What Changed

### Frontend Changes
- **React Router → Next.js App Router**: Navigation now uses Next.js built-in routing
- **JavaScript → TypeScript**: Full type safety across the application
- **API Calls**: Now use Next.js API routes instead of Express endpoints

### Backend Changes
- **Express.js → Next.js API Routes**: All endpoints migrated to `/app/api`
- **MongoDB → Supabase (PostgreSQL)**: Database migrated with same schema
- **Mongoose → Supabase Client**: Direct SQL queries with type safety

### Features Preserved
✅ 3-step application flow (Overview → Application → Confirmation)  
✅ Lead management and tracking  
✅ Analytics integration (GA4 + Facebook Pixel)  
✅ Admin dashboard  
✅ Referral system  
✅ All UI/UX with Tailwind CSS  
✅ Mobile responsiveness  
✅ Form validation  

## 🚢 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Migrate to Next.js 14 + Supabase"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables from `.env.local`
4. Deploy!

### 3. Configure Supabase RLS (Row Level Security)
After deployment, update your Supabase RLS policies if needed for production security.

## 🛠️ API Endpoints

All API endpoints are now available at:

- `POST /api/leads` - Submit new application
- `GET /api/leads` - Get all leads (with filters)
- `GET /api/leads/[id]` - Get single lead
- `PATCH /api/leads/[id]` - Update lead status
- `DELETE /api/leads/[id]` - Delete lead
- `GET /api/leads/stats` - Get statistics

## 🔐 Admin Access

Access the admin dashboard at: `/admin`

Default admin credentials (created in database):
- Email: `admin@edgevantagepro.com`
- Password: `Admin123!`

**Important**: Change these credentials after first login!

## 📊 Database Schema

The following tables have been created in Supabase:

- `leads` - Application submissions
- `users` - User accounts
- `admins` - Admin accounts
- `affiliates` - Referral tracking
- `payments` - Payment records
- `ab_tests` - A/B testing data

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check if the database migrations ran successfully
- Ensure RLS policies are configured correctly

### Build Errors
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Update dependencies: `npm update`

### Type Errors
- Run `npm run type-check` to identify TypeScript issues
- Ensure all imports use correct paths with `@/` prefix

## 📝 Next Steps

1. **Test all features** thoroughly
2. **Update analytics IDs** in environment variables
3. **Configure email notifications** (if needed)
4. **Set up monitoring** (Vercel Analytics recommended)
5. **Review and update RLS policies** for production security

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Review Next.js server logs
3. Verify Supabase connection and queries
4. Check environment variables are set correctly

---

**Migration completed successfully!** Your application is now running on modern, scalable infrastructure with Next.js 14 and Supabase. 🎉