# Universal OTP Authentication SaaS Platform (`Otp-minus`)

A modern, cloud-based **Software-as-a-Service (SaaS) OTP Authentication Platform** built for developers to add secure multi-channel OTP verification to their websites and mobile applications through APIs and SDKs.

---

## 🚀 Key Features

### 🎨 Premium Design & UI
- **Futuristic Glassmorphism Dashboard**: Sleek glass cards, subtle neon glows, and backdrop blurs.
- **Dark and Light Mode**: Full theme toggle support.
- **Responsive Layout**: Works on mobile, tablet, and desktop screens.
- **Interactive Sandbox Testing**: Live API Playground to test `/api/v1/otp/send` and `/api/v1/otp/verify` without writing code.
- **Live Delivered Messages Stream**: Real-time simulated inbox showing delivered SMS, Email, WhatsApp, and Voice OTP codes.

---

### 🔑 Supported Authentication Methods
1. **SMS OTP**: Deliver 4, 6, or 8-digit OTPs via SMS with custom sender names.
2. **Email OTP**: Deliver HTML formatted emails using customizable email templates.
3. **WhatsApp OTP**: Official WhatsApp Business messaging format.
4. **Voice Call OTP**: Text-to-speech voice verification code delivery.
5. **Time-based OTP (TOTP)**: Google Authenticator and Authy 2FA QR code generator & verification.

---

### 💻 Developer Features
- **Developer Dashboard**: View total OTPs sent, conversion rates, latency metrics, and time series charts.
- **Multi-Tenant Project Management**: Create multiple projects, switch between **Sandbox Mode** (testing) and **Live Mode** (production).
- **API Key & Secret Key Management**: Issue `opt_live_...` and `opt_test_...` API keys with one-time raw key viewing and instant revoking.
- **Multi-Platform SDK Snippets**: Code generators for 9 languages & frameworks:
  - **JavaScript / Node.js**
  - **Python**
  - **PHP**
  - **Java**
  - **Kotlin**
  - **Swift**
  - **Flutter**
  - **React Native**
- **Interactive API Documentation & OpenAPI Spec**: Embedded Swagger-style OpenAPI spec runner with sample payloads and error tables.
- **Webhook Subscriptions**: Register webhook endpoints, HMAC SHA-256 signature verification, event filtering (`otp.sent`, `otp.verified`, `otp.failed`, `otp.expired`), delivery logs, and manual test triggers.
- **Custom Message Templates**: Visual template editor for Email & SMS with dynamic variables (`{{otp}}`, `{{app_name}}`, `{{expires_in}}`).
- **Team Access & RBAC**: Invite members with Owner, Admin, Developer, or Viewer permissions.

---

### 🛡️ Security & Compliance
- **Encrypted / Hashed OTP Storage**: OTPs are hashed using **SHA-256 + salt** before database storage; plain text OTPs are never stored.
- **Anti-Replay Attack Protection**: Single-use token invalidation; codes are automatically destroyed upon successful verification.
- **Rate Limiting**: Sliding window rate limits per IP and API key.
- **IP Whitelisting & Blacklisting**: Restrict API access to trusted IP ranges or block suspicious malicious IPs.
- **Immutable Audit Logs**: Comprehensive logs of administrative actions (API key creation, webhook changes, security rule updates).
- **Fraud Detection**: Automatic alerts on rapid velocity spikes or failed verification bursts.

---

### 🔐 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/otp/send` | `POST` | Send OTP via SMS, Email, WhatsApp, Voice, or TOTP |
| `/api/v1/otp/verify` | `POST` | Verify user-submitted OTP code |
| `/api/v1/otp/resend` | `POST` | Resend existing OTP with cooldown tracking |
| `/api/v1/otp/status/:id` | `GET` | Fetch status of an OTP request |
| `/api/v1/totp/setup` | `POST` | Generate TOTP secret & QR code data URI |
| `/api/v1/totp/verify` | `POST` | Validate TOTP token against secret |
| `/api/v1/projects` | `GET / POST` | List or create projects |
| `/api/v1/keys` | `GET / POST / DELETE` | Generate and manage API keys |
| `/api/v1/analytics` | `GET` | Retrieve usage statistics and latency metrics |
| `/api/v1/logs` | `GET` | View HTTP request logs and verification errors |
| `/api/v1/webhooks` | `GET / POST / DELETE` | Manage webhooks and delivery logs |

---

## 🛠️ Technology Stack
- **Framework**: [Next.js 14 / 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Glassmorphism, CSS Glows & Custom Animations
- **Icons & UI**: [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Database Engine**: WebAssembly SQLite (`sql.js`) with automatic disk persistence
- **Security & Auth**: JWT (`jsonwebtoken`), `bcryptjs`, HMAC SHA-256 signatures, SHA-256 salted hashes, `otplib`, `qrcode`

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Pre-seeded Demo Credentials
- **Developer Account**: `developer@otpminus.io` / `demo1234`
- **Super Admin Account**: `admin@otpminus.io` / `demo1234`
- **Pre-configured API Key (Sandbox)**: `opt_test_1a2b3c4d5e6f7a8b9c`
