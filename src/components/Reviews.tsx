import React from 'react';
import { Star } from 'lucide-react';

export function Reviews() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600">Join thousands of satisfied TrapCall users</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "I was getting harassing phone calls from an unknown number. TrapCall helped me identify the person and get the evidence I needed to file a police report. Thank you TrapCall!"
            </p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=50&h=50"
                alt="Sarah W."
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-semibold">Sarah W.</p>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "TrapCall is amazing! My ex kept calling me from different numbers, and TrapCall helped me block them all. The recording feature gave me peace of mind and helped me document everything."
            </p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=50&h=50"
                alt="Michael R."
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-semibold">Michael R.</p>
                <p className="text-sm text-gray-500">Premium User</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "Best investment ever! I was getting so many spam calls from blocked numbers. TrapCall unmasked them all and now I can block them permanently. Haven't had a spam call in weeks!"
            </p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=50&h=50"
                alt="Jennifer L."
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-semibold">Jennifer L.</p>
                <p className="text-sm text-gray-500">Basic Plan User</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}