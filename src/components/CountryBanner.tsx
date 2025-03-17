import React from 'react';

export function CountryBanner() {
  return (
    <div className="bg-blue-600 text-white text-center py-2 px-4 fixed w-full z-[51] top-0">
      <p className="text-sm">
        TrapCall is only available in the{' '}
        <span className="font-semibold">United States</span>{' '}
        <span role="img" aria-label="US flag">🇺🇸</span>
      </p>
    </div>
  );
}