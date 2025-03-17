import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function ForgotPin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Handle PIN reset logic here
    console.log('PIN reset requested for:', phoneNumber);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.length <= 14) {
      setPhoneNumber(formatted);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-32">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Check your phone</h2>
            <p className="text-green-700">
              If this phone number is registered with TrapCall, you'll receive a text message with instructions to reset your PIN.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 pt-32">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Login
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Forgot your PIN?</h2>
          <p className="mt-2 text-gray-600">
            Enter your phone number and we'll send you instructions to reset your PIN.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="(123) 456-7890"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send me my PIN
          </button>
        </form>
      </div>
    </div>
  );
}