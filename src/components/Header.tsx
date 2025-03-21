import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/settings/subscription" : "/"}>
              <img 
                src="https://www.trapcall.com/images/logo.png"
                alt="TrapCall" 
                className="h-8" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/settings/subscription" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Settings className="h-5 w-5 mr-1" />
                  Settings
                </Link>
                <button onClick={logout} className="text-gray-600 hover:text-blue-600">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Log In
                </Link>
                <Link to="/signup" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">
                  Try TrapCall for Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="https://support.trapcall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </a>

            {isAuthenticated ? (
              <>
                <Link
                  to="/settings/subscription"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                >
                  Log Out
                </button>
              </>
            ) : (
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
