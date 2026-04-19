'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
        observer.observe(el);
      });
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [pathname]);
  
  return <>{children}</>;
}
