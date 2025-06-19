# AgoraPay

**AgoraPay** is an open source marketplace for buying and selling code repositories securely, with native GitHub integration and PayPal payments.

## Features

- Secure authentication with GitHub (OAuth)
- Automatic repository synchronization
- Buy and sell repositories with automatic transfer
- Secure payments via PayPal (escrow)
- Code preview before purchase (syntax highlighting)
- Dashboard to manage uploaded, purchased, and transferred repositories
- User search and community repository exploration

## Project Structure

```
client/   # Frontend (Next.js, TypeScript, TailwindCSS)
server/   # Backend (Python, FastAPI)
```

## Installation

### Backend

1. Go to the `server/` folder:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Start the server:
   ```sh
   uvicorn app.main:app --reload
   ```

### Frontend

1. Go to the `client/` folder:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   pnpm install
   ```
3. Start the frontend:
   ```sh
   npm run dev
   # or
   pnpm dev
   ```

## Usage

- Access `http://localhost:3000` for the web interface.
- Log in with GitHub to start uploading, buying, or selling repositories.
- The dashboard lets you manage your repositories and explore those from other users.

## Useful Scripts

- Run backend tests:
  ```sh
  cd server
  python run_tests.py
  ```
- Run frontend tests:
  ```sh
  cd client
  npm run test
  ```

## Contributing

Contributions are welcome! Please open an issue or pull request.

## License

MIT

---

**AgoraPay** — Built with ❤️ for the developer