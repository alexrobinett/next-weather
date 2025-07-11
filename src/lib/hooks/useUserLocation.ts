'use client'
import { useQuery } from "@tanstack/react-query";

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export async function getUserLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
}

const useUserLocation = () => {
    const { data, isPending, error } = useQuery({
        queryKey: ["userLocation"],
        refetchInterval: 1000 * 60,
        queryFn: getUserLocation,
    });
    return { data, isPending, error };
};

export default useUserLocation;