# Asset Management System — Node.js Backend

Node.js + Express.js backend for the asset management system.

## Technology Stack

- Express.js 4.x
- Sequelize ORM
- jsonwebtoken + bcryptjs
- Tesseract.js
- PDFKit
- ExcelJS
- Nodemailer + Handlebars
- qrcode
- node-cron
- /api/actuator/health
- axios + Gemini REST API

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials, JWT secret, etc.
```

### 3. Create MySQL Database

```sql
CREATE DATABASE asset_management_db;
```

> **Note**: Tables are auto-created by Sequelize based on the model definitions.

### 4. Start Development Server

```bash
npm run dev
```

Server starts on: **http://localhost:8080**

### 5. Access API Documentation

Swagger UI: **http://localhost:8080/api/swagger-ui**

## Project Structure

```
backend-node/
├── server.js              # Express app entry point
├── src/
│   ├── config/
│   │   ├── database.js    # Sequelize connection
│   │   ├── env.js         # Environment variables
│   │   ├── mailer.js      # Nodemailer transport
│   │   └── swagger.js     # OpenAPI documentation
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication middleware
│   │   ├── rbac.js        # Role-based access control
│   │   └── errorHandler.js # Global error handler
│   ├── models/            # Sequelize models
│   │   ├── index.js       # Model associations
│   │   ├── Asset.js
│   │   ├── Employee.js
│   │   ├── User.js
│   │   └── ...
│   ├── routes/            # Express routers
│   │   ├── auth.js
│   │   ├── assets.js
│   │   ├── allocations.js
│   │   ├── maintenance.js
│   │   ├── vendors.js
│   │   ├── reports.js
│   │   ├── ai.js
│   │   ├── ocr.js
│   │   └── ...
│   ├── services/          # Business logic
│   │   ├── authService.js
│   │   ├── assetService.js
│   │   ├── allocationService.js
│   │   ├── maintenanceService.js
│   │   ├── aiService.js
│   │   ├── ocrService.js
│   │   ├── reportService.js
│   │   └── ...
│   ├── scheduler.js       # Cron jobs
│   └── utils/             # Helpers
│       ├── jwtUtils.js
│       ├── qrCodeGenerator.js
│       ├── depreciationCalculator.js
│       ├── assetTagGenerator.js
│       └── ...
```

## API Endpoints

All endpoints are prefixed with `/api/`.

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/change-password` | Change password |
| GET  | `/auth/profile` | Get profile |

### Assets
| Method | Path | Description |
|--------|------|-------------|
| GET | `/assets` | List assets |
| POST | `/assets` | Create asset |
| GET | `/assets/stats` | Status counts |
| GET | `/assets/:id` | Get asset |
| PUT | `/assets/:id` | Update asset |
| DELETE | `/assets/:id` | Deactivate asset |
| GET | `/assets/:id/movements` | Movement history |

### Allocations
| Method | Path | Description |
|--------|------|-------------|
| POST | `/allocations/assign` | Assign to employee |
| POST | `/allocations/:id/return` | Return asset |
| POST | `/allocations/:id/transfer` | Transfer to another employee |
| GET | `/allocations` | List allocations |
| GET | `/allocations/:id` | Get allocation |
| GET | `/allocations/asset/:assetId` | By asset |
| GET | `/allocations/employee/:empId` | By employee |

### AI Chat
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/chat` | Natural language query |
| GET | `/ai/history` | Chat history |

### OCR
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ocr/scan` | Extract invoice data from image/PDF |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| GET | `/reports/assets?format=pdf\|excel` | Asset report |
| GET | `/reports/maintenance?format=pdf\|excel` | Maintenance report |
| GET | `/reports/warranty?format=pdf\|excel&days=30` | Warranty report |
| GET | `/reports/depreciation?format=pdf\|excel&financialYear=2025-26` | Depreciation report |

## Background Jobs (Schedulers)

| Job | Cron | Description |
|-----|------|-------------|
| Warranty alerts | `0 8 * * *` IST | Daily warranty expiry alerts |
| Health score recalculation | `0 2 * * *` IST | Daily health score recalculation |
| Annual depreciation | `0 3 1 4 *` IST | Annual depreciation (April 1 each year) |

## Environment Variables

See [.env.example](.env.example) for all configuration options.

## Notes

- **Database schema**: Sequelize models define the MySQL schema used by the application.
- **Gemini AI**: Set `GEMINI_API_KEY` in `.env` to enable full AI responses. Without it, rule-based fallback responses are used.
- **OCR**: Tesseract.js downloads language models on first use (~6MB). Requires internet connection on first run.
