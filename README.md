# Quiz Connect

A modern, interactive quiz application built with React, Vite, and Tailwind CSS.

## Features

- **Interactive Quizzes**: Engaging quiz interfaces using React and modern state management.
- **Real-time Data**: Powered by Supabase for backend services and data storage.
- **Beautiful UI**: Built with Shadcn UI components, Radix UI, and Tailwind CSS for a fully responsive and accessible experience.
- **Data Visualization**: Recharts for displaying quiz results and statistics.
- **Animations**: Canvas Confetti and Tailwind Animations for delightful user interactions.

## Tech Stack

- **Frontend**: React (v18), TypeScript, Vite
- **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge
- **UI Components**: Shadcn UI (built on Radix UI primitives)
- **Routing**: React Router DOM
- **Data Fetching**: TanStack React Query
- **Backend/BaaS**: Supabase
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form, Zod

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone <YOUR_GIT_URL>
   cd quiz-connect-live
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with auto-reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Building for Production

To build the application for production, run:

```bash
npm run build
```
This will generate a `dist` folder with the optimized production build.

## Linting and Testing

- **Linting**: Run `npm run lint` to check for code quality issues using ESLint.
- **Testing**: Run `npm run test` to execute Vitest test suites. For watch mode, use `npm run test:watch`.
