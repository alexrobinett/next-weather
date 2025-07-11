
export function removeTrailingNumbers(input: string): string {
    if (!input) return "";
    const regex = /\.\d+/;
    return input.replace(regex, "");
}

// Weather condition to background mapping
export const getWeatherBackground = (condition: string, isNight: boolean = false): string => {
    if (isNight) return 'weather-bg-night';
    
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
        return 'weather-bg-sunny';
    } else if (lowerCondition.includes('cloud')) {
        return 'weather-bg-cloudy';
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
        return 'weather-bg-rainy';
    } else if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
        return 'weather-bg-snowy';
    }
    
    return 'weather-bg-default';
};

// Weather condition to emoji mapping
export const getWeatherEmoji = (condition: string, isNight: boolean = false): string => {
    const lowerCondition = condition.toLowerCase();
    
    if (isNight) {
        if (lowerCondition.includes('clear')) return '🌙';
        if (lowerCondition.includes('cloud')) return '☁️';
        return '🌃';
    }
    
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('drizzle')) return '🌦️';
    if (lowerCondition.includes('thunderstorm')) return '⛈️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) return '🌫️';
    if (lowerCondition.includes('haze')) return '🌫️';
    
    return '🌤️';
};

// Carrot Weather style sarcastic comments
export const getCarrotWeatherComment = (temp: number, condition: string): string => {
    const comments = {
        hot: [
            "It's so hot, even the sun is looking for shade! 🔥",
            "Time to become one with your air conditioner.",
            "Perfect weather for melting into a puddle! 🫠",
            "The pavement could cook an egg right now!",
            "Even vampires are avoiding going outside."
        ],
        cold: [
            "Brrr! It's colder than your ex's heart! ❄️",
            "Perfect weather for questioning your life choices.",
            "Time to hibernate until spring! 🐻",
            "Your breath is literally visible. How fancy!",
            "Great day to practice your penguin walk! 🐧"
        ],
        mild: [
            "Goldilocks would approve - not too hot, not too cold! 👌",
            "Perfect weather for existing as a human being.",
            "Mother Nature is feeling generous today!",
            "This is the weather gods saying 'you're welcome'.",
            "Ideal conditions for being moderately productive."
        ],
        rainy: [
            "Nature's way of saying 'stay inside and be cozy'! ☔",
            "Perfect excuse to wear those cute rain boots!",
            "The earth is getting a well-deserved shower.",
            "Time to practice your indoor hobbies!",
            "At least you won't need to water your plants! 🌱"
        ],
        snowy: [
            "Winter wonderland or frozen nightmare? You decide! ❄️",
            "Perfect weather for building snowmen and regrets!",
            "Mother Nature is throwing a sparkly tantrum!",
            "Time to channel your inner Elsa! ⛄",
            "Hot chocolate sales are about to skyrocket! ☕"
        ]
    };
    
    if (condition.toLowerCase().includes('rain')) {
        return comments.rainy[Math.floor(Math.random() * comments.rainy.length)] || comments.mild[0]!;
    } else if (condition.toLowerCase().includes('snow')) {
        return comments.snowy[Math.floor(Math.random() * comments.snowy.length)] || comments.mild[0]!;
    } else if (temp > 85) {
        return comments.hot[Math.floor(Math.random() * comments.hot.length)] || comments.mild[0]!;
    } else if (temp < 40) {
        return comments.cold[Math.floor(Math.random() * comments.cold.length)] || comments.mild[0]!;
    } else {
        return comments.mild[Math.floor(Math.random() * comments.mild.length)] || comments.mild[0]!;
    }
};

// Format time from Unix timestamp
export const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

// Format date from Unix timestamp
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

// Wind direction from degrees
export const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index] || 'N';
};

// UV Index description
export const getUVDescription = (uvIndex: number): { level: string; color: string } => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-500' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-500' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-500' };
    return { level: 'Extreme', color: 'text-purple-500' };
};

// Reverse geocoding function
export const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
        const weatherKey = process.env.NEXT_PUBLIC_WEATHERKEY;
        if (!weatherKey) {
            throw new Error('Weather API key not found');
        }
        
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${weatherKey}`
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const location = data[0];
            const name = location?.name || 'Unknown';
            const state = location?.state ? `, ${location.state}` : '';
            const country = location?.country ? `, ${location.country}` : '';
            return `${name}${state}${country}`;
        }
        
        return 'Unknown Location';
    } catch (error) {
        console.error('Error getting city name:', error);
        return 'Unknown Location';
    }
};

