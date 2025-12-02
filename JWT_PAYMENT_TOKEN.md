# JWT Payment Token Implementation

## Overview

When an admin approves a student application, the system automatically generates a JWT payment token and stores it in the database. This token is used for secure payment processing.

## How It Works

### 1. Token Generation (Automatic)

When admin clicks "Approve":
- ✅ System checks if `final_fee_payment.token` already exists
- ✅ If **NO token exists** AND `final_fee_payment_amount > 0`:
  - Generates JWT token with 1-hour expiry
  - Stores token in database
  - Returns token in API response
- ✅ If **token exists**: Keeps existing token (no overwrite)

### 2. JWT Token Structure

```typescript
// Token Payload
{
  userId: "user-id-123",
  amount: 16000,
  type: "full",
  iat: 1732450000,  // Issued at (Unix timestamp)
  exp: 1732453600   // Expires at (1 hour later)
}
```

**Signed with**: `PAYMENT_TOKEN_SECRET` environment variable

### 3. Database Storage

**Location**: `users_duplicate.application_details.admin_filled.final_fee_payment`

```json
{
  "application_details": {
    "admin_filled": {
      "final_fee_payment_amount": 16000,
      "final_fee_payment": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi...",
        "amount": 16000,
        "generated_at": "2025-12-02T04:00:00.000Z",
        "expires_at": "2025-12-02T05:00:00.000Z"
      }
    }
  }
}
```

### 4. API Response

**Approval Response** (with token):
```json
{
  "ok": true,
  "updated": { /* user object */ },
  "emailSent": true,
  "status": "Approved",
  "paymentToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "paymentUrl": "https://neramclasses.com/pay?v=eyJhbGciOi...&type=full",
  "paymentAmount": 16000
}
```

## Environment Variables

Add to your `.env` or `.env.local`:

```env
# JWT Payment Token Secret (REQUIRED)
PAYMENT_TOKEN_SECRET=your-super-secret-key-here-minimum-32-characters

# Student App URL (where payment page is hosted)
STUDENT_APP_BASE_URL=https://neramclasses.com
```

## Security Features

### 1. Token Expiry
- ⏱️ **1 hour** expiry time
- Student must complete payment within 1 hour
- Expired tokens cannot be used

### 2. Signature Verification
- Signed with `PAYMENT_TOKEN_SECRET`
- Tampering invalidates the token
- Student app verifies signature before processing

### 3. Single-Use Protection
- Token stored in database
- Admin cannot overwrite existing token
- Manual intervention required to regenerate

### 4. Secure Payload
- Contains only necessary data: `userId`, `amount`, `type`
- No sensitive information stored in token
- All data verified against database on payment

## Code Examples

### Generating Token (Server-Side)

```typescript
import jwt from "jsonwebtoken";

function generateJWTPaymentToken(
  userId: string,
  amount: number,
  type: "full",
  expiryHours: number = 1
): string {
  const secret = process.env.PAYMENT_TOKEN_SECRET!;

  const payload = {
    userId,
    amount,
    type,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expiryHours * 60 * 60),
  };

  return jwt.sign(payload, secret);
}
```

### Verifying Token (Student App)

```typescript
import jwt from "jsonwebtoken";

function verifyPaymentToken(token: string) {
  const secret = process.env.PAYMENT_TOKEN_SECRET!;

  try {
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      amount: number;
      type: string;
      iat: number;
      exp: number;
    };

    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

## Testing

### Run Unit Tests

```bash
npm test -- __tests__/route.test.ts
```

### Test Coverage

- ✅ JWT token generation and signing
- ✅ Token payload verification
- ✅ Expiry time validation (1 hour)
- ✅ Token storage structure
- ✅ Payment URL generation
- ✅ API response structure
- ✅ Token reuse protection

### Manual Testing

1. **Approve an Application**:
   ```bash
   curl -X POST http://localhost:3000/api/applications/approve \
     -H "Content-Type: application/json" \
     -d '{"id": "user-123", "status": "Approved"}'
   ```

2. **Check Response** for `paymentToken` and `paymentUrl`

3. **Verify Token**:
   ```javascript
   const decoded = jwt.verify(token, process.env.PAYMENT_TOKEN_SECRET);
   console.log(decoded);
   // { userId, amount, type, iat, exp }
   ```

4. **Check Database**: Verify `final_fee_payment.token` is stored

## Troubleshooting

### Token Not Generated

**Issue**: `paymentToken: null` in API response

**Causes**:
1. `final_fee_payment_amount` is 0 or undefined
2. Token already exists in database
3. `PAYMENT_TOKEN_SECRET` not configured

**Solution**:
- Check `admin_filled.final_fee_payment_amount` has a value > 0
- Check if `final_fee_payment.token` already exists
- Verify `.env` has `PAYMENT_TOKEN_SECRET`

### Token Verification Fails

**Issue**: "invalid signature" error

**Causes**:
1. Different `PAYMENT_TOKEN_SECRET` between admin and student app
2. Token has been tampered with
3. Token has expired

**Solution**:
- Ensure same `PAYMENT_TOKEN_SECRET` in both apps
- Check token expiry with `jwt.decode(token)` (no verification)
- Generate a new token from admin panel

### Token Expired

**Issue**: "jwt expired" error

**Solution**:
- Admin must manually clear the existing token
- Approve the application again to generate new token
- Consider increasing expiry time if needed

## Flow Diagram

```
Admin Clicks "Approve"
       ↓
API: /api/applications/approve
       ↓
Check: final_fee_payment.token exists?
       ↓
   ┌───NO────┐
   ↓         ↓
Generate  Skip Token
JWT Token Generation
   ↓         ↓
Store in   Continue
Database
   ↓         ↓
   └─────────┘
       ↓
Send Approval Email
       ↓
Return API Response with:
- paymentToken
- paymentUrl
- paymentAmount
```

## Best Practices

1. **Never commit PAYMENT_TOKEN_SECRET** to version control
2. **Use same secret** in both admin and student apps
3. **Minimum 32 characters** for the secret key
4. **Rotate secrets periodically** in production
5. **Monitor token usage** and expiry
6. **Log failed verification attempts**

## Deployment Checklist

- [ ] `PAYMENT_TOKEN_SECRET` set in production environment
- [ ] `STUDENT_APP_BASE_URL` points to production domain
- [ ] Same secret configured in student app
- [ ] Database has `final_fee_payment` structure support
- [ ] Email template includes payment URL
- [ ] Tests passing: `npm test`
- [ ] TypeScript compiles: `npx tsc --noEmit`

## Related Files

- **API Route**: `app/api/applications/approve/route.ts`
- **Unit Tests**: `app/api/applications/approve/__tests__/route.test.ts`
- **Email Setup**: `APPROVAL_EMAIL_SETUP.md`
- **Environment**: `.env` or `.env.local`

## Support

For issues or questions:
- Check logs in browser console (client-side)
- Check server logs for API errors
- Verify environment variables
- Run unit tests to validate setup
- Review this documentation

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
