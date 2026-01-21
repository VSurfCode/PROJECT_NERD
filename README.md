# NerdHerd Tech Repair

A modern, interactive website for NerdHerd Tech Repair - a computer repair business that helps customers fix their tech issues with a touch of humor and AI-powered assistance.

## What It Does

NerdHerd Tech Repair is a full-featured web application that allows customers to:
- **Book repair services** through an intuitive booking system
- **Get free AI-powered tech diagnoses** via an interactive chatbot
- **View services** including virus removal, hardware repair, gaming PC optimization, and more
- **Submit repair requests** with detailed device information
- **Access admin dashboard** to manage repair requests (for business owners)

## Tech Stack

### Frontend
- **React 18.3.1** with **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **HeroUI** - Component library
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization (pie charts for stats)

### Backend & Database
- **Firebase Firestore** - NoSQL database for storing repair requests and diagnoses
- **Firebase Analytics** - User analytics tracking

### APIs
- **OpenAI API** (GPT-3.5-turbo) - Powers the AI chatbot "Nerdy McBotface"
- **OpenAI Moderation API** - Content filtering for user inputs

### Deployment
- **Vercel** - Hosting and deployment platform

## Notable Features

### AI-Powered Chatbot
- Interactive tech diagnosis assistant powered by OpenAI
- Contextual question-asking to diagnose issues
- Content moderation for safe interactions
- Saves conversation history to Firestore

### Booking & Request System
- Multi-step diagnosis form with smooth animations
- Booking modal for quick repair requests
- Contact form with validation
- All requests saved to Firebase Firestore

### Modern UI/UX
- Fully responsive design (mobile-first approach)
- Smooth animations with Framer Motion
- Interactive pie charts showing repair statistics
- Gradient designs and modern card layouts
- Dark/light theme support (via HeroUI)

### Admin Dashboard
- View all repair requests in a table format
- View detailed request information
- Delete requests functionality
- Real-time data from Firestore

### Data Visualization
- Animated pie charts showing repair statistics
- Responsive charts using Recharts

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd PROJECT_NERD
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Preview production build:
```bash
npm run preview
```

### Setup pnpm (optional)

If you are using `pnpm`, add the following to your `.npmrc` file:
```
public-hoist-pattern[]=*@heroui/*
```

Then run `pnpm install` again.

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── BookingModal.tsx
│   ├── navbar.tsx
│   └── ...
├── config/         # Configuration files
│   ├── firebase.ts
│   └── site.ts
├── layouts/        # Layout components
│   └── default.tsx
├── pages/          # Page components
│   ├── index.tsx      # Home page
│   ├── diagnosis.tsx  # Diagnosis form
│   ├── chatbot.tsx    # AI chatbot
│   ├── admin.tsx      # Admin dashboard
│   └── ...
├── styles/         # Global styles
└── types/          # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with auto-fix

## Deployment

The project is configured for deployment on Vercel. The `vercel.json` file handles routing configuration.

## License

Licensed under the [MIT license](LICENSE).
