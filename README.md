# Coffee-Shop

A full-stack mobile-style coffee shop application: React frontend + Node.js/Express backend with SQLite persistence and an AI barista powered by Google Gemini.

## Project Structure

- `app/`, `components/`, `store/`, `services/` – React frontend (Vite)
- `server/` – Express backend with SQLite (better-sqlite3)

## Backend Setup (server/)

1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and set your Gemini API key:
   ```
   cp .env.example .env
   ```
4. Seed the database (creates and populates SQLite tables):
   ```
   npm run seed
   ```
5. Start the backend server:
   ```
   npm run dev
   ```
   The API will be available at `http://localhost:4000`.

### API Endpoints

- `GET /api/products` – list all products
- `GET /api/products/:id` – get a single product
- `POST /api/checkout` – submit cart items and total, returns order id and points earned
- `GET /api/orders` – list past orders
- `GET /api/rewards?userId=guest` – get reward points for a user
- `POST /api/barista` – ask the AI barista for a recommendation
- `GET /api/health` – health check

## Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Set the backend URL (optional, defaults to `http://localhost:4000`):
   ```
   echo "VITE_API_URL=http://localhost:4000" >> .env.local
   ```
3. Run the app:
   ```
   npm run dev
   ```

The frontend communicates with the backend via `services/apiService.ts` for products, checkout, rewards, and the AI barista feature.
