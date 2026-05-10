# ⚖️ Legal Guard App

An AI-powered legal document analysis app that helps users understand contracts and legal documents — without needing a lawyer on speed dial.

🌐 **Live App:** [legal-guard-app.vercel.app](https://legal-guard-app.vercel.app)

---

## Features

- **Document Upload** — Supports PDF, TXT, and Word (.docx) files
- **AI Analysis** — Instant AI-powered insights into document content
- **Risk Assessment** — Identifies risky clauses and generates risk reports
- **Plain-English Summary** — Breaks down complex legal language into digestible summaries
- **AI Chat** — Ask follow-up questions about any document via a conversational interface
- **Analysis History** — Browse and revisit all past document analyses
- **User Profile** — Manage your account and preferences

---

## Project Structure

```
legal-guard-app/
├── backend/       # Node.js/TypeScript API server
└── mobile/        # Mobile/frontend app (TypeScript)
```

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | TypeScript, React (or React Native / Expo) |
| Backend  | Node.js, JavaScript/TypeScript    |
| Hosting  | Vercel                            |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/Learnerbypassion/legal-guard-app.git
cd legal-guard-app
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and add the required environment variables (API keys, database URL, etc.):

```env
PORT=5000
# Add your AI provider API key and any other config here
```

Start the backend server:

```bash
npm run dev
```

### 3. Set up the mobile/frontend app

```bash
cd ../mobile
npm install
npm start
```

---

## How It Works

1. **Upload** a contract or legal document (PDF, TXT, or Word)
2. The **AI engine analyzes** the content for key clauses, risks, and summaries
3. View the generated **risk report and plain-English insights**
4. **Chat with the AI** to ask follow-up questions about anything in the document



## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project does not currently specify a license. Please contact the repository owner for usage permissions.

---

## Author

**Learnerbypassion** — [github.com/Learnerbypassion](https://github.com/Learnerbypassion)
