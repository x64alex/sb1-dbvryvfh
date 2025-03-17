import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const getRandomInterval = () => Math.floor(Math.random() * 2000) + 1000;

export function Hero() {
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem('callCount');
    return savedCount ? parseInt(savedCount, 10) : 143394704;
  });
  
  useEffect(() => {
    localStorage.setItem('callCount', count.toString());
  }, [count]);

  useEffect(() => {
    const tick = () => {
      setCount(prevCount => prevCount + 1);
      setTimeout(tick, getRandomInterval());
    };
    
    const timer = setTimeout(tick, getRandomInterval());
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center relative px-4 pt-24">
      <div className="max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Are you tired of<br />
          <span className="text-blue-600">unwanted calls?</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Take back your privacy and know who's hiding behind No Caller ID, Restricted, and Unknown numbers. End unwanted spam calls from robocalls and telemarketers.
        </p>
        <div className="flex justify-center mb-32">
          <Link 
            to="/signup"
            className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
          >
            Try One Week Free
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
        <div className="text-center mb-16">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {count.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">calls unmasked and counting</p>
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 text-center opacity-40 hover:opacity-60 transition-opacity">
        <p className="text-sm text-gray-500 mb-1">Scroll to learn more</p>
        <ChevronDown className="h-5 w-5 text-gray-500 mx-auto animate-bounce" />
      </div>
    </section>
  );
}