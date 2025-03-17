import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Cta() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Take Control?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Join millions of users who trust TrapCall to protect their privacy and unmask unknown callers.
        </p>
        <Link 
          to="/signup"
          className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition flex items-center justify-center mx-auto inline-flex"
        >
          Try One Week Free
          <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}