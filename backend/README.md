# BEAUTIQ API

Production-ready Node.js + Express + MongoDB backend for the BEAUTIQ beauty e-commerce platform.

---

## Quick Start

```bash
git clone <repo>
cd beautiq-api
npm install
cp .env.example .env   # fill in your values
npm run seed           # seed categories, brands, products, coupons, articles
npm run dev            # development with nodemon
npm start              # production
```

Server starts at `http://localhost:5000`. Health check: `GET /health`

---

## Environment Variables

Copy `.env.example` to `.env` and fill every variable.

### MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Add a database user
3. Whitelist your IP (or 0.0.0.0/0 for dev)
4. Copy the connection string into `MONGO_URI`

### Google OAuth

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:5173` to Authorised JavaScript origins
4. Copy Client ID → `GOOGLE_CLIENT_ID`, Client Secret → `GOOGLE_CLIENT_SECRET`

### SMTP (Gmail example)

1. Enable 2-factor auth on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Set `SMTP_USER` = your Gmail, `SMTP_PASS` = the 16-char app password

### Cloudinary

1. Sign up at https://cloudinary.com (free tier works)
2. Copy Cloud Name, API Key, API Secret from the dashboard

### Razorpay (Test Mode)

1. Sign up at https://dashboard.razorpay.com
2. Switch to **Test Mode**
3. Settings → API Keys → Generate Key
4. Copy Key ID → `RAZORPAY_KEY_ID`, Key Secret → `RAZORPAY_KEY_SECRET`
5. Use test card: `4111 1111 1111 1111`, any future expiry, any CVV

---

## API Endpoints

### Auth  `POST /api/auth/...`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | — | Register new account |
| POST | /login | — | Login, returns JWT cookie + token |
| POST | /google | — | Google OAuth (send `idToken`) |
| POST | /logout | — | Clear auth cookie |
| GET | /me | ✓ | Get current user |
| POST | /send-otp | — | Send 6-digit OTP email (`purpose: verify\|reset`) |
| POST | /verify-email | — | Verify OTP + activate account |
| POST | /forgot-password | — | Request password reset code |
| POST | /verify-reset-otp | — | Verify reset OTP |
| POST | /reset-password | — | Set new password |
| POST | /change-password | ✓ | Change password (needs current) |

### Users  `... /api/users`
| Method | Path | Description |
|--------|------|-------------|
| PUT | /profile | Update name/phone/avatar |
| DELETE | /avatar | Remove profile photo |
| GET | /wishlist | Get wishlist |
| POST | /wishlist/:productId | Add to wishlist |
| DELETE | /wishlist/:productId | Remove from wishlist |
| GET | /addresses | List addresses |
| POST | /addresses | Add address |
| PUT | /addresses/:id | Update address |
| DELETE | /addresses/:id | Delete address |
| PATCH | /addresses/:id/default | Set default address |

### Products  `GET /api/products`
```
?search=serum&category=skincare&subcategory=Serums
&brand=Lumen+Lab&minPrice=500&maxPrice=2000
&rating=4&discount=10&skinType=Oily&concern=Acne
&hairType=Curly&inStock=true&newArrival=true
&sort=price_asc|price_desc|rating|discount|newest|reviews
&page=1&limit=20
```

### Orders  `... /api/orders`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /delivery-options | — | Available delivery options |
| POST | /validate-coupon | optional | Validate & calculate coupon |
| POST | /razorpay/create | ✓ | Create Razorpay order (amount in ₹) |
| POST | / | optional | Place order |
| GET | /my | ✓ | My orders |
| GET | /my/:id | ✓ | Single order |
| POST | /my/:id/cancel | ✓ | Cancel order |

### Razorpay Flow
```
1. POST /api/orders/razorpay/create  { amount: 1999 }
   ← { razorpayOrderId, amount, currency, key }

2. Open Razorpay checkout with razorpayOrderId

3. On payment success, Razorpay returns:
   razorpay_order_id, razorpay_payment_id, razorpay_signature

4. POST /api/orders  {
     items, address, deliveryId, paymentMethod: "Razorpay",
     razorpayOrderId, razorpayPaymentId, razorpaySignature
   }
   Backend verifies HMAC signature before creating order.
```

### Admin  (require role=admin)
```
GET  /api/admin/users
PATCH /api/admin/users/:id/status        { status: "active"|"blocked" }
GET  /api/admin/orders                   ?status=Shipped&page=1&limit=20
PATCH /api/admin/orders/:id/status      { status: "Processing"|"Shipped"|... }
GET  /api/admin/reviews                  ?status=pending|approved|rejected|all
PATCH /api/admin/reviews/:id/status     { status: "approved"|"rejected" }
DELETE /api/admin/reviews/:id
GET/POST/PUT/DELETE /api/admin/coupons
GET  /api/admin/brands
GET  /api/admin/categories
GET/POST/PUT/DELETE /api/admin/articles
```

### Beauty Finder
```
POST /api/beauty-finder/recommend
{
  "categories": ["skincare","haircare"],
  "skin": "Oily",
  "concerns": ["Acne","Dullness"],
  "ingredients": ["Niacinamide"],
  "hair": ["Curly","Thick"],
  "budget": 2000
}
```

### Articles
```
GET /api/articles          ?category=Routines&q=vitamin+c&page=1
GET /api/articles/trending
GET /api/articles/:slug
```

### Misc
```
POST /api/newsletter/subscribe   { "email": "you@example.com" }
```

---

## Authentication

The API issues a JWT in two places:
1. **HTTP-only cookie** `bq_token` (for browser sessions)
2. **Response body** `{ token }` (for mobile/API clients)

The `Authorization: Bearer <token>` header also works for all protected routes.

---

## Response Format

```json
// Success
{ "success": true, "message": "Products fetched", "data": { ... } }

// Error
{ "success": false, "message": "Product not found", "error": "NOT_FOUND" }
```

---

## Project Structure

```
src/
  config/       db, cloudinary, razorpay, mailer
  controllers/  auth, user, product, review, order, brand, category, coupon, article, newsletter, beautyFinder
  middleware/   auth (protect/optionalAuth/requireAdmin), errorHandler, validate
  models/       User, OTP, Product, Brand, Category, Order, Review, Coupon, Article, Newsletter
  routes/       auth, users, products, brands, categories, orders, admin, misc
  services/     authService, productService, couponService, orderService, beautyFinderService
  seeds/        seed.js
  utils/        asyncHandler, jwt, otp, response, slugify
  app.js
  server.js
```
