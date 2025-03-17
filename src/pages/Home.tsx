import React from 'react';
import { Hero } from '../components/Hero';
import { Testimonials } from '../components/Testimonials';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Reviews } from '../components/Reviews';
import { Cta } from '../components/Cta';

export function Home() {
  return (
    <>
      <Hero />
      <Testimonials />
      <Features />
      <HowItWorks />
      <Reviews />
      <Cta />
    </>
  );
}