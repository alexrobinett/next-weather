import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { Skeleton } from "./ui/skeleton"


import useUserLocation from "../lib/hooks/useUserLocation";
import useWeatherData from "../lib/hooks/useWeatherData";
import Image from "next/image";
import {removeTrailingNumbers} from "../lib/formatters";

// Current weather component that displays the current temperature and feels like temperature along with a picture of the condition and text description on a card like component.
// should use skeleton loading for the card while the data is being fetched.

const CurrentWeather = () => {
  const { data: location, isPending: isLocationPending, error } = useUserLocation();
  const { data: weatherData, isPending: weatherIsPending } = useWeatherData(location?.latitude, location?.longitude);


return (
  
  <Card >
  <CardHeader className="flex justify-center">
    <CardTitle className="text-2xl">Atlanta</CardTitle>
  </CardHeader>
  <CardContent className="flex justify-between">
      <div className="p-1">
        <h2 className="font-semibold">Temperature</h2>
        <p>{!weatherIsPending || !isLocationPending ? `${removeTrailingNumbers(String(weatherData?.current.temp))}°F` : ( <Skeleton className="w-8 h-[20px] rounded-full m-1" />)}</p>
      </div>
      <div className="p-1">
        <h2 className="font-semibold	">Feels Like</h2>
        <p>{ !weatherIsPending || !isLocationPending ? `${weatherData?.current.feels_like}°F` : ( <Skeleton className="w-8 h-[20px] rounded-full m-1" />)}</p>
      </div>
  </CardContent>

  </Card>
  );
};

export default CurrentWeather;
