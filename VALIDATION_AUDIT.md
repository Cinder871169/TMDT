# Validation Audit & Implementation Report

## Summary

Input validation được thêm vào backend bằng Joi để bảo vệ routes khỏi dữ liệu không hợp lệ, injection, và type mismatch.

---

## ✅ Implemented Validations (User Routes)

### 1. **Registration** (`POST /api/users/register`)

- **Schema**: `registerSchema`
- **Rules**:
  - `name`: String, 2–100 chars, required
  - `email`: Valid email format, required
  - `password`: Min 6 chars, required

### 2. **Send OTP** (`POST /api/users/auth/send-otp`)

- **Schema**: `sendOtpSchema`
- **Rules**:
  - `email`: Valid email, required
  - `type`: "login" | "register", optional

### 3. **Verify OTP** (`POST /api/users/auth/verify-otp`)

- **Schema**: `verifyOtpSchema`
- **Rules**:
  - `email`: Valid email, required
  - `otp`: Exactly 6 digits, required
  - `type`: "login" | "register", required
  - `name`, `password`: Required only if type="register"

### 4. **Login** (`POST /api/users/login`)

- **Schema**: `loginSchema`
- **Rules**:
  - `email`: Valid email, required
  - `password`: Non-empty, required

### 5. **Update Profile** (`PUT /api/users/profile`)

- **Schema**: `profileUpdateSchema`
- **Rules**:
  - `name`: String, 2–100 chars, optional
  - `phone`: Valid phone format (E.164-like), optional
  - `address`: String, max 500 chars, optional

### 6. **Change Password** (`PUT /api/users/change-password`)

- **Schema**: `changePasswordSchema`
- **Rules**:
  - `oldPassword`: Non-empty, required
  - `newPassword`: Min 6 chars, required

### 7. **Newsletter Signup** (`POST /api/users/newsletter`)

- **Schema**: `newsletterSchema`
- **Rules**:
  - `email`: Valid email, required

### 8. **Contact Form** (`POST /api/users/contact`)

- **Schema**: `contactSchema`
- **Rules**:
  - `name`: String, 2–100 chars, required
  - `email`: Valid email, required
  - `subject`: String, 3–200 chars, required
  - `message`: String, 10–5000 chars, required

---

## 🔄 Middleware Implementation

**File**: `server/middleware/validation.js`

- Exports `validate(schema)` middleware factory
- Returns middleware that:
  - Validates `req.body` against provided schema
  - Returns 400 with error details if invalid
  - Sanitizes/strips unknown fields (strips untrusted data)
  - Passes normalized data to route handler

**Usage**:

```javascript
router.post("/route", validate(mySchema), handler);
```

---

## ⚠️ Still Missing / Recommendations

### **High Priority**

1. **Multipart Upload Routes** (Products, News)
   - Current: Manual checks after upload
   - Recommend: Add post-upload validation or use `joi` with `multipart` support
   - Example needed for:
     - `POST /api/admin/products` (name, price, brand, sizes, colors)
     - `PUT /api/admin/products/:id`
     - `POST /api/admin/news` (title, content)
     - `PUT /api/admin/news/:id`

2. **Order Routes** (`POST /api/orders`)
   - Needs complex validation:
     - `orderItems`: Array of {productId, quantity, size, color}
     - `address`: String, required
     - `phone`: Phone format, required
     - `city`: String, required
     - `paymentMethod`: "vietqr" | "banking"
   - Recommend: Create `orderSchema` with array validation

3. **Admin Routes** (Remaining)
   - `PUT /api/admin/users/:id/role` – validate `isAdmin` boolean
   - `PUT /api/admin/orders/:id/status` – validate status enum
   - `POST /api/admin/news` – validate before/after upload

4. **Review Routes**
   - `POST /api/reviews` – validate rating (1–5), comment length
   - Ensure productId is valid ObjectId

### **Medium Priority**

1. **Phone Number Validation**
   - Current: Regex pattern `/^[+]?...$/` is loose
   - Better: Use `libphonenumber-js` for strict E.164/national format

2. **Error Response Standardization**
   - Current: Error.message leaked in some catches
   - Recommend: Add error middleware to catch/log server errors without exposing details

3. **Password Strength**
   - Current: Min 6 chars only
   - Recommend: Add character variety rules (uppercase, lowercase, number, special char)

4. **Client-side Validation** (Frontend)
   - Currently basic (HTML5 attributes + some JS checks)
   - Should mirror server validation for UX feedback

### **Low Priority**

1. **Rate Limiting**
   - Add `express-rate-limit` to auth endpoints (register, login, send-otp)
   - Example: 5 requests per 15 min per IP for registration

2. **Input Sanitization**
   - Use `xss` or `express-validator` sanitizers to escape HTML/XSS
   - Already partially done by Joi (strips unknown fields)

3. **CORS & HTTPS**
   - Ensure production CORS origins are restricted
   - Enforce HTTPS in production

---

## 📝 Example: Adding Order Validation

```javascript
// In server/middleware/validation.js
const orderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().alphanum().length(24).required(), // ObjectId
        quantity: Joi.number().integer().min(1).required(),
        size: Joi.number().required(),
        color: Joi.string().required(),
      }),
    )
    .min(1)
    .required(),
  address: Joi.string().max(500).required(),
  phone: Joi.string()
    .pattern(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    )
    .required(),
  city: Joi.string().required(),
  paymentMethod: Joi.string().valid("vietqr", "banking").optional(),
});

// In server/routes/orderRoutes.js
router.post("/", protect, validate(orderSchema), async (req, res) => {
  // req.body is now validated
  const { orderItems, address, phone, city, paymentMethod } = req.body;
  // ... proceed with order creation
});
```

---

## 📊 Coverage Summary

| Category             | Routes | Validated  | Status     |
| -------------------- | ------ | ---------- | ---------- |
| **User Auth**        | 6      | ✅ All     | Done       |
| **User Profile**     | 3      | ✅ All     | Done       |
| **Public Forms**     | 2      | ✅ All     | Done       |
| **Order**            | 1      | ❌ Missing | To-do      |
| **Products (Admin)** | 2      | ❌ Partial | To-do      |
| **News (Admin)**     | 2      | ❌ Partial | To-do      |
| **Reviews**          | 1      | ❌ Missing | To-do      |
| **Total**            | 17     | 55%        | ~9/17 Done |

---

## 🚀 Next Steps

1. Add order validation (high impact, high priority)
2. Add review validation
3. Improve multipart upload validation (product/news)
4. Standardize error responses with middleware
5. Add rate limiting for auth endpoints
6. Implement frontend validation mirror

---

## Files Modified

- `server/middleware/validation.js` – Created with 8 schemas
- `server/routes/userRoutes.js` – Added validation to 8 routes
- `server/package.json` – Added `"joi": "^17.9.2"`
