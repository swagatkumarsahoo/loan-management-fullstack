# Smart Loan & Credit Management System

A production-grade full-stack loan management system built with **Spring Boot 3.2 + Java 21 + MySQL**.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Java 21, Spring Boot 3.2, Maven         |
| Security   | Spring Security 6, JWT (JJWT 0.12)     |
| Persistence| Spring Data JPA, Hibernate, MySQL 8     |
| Utilities  | Lombok, Bean Validation                 |

---

## Project Structure

```
src/main/java/com/loanapp/loanmanagement/
├── config/           SecurityConfig, JwtAuthFilter, ApplicationConfig
├── controller/       AuthController, LoanController, EMIController,
│                     PaymentController, AdminController, DashboardController
├── service/          AuthService, JwtService, LoanService, EMIService,
│                     PaymentService, DashboardService
├── repository/       UserRepository, LoanRepository,
│                     EMIScheduleRepository, PaymentRepository
├── entity/           User, Loan, EMISchedule, Payment
├── dto/
│   ├── request/      RegisterRequest, LoginRequest, LoanApplicationRequest,
│   │                 LoanReviewRequest, PaymentRequest
│   └── response/     AuthResponse, ApiResponse, LoanResponse, EMIResponse,
│                     PaymentResponse, EligibilityResponse, DashboardResponse
├── enums/            Role, LoanStatus, LoanType, EMIStatus
└── exception/        GlobalExceptionHandler, ResourceNotFoundException,
                      LoanNotEligibleException
```

---

## Prerequisites

- Java 21+
- Maven 3.9+
- MySQL 8+

---

## Setup & Run

### 1. Create the database
```sql
CREATE DATABASE loan_db;
```

### 2. Configure credentials
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Generate a secure JWT secret
```bash
openssl rand -base64 32
```
Paste the output as `application.security.jwt.secret-key`.

### 4. Run the application
```bash
mvn clean install
mvn spring-boot:run
```

The server starts at **http://localhost:8080**

---

## Database Schema

Hibernate auto-creates the schema from entities (`ddl-auto=update`).

### Tables created:
| Table         | Key columns                                               |
|---------------|-----------------------------------------------------------|
| `users`       | id, full_name, email, password, credit_score, annual_income, role |
| `loans`       | id, user_id (FK), loan_type, principal_amount, emi_amount, status |
| `emi_schedule`| id, loan_id (FK), instalment_number, due_date, status, paid_date |
| `payments`    | id, loan_id (FK), emi_schedule_id (FK), transaction_id, amount_paid |

---

## API Reference

All responses follow this envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00"
}
```

### Auth APIs (public)

| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| POST   | /api/auth/register   | Register new user |
| POST   | /api/auth/login      | Login + get JWT   |
| GET    | /api/auth/me         | Get current user  |

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "SecurePass@1",
  "phone": "9876543210",
  "annualIncome": 600000,
  "creditScore": 720
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "arjun@example.com", "password": "SecurePass@1" }
```
Response includes `"token"` — use it as `Authorization: Bearer <token>` on all subsequent requests.

---

### Loan APIs (USER role)

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| GET    | /api/loans/eligibility           | Check loan eligibility   |
| POST   | /api/loans/apply                 | Apply for a loan         |
| GET    | /api/loans/my                    | My loans (paginated)     |
| GET    | /api/loans/{id}                  | Get loan by ID           |

#### Eligibility check
```http
GET /api/loans/eligibility?amount=500000&tenureMonths=60&loanType=PERSONAL_LOAN
Authorization: Bearer <token>
```

#### Apply for loan
```http
POST /api/loans/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "loanType": "PERSONAL_LOAN",
  "principalAmount": 500000,
  "tenureMonths": 60,
  "purpose": "Home renovation"
}
```

---

### EMI APIs (USER role)

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/emi/schedule/{loanId}  | Full amortisation table  |
| GET    | /api/emi/pending/{loanId}   | Only unpaid instalments  |

---

### Payment APIs (USER role)

| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| POST   | /api/payments/pay | Pay an EMI             |
| GET    | /api/payments/my  | My payment history     |

#### Make a payment
```http
POST /api/payments/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "emiScheduleId": 1,
  "amountPaid": 10624.50,
  "paymentMode": "UPI",
  "remarks": "Google Pay"
}
```

---

### Admin APIs (ADMIN role only)

| Method | Endpoint                       | Description               |
|--------|--------------------------------|---------------------------|
| GET    | /api/admin/dashboard           | System-wide statistics    |
| GET    | /api/admin/loans               | All loans (filter + page) |
| POST   | /api/admin/loans/review        | Approve / Reject loan     |
| GET    | /api/admin/users               | All registered users      |
| PATCH  | /api/admin/users/{id}/deactivate | Deactivate a user       |

#### Review a loan
```http
POST /api/admin/loans/review
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{ "loanId": 3, "approved": true }

// To reject:
{ "loanId": 4, "approved": false, "rejectionReason": "Insufficient credit score" }
```

---

## Loan Eligibility Logic

| Rule                    | Criteria                                      |
|-------------------------|-----------------------------------------------|
| Minimum credit score    | ≥ 650                                         |
| Minimum annual income   | ≥ ₹1,20,000                                   |
| FOIR (EMI-to-income)    | EMI ≤ 50% of monthly income                  |
| Max loan amount         | Score ≥750 → 60× monthly income               |
|                         | Score 700-749 → 48× monthly income            |
|                         | Score 650-699 → 36× monthly income            |

## Interest Rates by Loan Type

| Loan Type       | Annual Rate |
|-----------------|-------------|
| Home Loan       | 8.5%        |
| Personal Loan   | 14.0%       |
| Car Loan        | 9.5%        |
| Education Loan  | 7.0%        |
| Business Loan   | 12.0%       |
| Gold Loan       | 9.0%        |

## EMI Formula

```
EMI = P × r × (1 + r)^n
      ─────────────────
         (1 + r)^n - 1

P = Principal amount
r = Monthly interest rate (annual rate / 12 / 100)
n = Tenure in months
```

---

## Deployment (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a MySQL plugin → copy the `DATABASE_URL`
4. Set environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://...
   SPRING_DATASOURCE_USERNAME=...
   SPRING_DATASOURCE_PASSWORD=...
   APPLICATION_SECURITY_JWT_SECRET_KEY=<your-base64-secret>
   ```
5. Railway auto-detects Maven and runs `mvn clean package`

---

## Creating an Admin User

After registering normally, run this SQL to promote a user to ADMIN:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## Next Steps — Phase 3 (Frontend)

- React + Vite + Tailwind CSS
- Pages: Login, Signup, Dashboard, Loan Application, EMI Tracker, Admin Panel
- Axios interceptors for JWT
- Protected routes with React Router
