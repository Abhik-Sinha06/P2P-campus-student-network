# P2P Student Micro-Lending Network

**Course**: Software Engineering Lab (`BCSE301P`)  
**Student**: Abhik Sinha (24BCE1315)  
**System Architecture**: Three-Tier Web Application (Unified Full-Stack Next.js + PostgreSQL / Supabase)

---

## 📖 Project Overview

The **P2P Student Micro-Lending Network** is a trust-based sharing economy platform developed specifically for verified college students (`@vitstudent.ac.in`). It eliminates monetary transactions in campus exchanges and replaces them with peer goodwill and a transactionally consistent **Karma/Credit Points system**.

### Three Core Pillars:
1. **📚 Academic Help**: Peer tutoring, syllabus topic clarifications (DSA, Digital Logic, DBMS, etc.).
2. **💻 Project Assistance**: Teammate discovery, skill matching for hackathons, and technical collaboration.
3. **🔌 Short-Term Item Lending**: Borrowing essential campus items (Casio fx-991EX calculators, Arduino Uno kits, chargers, lab accessories) with scheduled return dates.

---

## ⚡ Karma Points Economy & Rules

- **Registration Bonus**: Every newly verified student receives **50 Karma points** upon completing OTP verification (`FR-3.2.1`).
- **Minimum Requirement to Post**: Students must hold at least **10 Karma points** to submit a request (`FR-3.2.4`).
- **Confirmed Exchange Completion**:
  - **Requester**: Debited **10 Karma points** (`FR-3.2.3`).
  - **Helper / Lender**: Awarded **20 Karma points** (`FR-3.2.2`).
- **Accountability & Trust**: After completion, students rate each other 1–5 stars and submit feedback, updating public trust ratings (`FR-3.3`).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Full-Stack Framework** | **Next.js 14 (App Router)** - React frontend and REST API route handlers unified in a single codebase |
| **Styling & UI** | **Tailwind CSS**, **Lucide Icons** |
| **Database** | **PostgreSQL (Supabase Compatible)** via `pg` pool with offline fallback support |
| **Authentication** | **JWT**, **bcryptjs**, College Domain (`@vitstudent.ac.in`) verification, OTP engine |
| **Security & Privacy** | Contact details masked until match acceptance (`NFR-5.3`), role-based access control for administrators |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or v20+)
- **npm**

### 2. Installation
From the project root directory:
```bash
npm install
```

### 3. Database Configuration (Supabase / PostgreSQL)
Open `.env.local` and configure your database:
```env
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
JWT_SECRET=vit_student_micro_lending_secret_key_2026_super_secure
ALLOWED_EMAIL_DOMAIN=@vitstudent.ac.in
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Using Supabase:**
> 1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
> 2. Open the **SQL Editor** tab in Supabase.
> 3. Copy and paste the contents of `scripts/schema.sql` and run it.
> 4. Copy and paste `scripts/seed.sql` to populate sample data.
> 5. In Supabase: **Project Settings** -> **Database** -> Copy the **Connection string (URI)** and paste it into `.env.local`.

*(Note: If you run without configuring Supabase immediately, the application includes a seamless local persistent fallback store so the UI and APIs work out of the box for testing and evaluation!)*

### 4. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Accounts for Evaluation

| User | Email | Role | Karma | Password |
|---|---|---|---|---|
| **Abhik Sinha** | `abhik@vitstudent.ac.in` | Student | 70 pts | `Student@123` |
| **Priya Sharma** | `priya.s@vitstudent.ac.in` | Student | 90 pts | `Student@123` |
| **Rahul Kumar** | `rahul.k@vitstudent.ac.in` | Student | 50 pts | `Student@123` |
| **Sneha Patel** | `sneha.p@vitstudent.ac.in` | Student | 40 pts | `Student@123` |
| **Administrator** | `admin@vitstudent.ac.in` | Admin | 100 pts | `Admin@123` |

*(The login page provides a **1-click quick-fill** bar to instantly switch between these accounts during viva/evaluation!)*

---

## 🧪 Automated Testing

To run the automated verification test suite verifying all SRS requirements:
```bash
npm run test:api
```

### What is tested:
- Rejection of invalid email domains (e.g. `@gmail.com` rejected with `403 Forbidden`).
- College registration & OTP verification flow.
- 50 Karma welcome grant verification.
- Request creation and minimum 10 Karma check.
- Offer submission and acceptance (status -> `in_progress`).
- Exchange completion with atomic **-10 / +20 Karma points** transfer.
- Star rating calculation and peer review submission.
- Admin moderation access and student status management.

---

## 📁 Repository Structure

```
v:\SWEproject\
├── package.json               # Dependencies and npm scripts
├── tailwind.config.js         # Tailwind styling configuration
├── next.config.mjs            # Next.js configuration
├── .env.example               # Environment template
├── .env.local                 # Local environment settings
├── README.md                  # Project documentation
├── scripts/
│   ├── schema.sql             # Supabase / PostgreSQL DDL table definitions
│   ├── seed.sql               # Seed data for demo students, items & requests
│   ├── seed.js                # Database initialization script
│   └── test-api.js            # Automated verification test suite
└── src/
    ├── app/
    │   ├── layout.jsx         # Layout with Navbar, Disclaimer & Footer
    │   ├── page.jsx           # Home feed (Search, Category filters, Requests)
    │   ├── login/page.jsx     # Login with 1-click evaluation switchers
    │   ├── register/page.jsx  # Student signup with OTP verification
    │   ├── requests/
    │   │   ├── create/page.jsx# Post Academic, Project or Item request
    │   │   └── [id]/page.jsx  # Request detail, offers list & accept offer
    │   ├── exchanges/page.jsx # Active & completed exchanges, return dates & complete
    │   ├── items/page.jsx     # Lendable equipment catalog & listing modal
    │   ├── profile/page.jsx   # Karma balance, transaction ledger & reviews
    │   ├── admin/page.jsx     # Admin moderation dashboard & dispute resolution
    │   └── api/               # Next.js backend API routes
    │       ├── auth/          # Register, verify-otp, login, logout, me
    │       ├── requests/      # List, filter, detail & create requests
    │       ├── offers/        # Submit and accept offers
    │       ├── exchanges/     # In-progress exchanges & completion settlement
    │       ├── items/         # Lendable inventory
    │       ├── karma/         # Live balance & ledger
    │       ├── ratings/       # 1-5 star ratings & aggregate trust scores
    │       ├── reports/       # Misconduct report filing
    │       ├── admin/         # Moderator actions (warn, suspend, reinstate)
    │       └── seed/          # One-click demo data reset
    ├── components/
    │   ├── Navbar.jsx         # Responsive navbar with live Karma counter
    │   ├── DisclaimerBanner.jsx# Campus safety disclaimer (NFR-5.2)
    │   ├── RequestCard.jsx    # Category-specific feed card
    │   ├── RatingModal.jsx    # Post-exchange star review modal
    │   └── ReportModal.jsx    # Student dispute / abuse filing modal
    └── lib/
        ├── db.js              # PostgreSQL client with smart offline fallback
        ├── auth.js            # Password hashing, JWT & domain validation
        └── karma.js           # Atomic Karma transfer business logic
```
