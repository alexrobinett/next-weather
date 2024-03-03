
"use client"
import CurrentWeather from "~/components/CurrentWeather";
import useUserLocation from "../lib/hooks/useUserLocation";
import useWeatherData from "~/lib/hooks/useWeatherData";

export default function HomePage() {

  const { data, isPending: isLocationPending, error } = useUserLocation();
  const { data: weatherData, isPending: weatherIsPending } = useWeatherData(data?.latitude, data?.longitude);


    return (
    
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <CurrentWeather/>
  
      </main>
    );
  }

