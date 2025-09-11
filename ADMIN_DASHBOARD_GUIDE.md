# EdgeVantage Admin Dashboard Guide

## Overview
The EdgeVantage Admin Dashboard is a comprehensive management interface for monitoring leads, tracking performance metrics, and managing your passive income opportunity service.

## Features

### 1. Real-time Analytics
- Total applications and conversion rates
- Monthly revenue projections
- Active member tracking
- Weekly growth metrics

### 2. Lead Management
- View, edit, and delete leads
- Update lead status (pending, contacted, approved, rejected)
- Search and filter capabilities
- Export data to CSV

### 3. Performance Metrics
- State-by-state distribution
- Referral source tracking
- Qualification rate analysis
- Average monthly payout calculations

### 4. Advanced Analytics
- Visual charts and graphs
- Conversion funnel analysis
- Revenue projections
- Performance KPIs

## Access Method

### Direct URL Access
1. Navigate to: https://edgevantagepro.com/admin
2. The admin dashboard will load directly
3. Bookmark this URL for quick access

**Note:** For security, consider implementing authentication in production.

## Deployment Configuration

### Frontend (Vercel)
Your frontend is already deployed to Vercel. The Admin Dashboard is accessible at the `/admin` route.

### Backend API Connection
The dashboard automatically connects to your backend API:
- **Production**: Uses `/api` endpoints (same domain)
- **Development**: Uses `http://localhost:5000/api`

### MongoDB Configuration
Ensure your backend server has the correct MongoDB connection string in the `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
```

## Security Considerations

### 1. Implement Authentication
Currently the `/admin` route is publicly accessible. You should implement authentication:

### 2. Implement Proper Authentication
Consider implementing:
- JWT-based authentication
- User roles and permissions
- Session management
- Two-factor authentication

### 3. Secure API Endpoints
Currently, API endpoints are public. Consider adding:
- API key authentication
- Rate limiting
- Request validation

## Dashboard Tabs

### Overview Tab
- Key metrics cards
- Application status breakdown
- Top performing states
- Recent applications table

### Leads Tab
- Complete lead list with search
- Filter by status and date range
- Inline editing capabilities
- Bulk export functionality

### Analytics Tab
- Qualification rate pie chart
- Referral source analysis
- Performance metrics
- Revenue projections

### Settings Tab
- Auto-refresh configuration
- Export format preferences
- Database connection status
- API endpoint information

## Using the Dashboard

### Updating Lead Status
1. Click the eye icon next to any lead
2. Select new status from dropdown
3. Add notes if needed
4. Click "Save Changes"

### Exporting Data
1. Click "Export CSV" button in header
2. File will download with all current leads
3. Format: `edgevantage-leads-YYYY-MM-DD.csv`

### Searching Leads
1. Use the search bar in the Leads tab
2. Search by name, email, city, or state
3. Combine with status and date filters

### Auto-Refresh
- Dashboard refreshes every 30 seconds by default
- Configure in Settings tab
- Manual refresh available via button

## Troubleshooting

### Dashboard Not Loading
1. Check browser console for errors
2. Verify MongoDB connection
3. Ensure backend server is running
4. Check CORS configuration

### API Connection Issues
1. Verify backend URL in `EnterpriseDashboard.js`
2. Check network tab for failed requests
3. Ensure proper CORS headers

### Data Not Updating
1. Check MongoDB connection
2. Verify API endpoints are working
3. Clear browser cache
4. Try manual refresh

## API Endpoints Used

- `GET /api/leads` - Fetch all leads
- `GET /api/leads-stats` - Get statistics
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com
```

## Accessing the Dashboard

1. **Production**: Navigate to https://edgevantagepro.com/admin
2. **Development**: Navigate to http://localhost:3000/admin

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
PORT=5000
FRONTEND_URL=https://edgevantagepro.com
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all connections are configured
3. Ensure MongoDB is accessible
4. Contact support if needed

## Future Enhancements

Consider implementing:
- WebSocket for real-time updates
- Advanced filtering and sorting
- Email notifications
- Automated lead scoring
- Integration with CRM systems
- Custom reporting tools
- Mobile app version

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment variables** for sensitive data
3. **Implement HTTPS** for all connections
4. **Add authentication** to API endpoints
5. **Regular security audits** of the codebase
6. **Monitor access logs** for suspicious activity
7. **Implement rate limiting** on API endpoints
8. **Use secure password policies**

## License

This dashboard is proprietary software for EdgeVantage internal use only.