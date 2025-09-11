# EdgeVantage Deployment Safety Guide

## Pre-Deployment Verification

### Automated Verification
Run the verification script before any deployment:
```bash
node scripts/verify-deployment.js
```

This checks:
- Build directory integrity
- Bundle sizes
- Security vulnerabilities
- Console statements in production
- Test suite passing
- Critical files presence

### Manual Verification Checklist

#### 1. Critical User Flows
Test these flows manually before deployment:

- [ ] **Application Flow**
  - [ ] Navigate from overview to application
  - [ ] Fill qualification questions
  - [ ] Submit application form
  - [ ] Reach confirmation page
  - [ ] Verify referral code generation

- [ ] **Analytics Tracking**
  - [ ] Open browser DevTools Network tab
  - [ ] Verify GA4 events fire
  - [ ] Verify Facebook Pixel events fire
  - [ ] Check for analytics errors

- [ ] **Admin Dashboard**
  - [ ] Press Ctrl+Shift+A
  - [ ] Verify auth modal appears
  - [ ] Test login functionality
  - [ ] Check dashboard data loads

- [ ] **Mobile Responsiveness**
  - [ ] Test on mobile viewport (375px)
  - [ ] Test on tablet viewport (768px)
  - [ ] Verify touch interactions work
  - [ ] Check text readability

#### 2. API Integration
```bash
# Test backend connectivity
curl http://localhost:5000/api/health

# Test lead submission endpoint
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test"}'
```

#### 3. Performance Metrics
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size < 500KB gzipped

## Deployment Process

### Stage 1: Development Environment
```bash
# 1. Run tests
npm test

# 2. Build application
npm run build

# 3. Run verification
node scripts/verify-deployment.js

# 4. Test build locally
npx serve -s build
```

### Stage 2: Staging Deployment
```bash
# 1. Deploy to staging
git push staging develop

# 2. Run smoke tests
npm run test:e2e:staging

# 3. Manual verification
# - Test all critical flows
# - Check analytics
# - Verify API connections

# 4. Monitor for 24 hours
# - Check error logs
# - Monitor performance metrics
# - Review user feedback
```

### Stage 3: Production Deployment
```bash
# 1. Create deployment tag
git tag -a v1.0.x -m "Production release v1.0.x"
git push origin v1.0.x

# 2. Deploy to production
git push production main

# 3. Immediate verification
# - Test critical flows
# - Check monitoring dashboards
# - Verify analytics

# 4. Monitor closely for 1 hour
# - Watch error rates
# - Check conversion metrics
# - Monitor API response times
```

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
If critical issues detected immediately after deployment:

```bash
# 1. Revert to previous version
git revert HEAD
git push production main --force

# OR using GitHub Actions
gh workflow run rollback.yml -f environment=production -f version=<previous-tag>
```

### Standard Rollback (< 30 minutes)
For non-critical issues discovered post-deployment:

```bash
# 1. Create rollback branch
git checkout -b rollback/v1.0.x
git revert <commit-hash>

# 2. Test rollback locally
npm run build
npm test
node scripts/verify-deployment.js

# 3. Deploy rollback
git push production rollback/v1.0.x:main

# 4. Create incident report
```

### Database Rollback Considerations
If deployment includes database changes:

```bash
# 1. Check if data changes are reversible
# 2. Run database backup before deployment
mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)

# 3. If rollback needed:
mongorestore --uri="mongodb://..." backup-20240101/
```

## Monitoring & Alerts

### Real-time Monitoring
Set up alerts for:

1. **Error Rates**
   - Alert if error rate > 1% of requests
   - Alert if any 500 errors occur
   - Alert if console errors > 10/minute

2. **Performance**
   - Alert if response time > 3s
   - Alert if page load time > 5s
   - Alert if API timeout rate > 0.1%

3. **Business Metrics**
   - Alert if conversion rate drops > 20%
   - Alert if form abandonment > 50%
   - Alert if traffic drops > 30%

### Monitoring Commands
```bash
# Check application logs
pm2 logs

# Check error logs
tail -f /var/log/edgevantage/error.log

# Check nginx access logs
tail -f /var/log/nginx/access.log

# Monitor system resources
htop

# Check database connections
mongo --eval "db.serverStatus().connections"
```

## Emergency Contacts & Escalation

### Escalation Path
1. **Level 1**: DevOps Engineer on-call
   - Response time: < 15 minutes
   - Can handle: Rollbacks, restarts, basic fixes

2. **Level 2**: Technical Lead
   - Response time: < 30 minutes
   - Can handle: Code fixes, database issues

3. **Level 3**: CTO/Engineering Manager
   - Response time: < 1 hour
   - Can handle: Critical decisions, customer communication

### Communication Protocol
1. **Incident Detection**
   - Automated alert triggers
   - Create incident in tracking system
   - Post in #incidents Slack channel

2. **During Incident**
   - Update status every 15 minutes
   - Keep stakeholders informed
   - Document all actions taken

3. **Post-Incident**
   - Write incident report within 24 hours
   - Conduct blameless postmortem
   - Create action items to prevent recurrence

## Feature Flag Management

### Using Feature Flags for Safe Rollout
```javascript
// In .env
REACT_APP_ENABLE_NEW_FEATURE=false

// In code
if (process.env.REACT_APP_ENABLE_NEW_FEATURE === 'true') {
  // New feature code
} else {
  // Existing code
}
```

### Gradual Rollout Strategy
1. **Phase 1**: 5% of users (1 day)
2. **Phase 2**: 25% of users (2 days)
3. **Phase 3**: 50% of users (3 days)
4. **Phase 4**: 100% of users

## Testing Strategy

### Automated Test Suite
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Security tests
npm run test:security
```

### Test Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths
- All API endpoints tested
- All user flows have E2E tests

## Deployment Schedule

### Regular Deployments
- **Production**: Wednesdays 3 PM UTC (low traffic)
- **Staging**: Daily at 2 AM UTC
- **Development**: Continuous on merge

### Emergency Deployments
- Require approval from 2 senior engineers
- Must include rollback plan
- Post-deployment monitoring for 2 hours

## Backup & Recovery

### Backup Schedule
- **Database**: Every 6 hours
- **Application code**: Git repository
- **User uploads**: Daily to S3
- **Configuration**: Version controlled

### Recovery Time Objectives
- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 6 hours

## Security Considerations

### Pre-deployment Security Checks
1. Run `npm audit` and fix vulnerabilities
2. Check for exposed secrets with `git secrets`
3. Verify HTTPS certificates
4. Test authentication flows
5. Check CORS configuration

### Post-deployment Security Monitoring
1. Monitor for suspicious activity
2. Check for unauthorized access attempts
3. Review security logs daily
4. Run weekly security scans

## Documentation Updates

After each deployment:
1. Update CHANGELOG.md
2. Update API documentation
3. Update user documentation if needed
4. Send release notes to stakeholders
5. Update internal wiki

## Success Criteria

Deployment is considered successful when:
- ✅ All automated tests pass
- ✅ Manual testing completed
- ✅ No critical errors in first hour
- ✅ Performance metrics stable
- ✅ Conversion rates maintained
- ✅ No customer complaints
- ✅ Monitoring shows green status

## Lessons Learned Log

Document issues and solutions:
- Date: Issue description and resolution
- 2024-01-10: Build failed due to Tailwind v4 - Downgraded to v3
- [Add new entries here]