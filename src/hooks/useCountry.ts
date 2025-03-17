import { useState, useEffect } from 'react';

export function useCountry() {
  const [isUS, setIsUS] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkCountry() {
      try {
        const response = await fetch('https://api.country.is');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setIsUS(data.country === 'US');
      } catch (error) {
        console.error('Error fetching country:', error);
        // Default to showing the banner (non-US) on error
        setIsUS(false);
      } finally {
        setLoading(false);
      }
    }

    checkCountry();
  }, []);

  return { isUS, loading };
}