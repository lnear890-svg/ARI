# Development Guide

## Setup Environment

### 1. Prerequisites
- Node.js 16+
- npm 7+ or yarn 3+
- Git
- Firebase CLI

### 2. Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new Firebase project at https://console.firebase.google.com
# Copy project credentials
```

### 3. Clone & Install

```bash
git clone https://github.com/lnear890-svg/ARI.git
cd ARI
npm install
```

## Project Structure

### Frontend Development

```bash
cd frontend
npm run dev  # Start dev server on http://localhost:3000
```

### Backend Development

```bash
cd backend
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev  # Start on http://localhost:3001
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Work on frontend or backend
# Follow TypeScript strict mode
# Write tests for new features
```

### 3. Commit
```bash
git add .
git commit -m "feat: add your feature description"
```

### 4. Push & Create PR
```bash
git push origin feature/your-feature-name
# Open Pull Request on GitHub
```

## Code Style

### ESLint Configuration
- Extends: `eslint:recommended`, `typescript-eslint/recommended`
- Max line length: 100
- Indent: 2 spaces
- Quotes: Single quotes

### Prettier Configuration
- Print width: 100
- Tab width: 2
- Use tabs: false
- Trailing comma: es5

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Debugging

### Frontend
- Use React DevTools
- Browser DevTools Console
- Redux DevTools for state management

### Backend
```bash
# With Node Inspector
node --inspect-brk dist/index.js

# Then open chrome://inspect in Chrome
```

## Common Issues

### Port Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Firebase Connection Issues
- Check .env credentials
- Verify Firebase project is active
- Check network connectivity

### WebRTC Connection Failed
- Check STUN/TURN server configuration
- Verify firewall settings
- Check browser console for errors
