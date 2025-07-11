# 🌤️ Weather Glass

A beautiful glassmorphic weather application inspired by Carrot Weather, built with Next.js, TypeScript, Tailwind CSS, and Tanstack Query.

![Weather Glass App](https://img.shields.io/badge/Status-Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8)

## ✨ Features

### 🎨 Beautiful Glassmorphic Design
- **Dynamic Backgrounds**: Weather condition-based gradient backgrounds that change based on current weather
- **Glass Morphism**: Stunning frosted glass effects with blur and transparency
- **Smooth Animations**: Floating weather icons, shimmer loading effects, and smooth transitions
- **Responsive Design**: Looks beautiful on all device sizes

### 🌤️ Comprehensive Weather Data
- **Current Weather**: Real-time temperature, feels-like, weather conditions with emojis
- **Detailed Metrics**: Humidity, pressure, UV index, wind speed/direction, visibility
- **Hourly Forecast**: Next 12 hours with temperature, precipitation chance, and wind
- **7-Day Forecast**: Extended forecast with high/low temperatures and conditions
- **Weather Alerts**: Displays any active weather warnings or alerts
- **Sunrise/Sunset**: Beautiful sunrise and sunset time display

### 🎭 Carrot Weather Inspired Features
- **Sarcastic Comments**: Randomly generated witty weather commentary based on conditions
- **Weather Emojis**: Beautiful emoji representations for all weather conditions
- **Location Detection**: Automatic location detection with reverse geocoding for city names

### 🛠️ Technical Excellence
- **Tanstack Query**: All data fetching uses proper query patterns with caching and error handling
- **TypeScript**: Fully typed for better development experience and reliability
- **Performance**: Optimized with proper loading states, error boundaries, and efficient re-renders
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Theme Support**: Light/dark mode toggle with glassmorphic theme toggle button

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd next-weather
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_WEATHERKEY=your_openweathermap_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env.local` file

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main weather page with dynamic backgrounds
│   └── providers.tsx       # Tanstack Query and theme providers
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── CurrentWeather.tsx  # Main weather display
│   ├── HourlyForecast.tsx  # 12-hour forecast component
│   ├── DailyForecast.tsx   # 7-day forecast component
│   ├── WeatherAlerts.tsx   # Weather alerts/warnings
│   └── ThemeToggle.tsx     # Glassmorphic theme toggle
├── lib/
│   ├── hooks/
│   │   ├── useUserLocation.ts  # Location detection with Tanstack Query
│   │   ├── useWeatherData.ts   # Weather API calls with Tanstack Query
│   │   └── useCityName.ts      # City name resolution with Tanstack Query
│   ├── formatters.ts       # Weather utilities and Carrot Weather comments
│   └── utils.ts           # General utilities
└── styles/
    └── globals.css        # Glassmorphic styles and animations
```

## 🎨 Design System

### Background Themes
- **Sunny**: Blue to orange gradient
- **Cloudy**: Gray gradient with purple accents
- **Rainy**: Blue to dark gradient
- **Snowy**: Purple to pink gradient
- **Night**: Dark gradient with blue highlights

### Glass Morphism Classes
- `.glass-card`: Basic glass effect with backdrop blur
- `.glass-card-hover`: Interactive glass card with hover effects
- `.weather-icon-glow`: Animated glow effect for weather icons
- `.float-animation`: Gentle floating animation
- `.shimmer`: Loading shimmer effect

## 🔧 Key Technologies

- **Next.js 14**: React framework with app directory
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Tanstack Query**: Data fetching and caching
- **Heroicons**: Beautiful SVG icons
- **next-themes**: Theme management
- **OpenWeatherMap API**: Weather data source

## 📱 Features in Detail

### Dynamic Weather Backgrounds
The app automatically changes its background gradient based on:
- Current weather conditions (sunny, cloudy, rainy, snowy)
- Time of day (day/night detection)
- Smooth transitions between states

### Carrot Weather Style Comments
Random sarcastic and humorous weather comments including:
- Temperature-based jokes
- Weather condition humor
- Seasonal commentary
- Location-aware jokes

### Performance Optimizations
- Tanstack Query caching prevents unnecessary API calls
- Skeleton loading states for smooth UX
- Error boundaries with beautiful error states
- Optimistic updates and retry logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Carrot Weather](https://www.meetcarrot.com/weather/) for the sarcastic commentary style
- [OpenWeatherMap](https://openweathermap.org/) for the weather data API
- [Tailwind CSS](https://tailwindcss.com/) for the amazing utility classes
- [Tanstack Query](https://tanstack.com/query) for excellent data management

## 🐛 Known Issues

- Location permission must be granted for the app to work
- API rate limits apply (60 calls/minute for free tier)
- Some weather emojis may not display consistently across all devices

## 🔮 Future Enhancements

- [ ] Weather maps integration
- [ ] Air quality index
- [ ] Weather widgets for different cities
- [ ] Push notifications for weather alerts
- [ ] Historical weather data
- [ ] More Carrot Weather style personalities

---

Made with ❤️ and lots of CSS magic ✨
