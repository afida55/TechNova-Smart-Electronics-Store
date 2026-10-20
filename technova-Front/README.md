# TechNova — Frontend Design Prototype

A click-through **UI/UX design prototype** for the TechNova intelligent
electronics e-commerce platform, built with React + Vite + Tailwind CSS.

This is a design mockup — it demonstrates the six required pages, the extra
features from the project proposal, and the four AI-powered features. It is
not the final Vue.js + Spring Boot implementation; it exists to communicate
the intended UI/UX and interaction design before that build starts.

## Pages
- **Home** — catalog with nested category sidebar, price range, in-stock filter,
  sort (relevance / price / rating / newest), pagination, AI recommendation row
- **Login / Register** — tabbed auth with inline client-side validation
- **Product detail** — image gallery, spec sheet, rating breakdown, related
  products, AI Buying Advisor note
- **Shopping cart** — quantity controls, free-shipping threshold
- **Checkout** — multi-step simulated flow: shipping address -> payment method
  -> review -> confirmation with a generated order number
- **Order history** — status stepper (pending -> paid -> shipped -> completed)
  with an expandable tracking timeline per order
- **User profile** — editable name/email, address book
- **Wishlist** — save items for later from anywhere in the catalog

## Extra features from the proposal represented here
- Nested subcategories (mega-menu in the nav + sidebar tree)
- Keyword search with filtering and sorting
- Stock-aware "Add to cart" (disabled when out of stock, low-stock warning)
- Client-side form validation with inline error messages
- Order status tracking, visual in the order list and detail view
- Simulated checkout/payment flow (explicitly not a real payment gateway)
- Toast notifications for cart/wishlist/profile actions
- Responsive layout with a mobile nav drawer

## AI features represented in the UI
- **AI Product Search** — natural-language search bar, parsed-filter chip shown on results
- **AI Product Comparison** — the "Compare" tray + AI comparison modal (signature feature)
- **AI Product Recommendation** — "Recommended for you" row with reason tags
- **AI Customer Service** — floating chat widget, scoped to orders/returns/products

## Requirements
- Node.js 18+ and npm (Node 20 LTS recommended)

## How to run

### Option A — Terminal
```bash
npm install
npm run dev
```
Then open the URL it prints (usually http://localhost:5173).

### Option B — IntelliJ IDEA
1. File -> Open... and select this folder (technova-frontend).
2. Make sure Node.js is configured: Settings -> Languages & Frameworks -> Node.js.
3. Open the built-in terminal (Alt+F12) and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the printed local URL in your browser.

## Project structure
```
technova-frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                    # top-level state, routing, layout
    ├── index.css                  # Tailwind entrypoint
    ├── lib/
    │   ├── tokens.js               # color/type design tokens
    │   ├── data.js                 # mock catalog, categories, orders
    │   └── ToastContext.jsx        # toast notification system
    ├── components/
    │   ├── Primitives.jsx          # Pill, StockTag, Stars, Breadcrumb, ProductArt
    │   ├── NavBar.jsx               # responsive nav + category mega-menu
    │   ├── FilterSidebar.jsx        # category tree, price range, sort options
    │   ├── ProductCard.jsx
    │   ├── CompareTray.jsx          # compare tray + AI comparison modal
    │   └── ChatConsole.jsx          # AI customer service widget
    └── pages/
        ├── HomePage.jsx
        ├── AuthPage.jsx
        ├── ProductPage.jsx
        ├── CartPage.jsx
        ├── CheckoutPage.jsx
        ├── OrdersPage.jsx
        ├── ProfilePage.jsx
        └── WishlistPage.jsx
```

## Building for a static demo
```bash
npm run build
npm run preview
```
This produces a dist/ folder that can be shown from any static file server.
