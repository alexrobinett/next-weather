import { useState } from 'react';

interface LocationFormProps {
  onGetCoordinates: (latitude: number, longitude: number) => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ onGetCoordinates }) => {
  const [location, setLocation] = useState('');

 const handleSubmit = async (event: React.FormEvent) => {

    event.preventDefault();
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.NEXT_PUBLIC_GOOGLEKEY}`
      );
      const data = await response.json();
  
      if (data.status !== 'OK') {
        throw new Error(data.error_message || 'Failed to get location');
      }
  
      const { lat, lng } = data.results[0].geometry.location;
  
      onGetCoordinates(lat, lng);
    } catch (error) {
      console.error(error);
    }
  };

return (
    <>
        <form onSubmit={handleSubmit}>
        <input
            className="m-2 text-black"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder='Enter a location'
        />
        <button className="m-2" type="submit">Search</button>
        </form>
    </>
  );
};

export default LocationForm;