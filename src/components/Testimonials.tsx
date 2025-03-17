import React from 'react';

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-5 gap-8 items-center mb-16">
          <img 
            src="https://www.trapcall.com/static/images/media-1.png" 
            alt="The New York Times" 
            className="h-8 object-contain" 
          />
          <img 
            src="https://www.trapcall.com/static/images/media-2.png" 
            alt="MSNBC" 
            className="h-8 object-contain" 
          />
          <img 
            src="https://www.trapcall.com/static/images/media-3.png" 
            alt="ABC News" 
            className="h-8 object-contain" 
          />
          <img 
            src="https://www.trapcall.com/static/images/media-4.png" 
            alt="The Washington Times" 
            className="h-8 object-contain" 
          />
          <img 
            src="https://www.trapcall.com/static/images/media-5.png" 
            alt="Wired" 
            className="h-8 object-contain" 
          />
        </div>
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-gray-600 italic">
            "People plagued by unknown callers may be able to use TrapCall to trace the perpetrator before he or she knows it."
          </p>
          <p className="text-gray-500 mt-3 font-medium">— The New York Times</p>
        </div>
      </div>
    </section>
  );
}