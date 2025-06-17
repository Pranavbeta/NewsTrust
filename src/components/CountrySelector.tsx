import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_COUNTRIES, getUserPreferredCountry, setUserPreferredCountry, getCountryByCode } from '../lib/countryNews';

interface Props {
  onCountryChange: (countryCode: string) => void;
}

const CountrySelector: React.FC<Props> = ({ onCountryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const code = getUserPreferredCountry();
    return getCountryByCode(code) || SUPPORTED_COUNTRIES[0];
  });

  const handleCountrySelect = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setSelectedCountry(country);
      setUserPreferredCountry(countryCode);
      onCountryChange(countryCode);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:block">Choose Country:</span>
        <span className="flex items-center space-x-1">
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.name}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-20 max-h-80 overflow-y-auto">
            <div className="py-1">
              {SUPPORTED_COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors ${
                    selectedCountry.code === country.code
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                  {selectedCountry.code === country.code && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountrySelector;