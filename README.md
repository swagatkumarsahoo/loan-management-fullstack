# LoanSpark — Frontend (React + Vite + Tailwind)

## Tech Stack
- React 18 + React Router v6
- Vite (build tool)
- Tailwind CSS (dark theme, custom design system)
- Recharts (dashboard charts)
- Axios (API client with JWT interceptor)
- React Hot Toast (notifications)
- Lucide React (icons)
- Google Fonts: Syne (display) + DM Sans (body)

## Pages
| Route              | Page                  | Access    |
|--------------------|-----------------------|-----------|
| /login             | Login                 | Public    |
| /register          | Register              | Public    |
| /dashboard         | User Dashboard        | User      |
| /loans             | My Loans              | User      |
| /loans/apply       | Loan Application      | User      |
| /loans/:id         | Loan Detail + EMI     | User      |
| /emi               | EMI Tracker + Pay     | User      |
| /payments          | Payment History       | User      |
| /admin             | Admin Dashboard       | Admin     |
| /admin/loans       | Manage All Loans      | Admin     |
| /admin/users       | Manage Users          | Admin     |

## Setup

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → http://localhost:8080)
npm run dev

# Build for production
npm run build
```

Open: http://localhost:3000

## Key Features
- JWT stored in localStorage, attached via Axios interceptor
- 401 auto-redirect to /login
- Role-based routing (adminOnly ProtectedRoute)
- Paginated tables for loans and payments
- Loan eligibility checker with live EMI preview
- EMI payment modal with penalty calculation
- Admin loan review modal (approve/reject)
- Dark theme with Syne display font

## Deployment (Vercel)
1. Push to GitHub
2. Import repo on vercel.com
3. Set environment variable:
   `VITE_API_BASE_URL=https://your-backend.railway.app`
4. Update vite.config.js proxy target to your backend URL
5. Vercel auto-builds with `npm run build`
