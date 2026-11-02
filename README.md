# Expense Tracker App

A modern, mobile-first expense tracking application built for students to manage daily spending efficiently. The app is designed to be simple, fast, and convenient on mobile devices, with a clean dashboard, analytics, and expense history.

## Overview

This project helps users track where their money goes, monitor spending patterns, and understand monthly expenses through a clear and responsive interface. It is built as a Progressive Web App (PWA), making it installable on mobile devices and easy to use like a native app.

## Features

- Dashboard with monthly and daily totals
- Quick-add expense shortcuts for common categories
- Smart expense entry with category-based suggestions
- Detailed expense history with filtering
- Spending analytics with charts
- Dark mode support
- Mobile-friendly UI optimized for smartphones
- Firebase-powered real-time data sync
- Progressive Web App support for installability

## Tech Stack

- React
- Vite
- Tailwind CSS
- Firebase Firestore
- Firebase Authentication
- Recharts
- Lucide React
- Vite PWA Plugin

## Project Structure

```bash
.
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── QUICKSTART.md
├── tailwind.config.js
├── vite.config.js
├── README.md
└── vercel.json
```

## Prerequisites

Before running this app, make sure you have:

- Node.js 18 or newer
- npm or yarn
- A Firebase project

## Installation

1. Clone the repository:

```bash
git clone <your-repository-url>
cd expense-tracker-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a Firebase project:

- Go to the Firebase Console
- Create a new project
- Enable Firestore Database
- Enable Authentication and allow Anonymous sign-in
- Copy the Firebase configuration values

4. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update the values in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Run the App

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Firebase Setup

### Firestore Rules

Use rules similar to the following in Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create, update: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firestore Indexing

For best performance, make sure your Firestore indexes support queries using:

- `userId`
- `timestamp`

## How It Works

- Users sign in anonymously through Firebase Authentication
- Expenses are stored in Firestore under the authenticated user ID
- The dashboard reads live expense data and updates automatically
- Charts display spending trends by category and date
- Historical entries are filtered and displayed in the History view

## Usage

1. Open the app in the browser
2. Add expense entries from the dashboard
3. View spending insights in the analytics tab
4. Review previous transactions in the history tab
5. Install the app to your home screen for a native-like experience

## Deployment

This project is ready to be deployed to platforms such as:

- Vercel
- Firebase Hosting
- Netlify

This project includes `vercel.json` and is already configured for Vercel deployments.

If this repository is already deployed, add your live URL here:

- Live App: `https://expense-tracker-v1-six.vercel.app/`

## License

This project is open for personal and educational use.

## Contributing

Contributions are welcome. If you want to improve the app, feel free to fork the repository and submit a pull request.

## Author

Built for students who want to better understand and manage their spending habits.

