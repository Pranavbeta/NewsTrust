import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader, RefreshCw, Filter } from 'lucide-react';
import { useNews } from '../contexts/NewsContext';
import EnhancedNewsCard from '../components/EnhancedNewsCard';

interface Location {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const LocalNews: React.FC = () => {
  const { articles } = useNews();
  const [location, setLocation] = useState<Location | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(50); // km

  const popularCities = [
    { name: 'New York, USA', coordinates: { lat: 40.7128, lng: -74.0060 } },
    { name: 'London, UK', coordinates: { lat: 51.5074, lng: -0.1278 } },
    { name: 'Tokyo, Japan', coordinates: { lat: 35.6762, lng: 139.6503 } },
    { name: 'Paris, France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    { name: 'Sydney, Australia', coordinates: { lat: -33.8688, lng: 151.2093 } },
    { name: 'Mumbai, India', coordinates: { lat: 19.0760, lng: 72.8777 } },
    { name: 'São Paulo, Brazil', coordinates: { lat: -23.5505, lng: -46.6333 } },
    { name: 'Cairo, Egypt', coordinates: { lat: 30.0444, lng: 31.2357 } },
  ];

  const radiusOptions = [10, 25, 50, 100, 200, 500];

  useEffect(() => {
    // Auto-detect location on mount
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Simulate reverse geocoding
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
          const countries = ['USA', 'Canada', 'UK', 'Germany', 'France'];
          
          setLocation({
            city: cities[Math.floor(Math.random() * cities.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            coordinates: { lat: latitude, lng: longitude }
          });
        } catch (error) {
          setLocationError('Failed to get location details');
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        setLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please allow location access or set manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const setManualLocationFromCity = (cityData: typeof popularCities[0]) => {
    const [city, country] = cityData.name.split(', ');
    setLocation({
      city,
      country,
      coordinates: cityData.coordinates
    });
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;

    // Simulate location lookup
    const [city, country] = manualLocation.split(',').map(s => s.trim());
    setLocation({
      city: city || manualLocation,
      country: country || 'Unknown',
      coordinates: { lat: 0, lng: 0 } // Would be geocoded in real app
    });
    setManualLocation('');
  };

  // Filter articles by location (simulation)
  const localArticles = location ? 
    articles.filter(article => 
      article.location && (
        article.location.toLowerCase().includes(location.city.toLowerCase()) ||
        article.location.toLowerCase().includes(location.country.toLowerCase()) ||
        Math.random() > 0.5 // Simulate proximity matching
      )
    ).concat(
      // Add some simulated local articles
      articles.slice(0, 3).map(article => ({
        ...article,
        id: `local-${article.id}`,
        title: `Local: ${article.title}`,
        location: `${location.city}, ${location.country}`,
        isBreaking: Math.random() > 0.8
      }))
    ) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MapPin className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local News</h1>
            <p className="text-gray-600">News from your area and nearby regions</p>
          </div>
        </div>

        {/* Location Status */}
        {location ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">
                  Showing news for: {location.city}, {location.country}
                </span>
              </div>
              <button
                onClick={() => setLocation(null)}
                className="text-green-700 hover:text-green-900 text-sm font-medium"
              >
                Change Location
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Set Your Location</h3>
            
            {/* Auto-detect Location */}
            <div className="mb-4">
              <button
                onClick={detectLocation}
                disabled={loadingLocation}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loadingLocation ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                <span>{loadingLocation ? 'Detecting...' : 'Use My Location'}</span>
              </button>
              
              {locationError && (
                <p className="text-red-600 text-sm mt-2">{locationError}</p>
              )}
            </div>

            {/* Manual Location Input */}
            <div className="mb-4">
              <form onSubmit={handleManualLocationSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Enter city, country"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors"
                >
                  Set
                </button>
              </form>
            </div>

            {/* Popular Cities */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Cities:</h4>
              <div className="flex flex-wrap gap-2">
                {popularCities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => setManualLocationFromCity(city)}
                    className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {location && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {radiusOptions.map(radius => (
                  <option key={radius} value={radius}>
                    {radius} km
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={detectLocation}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Local News Feed */}
      {location ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              News from {location.city}, {location.country}
            </h2>
            <span className="text-sm text-gray-500">
              {localArticles.length} local articles
            </span>
          </div>

          {localArticles.length > 0 ? (
            <div className="space-y-6">
              {localArticles.map((article) => (
                <EnhancedNewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No local news found</h3>
              <p className="text-gray-600">
                We couldn't find any news specific to your location. Try expanding your search radius or check back later.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Location</h3>
          <p className="text-gray-600">
            Please set your location to see local news from your area.
          </p>
        </div>
      )}

      {/* Location Info */}
      {location && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Your Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">City:</span>
              <span className="ml-2 text-gray-900">{location.city}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Country:</span>
              <span className="ml-2 text-gray-900">{location.country}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Search Radius:</span>
              <span className="ml-2 text-gray-900">{selectedRadius} km</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Articles Found:</span>
              <span className="ml-2 text-gray-900">{localArticles.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalNews;