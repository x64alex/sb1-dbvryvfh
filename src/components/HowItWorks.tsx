import React from 'react';

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">How TrapCall works</h2>
        
        {/* Main image */}
        <div className="max-w-3xl mx-auto mb-20">
          <img 
            src="https://www.trapcall.com/static/images/how-it-works.png" 
            alt="How TrapCall works"
            className="w-full"
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Your phone rings, but it's blocked</h3>
            <p className="text-gray-600">Receive a call from an unknown, blocked, or restricted number</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Decline the call, we do our magic</h3>
            <p className="text-gray-600">TrapCall's technology works behind the scenes to unmask the caller</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">The call rings back - unmasked!</h3>
            <p className="text-gray-600">See the real phone number that was trying to hide from you</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Block and take back control</h3>
            <p className="text-gray-600">Choose to block unwanted callers or add them to your blacklist</p>
          </div>
        </div>
      </div>
    </section>
  );
}