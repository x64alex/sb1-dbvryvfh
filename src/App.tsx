import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ForgotPin } from './pages/ForgotPin';
import { SignUp } from './pages/SignUp';
import { CountryBanner } from './components/CountryBanner';
import { useCountry } from './hooks/useCountry';

function App() {
  const { isUS, loading } = useCountry();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {!loading && !isUS && <CountryBanner />}
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-pin" element={<ForgotPin />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;