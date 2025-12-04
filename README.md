# Global SIM Connect Ultimate 🌍

A collaborative, community-driven database for worldwide mobile operators and SIM plans. This Progressive Web App (PWA) helps travelers find the best connectivity options, calculate data needs, and get AI-powered advice.

## ✨ Features

- **Collaborative Database**: Users can contribute new operators and SIM plans.
- **Trip Calculator**: Estimate data usage based on daily habits (video, maps, social media).
- **AI Voice Advisor**: Ask questions verbally and receive audio advice powered by **Google Gemini 2.5 Flash TTS**.
- **Plan Comparison**: Visualize and compare plan efficiency (Price vs. Data) using charts.
- **Gamification**: Earn points and badges by contributing data (Mock backend currently).
- **Mobile First**: Fully responsive design optimized for iOS and Android.

## 🛠 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`gemini-2.5-flash-preview-tts`)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/global-sim-connect.git
   cd global-sim-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your API Key:
   ```env
   VITE_API_KEY=your_google_gemini_api_key_here
   ```
   *(Note: The app currently checks `process.env.API_KEY` for the preview environment. Ensure your build setup defines this variable).*

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## 📱 Mobile Usage

This app is PWA-ready.
- **iOS**: Open in Safari -> Share -> Add to Home Screen.
- **Android**: Open in Chrome -> Add to Home Screen.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
