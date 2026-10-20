# TechNova – Smart Electronics Store

An AI-powered electronics e-commerce platform built with React, Spring Boot, and MySQL. TechNova combines online shopping functionality with AI-assisted product discovery, comparison, and customer support.

## Overview

TechNova is a full-stack web application designed to provide a convenient shopping experience for electronic products. It includes customer shopping features, administrative management tools, and AI-powered assistance.

## Features

### Customer Features
- **Product Catalog:** Browse electronics and explore product details.
- **Search and Filtering:** Find products using available search and filtering options.
- **Shopping Cart:** Add products and manage quantities.
- **Checkout and Orders:** Place orders and view order information.
- **Wishlist:** Save products for later.
- **Product Comparison:** Compare electronic products to support purchasing decisions.
- **AI Shopping Assistant:** Interact with an AI assistant for product-related questions and shopping guidance.
- **User Accounts:** Register, log in, and manage profile information.
- **Store Location:** View store location information.

### AI Features
- AI-assisted product questions and shopping guidance.
- Product comparison assistance.
- Integration with the DeepSeek API for AI-powered responses.

### Administration
- Dashboard and sales information.
- Product and category management.
- Order management.
- User management.
- Store settings management.
- Customer contact message management.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, JavaScript |
| Styling | Tailwind CSS, CSS |
| Backend | Java 17, Spring Boot 3.2.5 |
| Database | MySQL 8.0 |
| Database Access | MyBatis |
| Authentication | JWT, BCrypt |
| AI Integration | DeepSeek API |
| Maps | AMap JavaScript API |

## Project Structure

```text
TechNova-Smart-Electronics-Store/
├── technova-Front/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── technova-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── init.sql
│   └── pom.xml
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- JDK 17
- MySQL 8.0
- Maven, or use the Maven wrapper if available

### 1. Clone the Repository

```bash
git clone https://github.com/afida55/TechNova-Smart-Electronics-Store.git
cd TechNova-Smart-Electronics-Store
```

### 2. Configure the Database

1. Start your MySQL server.
2. Create the database named `shop`.
3. Execute the database initialization script at `technova-backend/init.sql` if it matches your current database setup.
4. Configure the database connection settings for the backend.

The backend uses these environment variables:

```text
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_long_random_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
```

Set the variables in your local environment or your IDE's run configuration. Use your own credentials; do not commit real secrets to GitHub.

### 3. Run the Backend

Open a terminal in the backend directory:

```bash
cd technova-backend
mvn spring-boot:run
```

The frontend API configuration currently targets `http://localhost:8080/api`.

### 4. Configure and Run the Frontend

Open another terminal:

```bash
cd technova-Front
npm install
```

Create a local `.env` file in `technova-Front/` and configure the AMap credentials required by the map integration:

```text
VITE_AMAP_KEY=your_amap_key
VITE_AMAP_SECURITY_CODE=your_amap_security_code
```

Then start the development server:

```bash
npm run dev
```

Open the local URL printed in your terminal by Vite.

**Security note:** Keep `.env` files, API keys, database passwords, and production secrets out of version control. The repository's `.gitignore` should exclude local environment files.

## Future Improvements

Potential areas for further development include:

- Retrieval-Augmented Generation (RAG) for product knowledge and after-sales questions.
- Personalized recommendations using browsing and purchase history.
- AI-based review sentiment analysis and review summaries.
- Coupon and promotional campaign management.
- Expanded product catalog and improved pagination.

## Author

**Aktar Most Afida**  
Software Engineering Student  
Chengdu Neusoft University, China

## Repository

[View TechNova on GitHub](https://github.com/afida55/TechNova-Smart-Electronics-Store)
