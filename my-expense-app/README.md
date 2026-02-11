# Student Expense Tracker 💰

A mobile-first Progressive Web App (PWA) designed for university students to track daily expenses, optimized for iPhone use.

## Features ✨

- **Quick Expense Tracking**: Fast entry with category shortcuts (Food 🍔, Grocery 🛒, Bike 🏍️)
- **Smart Suggestions**: Frequently used reasons are suggested automatically
- **Visual Analytics**: 
  - Daily spending bar charts
  - Category-wise pie charts
  - Monthly spending overview
- **Transaction History**: 
  - Filter by date range
  - Filter by category
  - Delete functionality
- **Dark Mode**: Full dark mode support with smooth transitions
- **PWA Ready**: Install on your iPhone home screen for app-like experience
- **Offline Ready**: Works offline with service worker caching

## Tech Stack 🛠️

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Firebase (Firestore + Auth)
- **PWA**: vite-plugin-pwa

## Setup Instructions 🚀

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Start with default rules (we'll update them)
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Anonymous** authentication
4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click on the web app icon (</>)
   - Copy the config values

5. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

6. Add your Firebase credentials to `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Security Rules

Update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expense} {
      allow read, write: if request.auth != null && 
                         request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production 📦

```bash
npm run build
npm run preview
```

## Deployment 🌐

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Add environment variables in Vercel dashboard

### Deploy to Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login and initialize: `firebase login && firebase init hosting`
3. Build and deploy: `npm run build && firebase deploy`

## Installing on iPhone 📱

1. Open the deployed app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. The app icon will appear on your home screen!

## Usage Guide 📖

### Adding an Expense

1. **Quick Add**: Tap one of the three quick category buttons (Food, Grocery, Bike)
2. **Custom Add**: Tap "Add Expense" button for full category selection
3. Fill in: Amount (in LKR), Category, Reason
4. Tap "Save"

### Viewing Analytics

- Tap the "Analytics" tab at the bottom
- Switch between "This Month" and "Last Month"
- View daily spending bar chart and category distribution pie chart

### Managing History

- Tap the "History" tab
- Use filters to change date range or filter by category
- Tap delete icon to remove expenses

### Dark Mode

Tap the moon/sun icon in the bottom navigation to toggle dark mode.

## Project Structure 📁

```
my-expense-app/
├── src/
│   ├── components/      # Reusable components
│   ├── context/        # React context providers
│   ├── pages/          # Main page components
│   ├── utils/          # Utility functions & Firebase config
│   └── App.jsx         # Main app component
├── .env.example        # Environment variables template
├── tailwind.config.js  # Tailwind configuration
└── vite.config.js      # Vite + PWA configuration
```

## Troubleshooting 🔧

### Firebase Connection Issues
- Check that all environment variables are set correctly
- Verify Firebase project has Firestore and Auth enabled
- Check browser console for specific error messages

### PWA Not Installing on iPhone
- Ensure you're using Safari (not Chrome)
- The app must be served over HTTPS (works in production)

## Future Enhancements 🚀

- [ ] Monthly budget setting and tracking
- [ ] Income tracking
- [ ] Export data to CSV/Excel
- [ ] Receipt photo upload
- [ ] Recurring expenses

---

Made with ❤️ for students tracking their expenses!

