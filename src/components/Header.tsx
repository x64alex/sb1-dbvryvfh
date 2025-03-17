import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [showButton, setShowButton] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setShowButton(scrollPosition > heroHeight * 0.7);
    };

    if (!isLoginPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLoginPage]);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="https://www.trapcall.com/images/logo.png"
                alt="TrapCall" 
                className="h-8" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="https://support.trapcall.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
              Support
            </a>
            {!isLoginPage && (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Log In
                </Link>
                {showButton && (
                  <Link
                    to="/signup"
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
                  >
                    Try TrapCall for Free
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <a
              href="https://support.trapcall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              Support
            </a>
            {!isLoginPage && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Try TrapCall for Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}