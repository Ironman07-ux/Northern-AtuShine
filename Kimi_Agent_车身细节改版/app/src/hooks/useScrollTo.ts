import { useCallback } from 'react';

export function useScrollTo() {
  const scrollTo = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return scrollTo;
}
