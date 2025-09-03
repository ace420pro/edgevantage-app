# Google Workspace DNS Setup for edgevantagepro.com

## MX Records (for receiving email)
Add these 5 MX records in Vercel DNS:

1. **MX Record 1:**
   - Name: @ (or leave blank for root domain)
   - Priority: 1
   - Value: ASPMX.L.GOOGLE.COM

2. **MX Record 2:**
   - Name: @ (or leave blank for root domain)
   - Priority: 5
   - Value: ALT1.ASPMX.L.GOOGLE.COM

3. **MX Record 3:**
   - Name: @ (or leave blank for root domain)
   - Priority: 5
   - Value: ALT2.ASPMX.L.GOOGLE.COM

4. **MX Record 4:**
   - Name: @ (or leave blank for root domain)
   - Priority: 10
   - Value: ALT3.ASPMX.L.GOOGLE.COM

5. **MX Record 5:**
   - Name: @ (or leave blank for root domain)
   - Priority: 10
   - Value: ALT4.ASPMX.L.GOOGLE.COM

## SPF Record (for email authentication)
Add this TXT record:

- **Type:** TXT
- **Name:** @ (or leave blank for root domain)
- **Value:** `v=spf1 include:_spf.google.com ~all`

## Domain Verification (if needed)
Google will provide a TXT record like:

- **Type:** TXT
- **Name:** @ (or leave blank for root domain)
- **Value:** `google-site-verification=xxxxxxxxxxxxx` (Google will provide the actual value)

## Testing
After adding records, wait 15-60 minutes, then:

1. Send test email to support@edgevantagepro.com
2. Check Google Workspace Gmail inbox
3. Send email FROM support@edgevantagepro.com to verify sending

## Troubleshooting Commands
Run these to verify DNS is set correctly:

```bash
# Check MX records
nslookup -type=MX edgevantagepro.com

# Check TXT records (SPF)
nslookup -type=TXT edgevantagepro.com
```

## Google Workspace Admin Console
Access at: https://admin.google.com

1. Go to Apps > Google Workspace > Gmail
2. Set up users
3. Configure email routing if needed