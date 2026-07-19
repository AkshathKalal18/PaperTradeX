# 📈 PaperTradeX

> **Paper trading platform** — Practice stock trading risk-free with real-time simulated price data, candlestick charts, AI advisor, and a full portfolio management system.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen?style=flat-square&logo=spring)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat-square&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript)

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 Auth | JWT-based login & registration |
| 📊 Dashboard | Live portfolio summary, watchlist, market overview |
| 💼 Portfolio | Cash balance, holdings with P&L tracking |
| 📈 Stock Details | Candlestick charts (lightweight-charts v5), buy/sell widget |
| 🛒 Orders | Market & limit order execution, full transaction history |
| 👀 Watchlist | Add/remove stocks to watchlist |
| 📰 News | AI-summarized financial news feed |
| 🤖 AI Advisor | OpenAI-powered chat assistant for trading insights |
| 🛡️ Admin | User management & global transaction viewer |

---

## 🏗️ Architecture

```
papertradex/
├── src/                    # Spring Boot backend (Java 21)
│   └── main/java/com/papertradex/
│       ├── controller/     # REST controllers
│       ├── service/        # Business logic
│       ├── entity/         # JPA entities
│       ├── repository/     # Spring Data JPA repos
│       ├── security/       # JWT filter, UserDetailsService
│       ├── dto/            # Request/Response DTOs
│       └── config/         # Security, CORS, DataInitializer
├── frontend/               # React 19 + Vite + TypeScript
│   └── src/
│       ├── pages/          # Route-level components
│       ├── components/     # Shared UI components
│       ├── services/       # Axios API client
│       └── context/        # Auth context
└── docs/                   # Postman collection & API docs
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Java | 21+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |

---

### 1️⃣ Clone & Navigate

```bash
git clone <repo-url>
cd papertradex
```

### 2️⃣ Start the Backend

```bash
# Windows — double-click or run:
start-backend.bat

# Or manually with Maven
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

> **H2 Console**: http://localhost:8080/api/h2-console  
> JDBC URL: `jdbc:h2:mem:papertradex`  
> Username: `sa` | Password: *(empty)*

### 3️⃣ Start the Frontend

```bash
# Windows — double-click or run:
start-frontend.bat

# Or manually
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**

### 4️⃣ Start Both Together

```bash
# Windows PowerShell
.\start-all.bat
```

---

## ⚙️ Configuration

### Backend — `src/main/resources/application.yml`

| Property | Default | Description |
|---|---|---|
| `server.port` | `8080` | Backend port |
| `app.jwt.secret` | Base64 encoded | JWT signing key |
| `app.jwt.expiration-ms` | `86400000` (24h) | Token lifetime |
| `spring.datasource.url` | H2 in-memory | Database URL |

### Environment Variables (override defaults)

```bash
JWT_SECRET=your-base64-encoded-secret
JWT_EXPIRATION_MS=86400000
OPENAI_API_KEY=sk-...          # Required for AI Advisor
NEWS_API_KEY=your-key          # Optional — for live news feed
```

### Using MySQL Instead of H2

Run with the `mysql` Spring profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

Defaults: `jdbc:mysql://localhost:3306/papertradex` | user: `root` | pass: `root`

---

## 🌐 API Overview

Base URL: `http://localhost:8080/api`

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
```

### Auth & Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new user + auto-portfolio |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| GET | `/users/me` | ✅ | Get current user's profile |

### Stocks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stocks` | ❌ | List all stocks (with optional `?q=...`) |
| GET | `/stocks/{symbol}` | ❌ | Individual stock details |
| GET | `/stocks/{symbol}/candles` | ❌ | Generated daily candlestick data |
| GET | `/stocks/market/gainers` | ❌ | Top 5 gainers of the day |
| GET | `/stocks/market/losers` | ❌ | Top 5 losers of the day |

### Portfolio & Holdings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/portfolios` | ✅ | List user's active portfolios |
| GET | `/portfolios/{portfolioId}` | ✅ | Full details of a portfolio |
| GET | `/portfolios/{portfolioId}/holdings` | ✅ | Holdings inside a portfolio |

### Orders & Transactions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | ✅ | Place a BUY or SELL (Market/Limit) order |
| GET | `/orders` | ✅ | Global user order history |
| GET | `/orders/portfolio/{portfolioId}` | ✅ | Get order history of a specific portfolio |

### Watchlist
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/watchlist` | ✅ | Retrieve user's watchlist |
| POST | `/watchlist/{symbol}` | ✅ | Add a stock symbol to watchlist |
| DELETE | `/watchlist/{symbol}` | ✅ | Remove a stock symbol from watchlist |

### AI & News
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/chat` | ✅ | Talk with local simulated AI Advisor |
| GET | `/news` | ❌ | Simulated financial news feed |

### Admin (ROLE_ADMIN required)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | ✅ Admin | Global platform stats |
| GET | `/admin/users` | ✅ Admin | List all user records |
| GET | `/admin/transactions` | ✅ Admin | List all platform transactions |
| PUT | `/admin/users/{userId}/role` | ✅ Admin | Toggle/assign user role |

---

## 👤 Default Seeded Data

On first startup, the following accounts are created automatically:

| Email | Password | Role |
|---|---|---|
| `admin@papertradex.com` | `adminpassword` | ADMIN |
| `user@papertradex.com` | `userpassword` | USER |

And **8 stocks** are seeded with simulated live price data (prices update every 5 seconds on the backend).


---

## 🎨 Frontend Pages

| Route | Page |
|---|---|
| `/` | Landing / Login redirect |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Main dashboard |
| `/portfolio` | Portfolio & holdings |
| `/transactions` | Order history |
| `/stocks/:symbol` | Stock detail + chart + trade |
| `/news` | News feed |
| `/ai` | AI trading advisor |
| `/admin` | Admin dashboard (admin only) |

---

## 📷 Screenshots

> *Screenshots placeholder section. Live application UI images will be added here.*

| Dashboard | Stock Details |
|---|---|
| ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Dashboard+UI) | ![Stock Details Placeholder](https://via.placeholder.com/400x250?text=Stock+Details+UI) |

| Watchlist | AI Advisor Chat |
|---|---|
| ![Watchlist Placeholder](https://via.placeholder.com/400x250?text=Watchlist+UI) | ![AI Advisor Placeholder](https://via.placeholder.com/400x250?text=AI+Advisor+UI) |

---


## 📦 Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.4.1**
- **Spring Security** + JWT (io.jsonwebtoken)
- **Spring Data JPA** + H2 (dev) / MySQL (prod)
- **Maven** build

### Frontend
- **React 19** + **TypeScript 6**
- **Vite 8** (build tool)
- **React Router DOM v7**
- **Axios** (HTTP client with JWT interceptor)
- **Tailwind CSS v4** (styling)
- **lightweight-charts v5** (candlestick charts)
- **Recharts** (portfolio charts)
- **Framer Motion** (animations)
- **Lucide React** (icons)

---

## 🧪 Running Tests

```bash
# Backend tests
mvn test

# Frontend type check
cd frontend
npx tsc --noEmit
```

---

## 📮 Postman Collection

Import `docs/PaperTradeX.postman_collection.json` into Postman to get all API endpoints pre-configured.

The collection includes:
- Auto-extracted JWT token after login (saved as `{{token}}` variable)
- Environment variables: `{{base_url}}` = `http://localhost:8080/api`

---

## 🔮 Future Enhancements

- 📈 **Real-time WebSockets**: Integrate WebSockets for live stock price updates without polling.
- 📱 **Mobile Application**: Build a cross-platform mobile app using React Native.
- 🏆 **Leaderboards**: Introduce user leaderboards and social features to compare trading performance.
- 🤖 **Advanced AI Analytics**: Enhance the AI advisor with deep portfolio analysis and automated trading suggestions.
- 💵 **Multi-currency Support**: Support portfolios and trading in multiple global currencies.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
