"use client"
import { useEffect, useState } from "react";
import LocationForm from "../components/locationComponent";


interface UserLocation {

  latitude: number;
  longitude: number;
  accuracy: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    function getUserLocation() {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ latitude, longitude, accuracy });
      });
    }

    getUserLocation();
  }, []);

  const handleGetCoordinates = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };


    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <h1 className="text-white">
          Latitude: {userLocation?.latitude}, Longitude: {userLocation?.longitude}
        </h1>
        <h2>Accuracy: {userLocation?.accuracy}</h2>
        <LocationForm onGetCoordinates={handleGetCoordinates} />
        {coordinates && (
        <p>Coordinates from form: Latitude: {coordinates.lat}, Longitude: {coordinates.lng}</p>
      )}
      </main>
    );
  }

