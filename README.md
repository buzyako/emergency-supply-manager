# 🛡️ Emergency Supply Manager

A comprehensive, spiritually-grounded emergency preparedness system built with Next.js, featuring daily inspirational quotes, progress tracking, and Philippines-specific hazard awareness.

## ✨ Features

### 🙏 Spiritual Foundation
- **Daily Inspirational Quotes**: Rotating quotes from LDS sources (D&C, Alma, Church leaders)
- **Faith-Based Guidance**: LDS principles integrated throughout
- **Scriptural Foundation**: Doctrine & Covenants and Book of Mormon quotes

### 👥 Multi-User Personalization
- **Individual Data Storage**: Each phone stores personal data locally
- **No Account Required**: Just open the URL on any device
- **Complete Privacy**: No data sharing between users
- **Personalized Experience**: Custom progress tracking per user
- **Offline Functionality**: Works without internet on each device

### 📊 Comprehensive Preparedness Tracking
- **7 Categories**: Food, Water, Financial, Communication, Spiritual, Emergency Kit, Go Bags
- **Progress Visualization**: Real-time progress bars and percentages
- **Milestone System**: 9 predefined preparedness goals
- **Smart Calculations**: Automatic progress calculation

### ✅ Emergency Kit Check
- **25+ Essential Items**: Comprehensive checklist by category
- **Categories**: Food, Water, Shelter, Communication, Medical, Tools
- **Philippines-Specific**: N95 masks, safety goggles, work gloves
- **Progress Tracking**: Overall and essential-only progress

### 🇵🇭 Philippines-Specific Features
- **4 Major Hazards**: Typhoon, Earthquake, Flood, Volcanic Eruption
- **Seasonal Awareness**: Current season hazard display
- **Preparation Tips**: Specific guidance for each hazard
- **Regional Recommendations**: Tailored for Philippine conditions

### 📱 Progressive Web App (PWA)
- **Mobile Installation**: Add to home screen like a native app
- **Offline Support**: Works without internet connection
- **Touch Optimized**: Perfect for mobile devices
- **Responsive Design**: Adapts to all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/emergency-supply-manager.git
cd emergency-supply-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📱 Mobile Installation

### Method 1: Direct PWA Installation
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Tap "Install" to add to home screen
4. App works completely offline!

### Method 2: Create APK
1. Use TWA Builder: https://www.twa-builder.com/
2. Enter your app URL
3. Generate and download APK
4. Install on your mobile device

## 👥 Multi-User Setup

### Individual User Experience
- **📱 Each Phone**: Gets its own personalized app experience
- **🔒 Data Privacy**: Personal data stored locally on each device
- **🌐 Same URL**: All users access the same deployment
- **💾 No Cloud**: No server or database required
- **⚡ Instant**: No setup or registration needed

### Family/Community Usage
- **👨‍👩‍👧‍👦 Family**: Each member tracks their own preparedness
- **🏘️ Community**: Individual families manage their supplies
- **👥 Church Group**: Members track personal emergency readiness
- **🏢 Workplace**: Employees manage individual emergency kits

## 🏠 Self-Hosting

### Docker Deployment
```bash
# Build and start with Docker
docker-compose up --build -d
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🎯 Key Components

### Spiritual Features
- **Daily Quotes**: 10 rotating inspirational quotes
- **Progress Tracking**: Visual preparedness monitoring
- **Milestone System**: Achievable preparedness goals
- **Faith Integration**: LDS principles throughout

### Preparedness Tools
- **Emergency Kit Check**: 25+ essential items checklist
- **Philippines Hazards**: Typhoon, earthquake, flood awareness
- **Progress Visualization**: Real-time preparedness tracking
- **Offline Functionality**: Works without internet

## 📊 Technical Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **PWA**: Service Worker, Manifest
- **Storage**: LocalStorage for offline data

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Project Structure
```
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utilities and types
├── public/             # Static assets
├── scripts/            # Deployment scripts
└── mobile-package/     # Mobile-ready static files
```

## 📱 Mobile Features

### PWA Capabilities
- **Offline Support**: Works without internet
- **Home Screen Icon**: Looks like a native app
- **Background Sync**: Updates when online
- **Push Notifications**: Can receive alerts

### Mobile Optimization
- **Touch-Friendly**: Large buttons and touch targets
- **Swipe Navigation**: Natural mobile gestures
- **Pull-to-Refresh**: Refresh data by pulling down
- **Responsive Design**: Perfect on all devices

## 🙏 Spiritual Integration

### Daily Inspiration
- **Scriptural Quotes**: D&C, Alma, Church leaders
- **Categories**: Preparation, Faith, Self-Reliance, Encouragement
- **Daily Rotation**: Fresh motivation every day
- **Beautiful Display**: Glassmorphism design

### Faith-Based Preparedness
- **LDS Principles**: Self-reliance and preparation
- **Scriptural Foundation**: Doctrine & Covenants guidance
- **Spiritual Motivation**: Faith-based emergency readiness
- **Community Focus**: Family and community preparedness

## 🇵🇭 Philippines Features

### Regional Hazards
- **Typhoon Preparedness**: June-November season awareness
- **Earthquake Readiness**: Year-round preparation
- **Flood Safety**: Monsoon season guidance
- **Volcanic Awareness**: Ash fall protection

### Local Adaptation
- **Regional Food Storage**: Philippines-specific recommendations
- **Emergency Numbers**: Local emergency services
- **Cultural Context**: Filipino family preparedness
- **Language Support**: English with local context

## 📈 Progress Tracking

### Preparedness Categories
- **Food Storage**: 3-day to 3-month supplies
- **Water Supply**: 1 gallon per person per day
- **Financial**: Emergency fund tracking
- **Communication**: Family communication plans
- **Spiritual**: Spiritual preparedness
- **Emergency Kit**: Essential supplies
- **Go Bags**: Evacuation readiness

### Milestone System
- **3-Day Supply**: Basic emergency readiness
- **1-Week Supply**: Short-term preparedness
- **1-Month Supply**: Extended emergency readiness
- **3-Month Supply**: Long-term preparedness
- **Financial Goals**: Emergency fund milestones
- **Communication Plans**: Family coordination
- **Spiritual Goals**: Faith-based preparedness

## 🔒 Security & Privacy

- **Local Storage**: All data stored locally on device
- **No Cloud Dependencies**: Works completely offline
- **Privacy First**: No data collection or tracking
- **Secure**: HTTPS and security headers
- **Multi-User Privacy**: Each device has isolated data storage
- **No Data Sharing**: Personal information stays on individual devices

## 📞 Support

### Documentation
- **Self-Hosting Guide**: `SELF_HOSTING_GUIDE.md`
- **Mobile Installation**: `MOBILE_INSTALLATION_GUIDE.md`
- **Deployment Guide**: `DEPLOYMENT.md`

### Features
- **Daily Spiritual Quotes**: Fresh inspiration every day
- **Progress Tracking**: Visual preparedness monitoring
- **Emergency Kit Check**: Comprehensive checklist
- **Philippines Hazards**: Regional awareness
- **Offline Functionality**: Works without internet
- **Mobile Installation**: Native app experience

## 🎉 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LDS Church**: For spiritual guidance and preparedness principles
- **Philippines Government**: For regional hazard information
- **Emergency Preparedness Community**: For best practices and guidance

---

**Emergency Supply Manager - Preparedness through Faith and Technology** 🛡️✨