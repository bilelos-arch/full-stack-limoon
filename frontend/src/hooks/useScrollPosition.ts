'use client';

import { useState, useEffect } from 'react';

export const useScrollPosition = (threshold: number = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsScrolled(scrollTop > threshold);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Call once to set initial state
    handleScroll();

    // Remove event listener on cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};