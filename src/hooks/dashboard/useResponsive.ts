// src/hooks/dashboard/useResponsive.ts

import { useState, useEffect } from 'react';

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

export const useResponsive = (breakpoints: Breakpoints = defaultBreakpoints) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobile(windowSize.width < breakpoints.md);
    setIsTablet(windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg);
    setIsDesktop(windowSize.width >= breakpoints.lg);
  }, [windowSize.width, breakpoints]);

  const getColsByScreen = (cols: {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }) => {
    if (windowSize.width >= breakpoints.xl && cols.xl) return cols.xl;
    if (windowSize.width >= breakpoints.lg && cols.lg) return cols.lg;
    if (windowSize.width >= breakpoints.md && cols.md) return cols.md;
    if (windowSize.width >= breakpoints.sm && cols.sm) return cols.sm;
    return cols.base;
  };

  const getChartHeight = (baseHeight: number) => {
    if (isMobile) return baseHeight * 0.8;
    if (isTablet) return baseHeight * 0.9;
    return baseHeight;
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    getColsByScreen,
    getChartHeight,
    breakpoints,
  };
};