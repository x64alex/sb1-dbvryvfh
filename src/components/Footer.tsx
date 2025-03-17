import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-3">
            <div className="flex items-center mb-4">
              <img 
                src="https://www.trapcall.com/static/images/logo-white.png" 
                alt="TrapCall" 
                className="h-8" 
              />
            </div>
            <p className="text-sm">Protecting your privacy since 2007</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Help & Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://support.trapcall.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">Support</a></li>
              <li><a href="https://support.bendingspoons.com/privacy?app=1527598796" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">Privacy Policy</a></li>
              <li><a href="https://support.bendingspoons.com/tos?app=1527598796" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 space-y-4">
          <p className="text-sm text-center">&copy; {new Date().getFullYear()} TrapCall. All rights reserved.</p>
          <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto leading-relaxed">
            Copyright © Bending Spoons Operations S.p.A. | Via Nino Bonnet 10, 20154, Milan, Italy | VAT, tax code, and number of registration with the Milan Monza Brianza Lodi Company Register 13368510965 | REA number MI 2718456 | Contributed capital €150,000.00 fully paid-in | Sole shareholder company subject to the management and coordination of Bending Spoons S.p.A.
          </p>
        </div>
      </div>
    </footer>
  );
}