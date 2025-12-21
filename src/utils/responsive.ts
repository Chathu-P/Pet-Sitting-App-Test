// utils/responsive.ts
import { useWindowDimensions, Platform, PixelRatio } from 'react-native';
import { useMemo } from 'react';

// Base dimensions (iPhone 11/XR as standard reference)
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// Device size categories
export type DeviceSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface ResponsiveSizes {
  width: number;
  height: number;
  deviceSize: DeviceSize;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isXLargeDevice: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  scale: number;
  fontScale: number;
}

/**
 * Custom hook for responsive design
 * Returns device dimensions, size category, and scaling functions
 */
export const useResponsive = (): ResponsiveSizes & {
  wp: (percentage: number) => number;
  hp: (percentage: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  scaleFont: (size: number) => number;
  scaleSize: (size: number) => number;
} => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // Device size categorization
    const deviceSize: DeviceSize = 
      width < 375 ? 'small' :
      width < 414 ? 'medium' :
      width < 768 ? 'large' : 'xlarge';

    const isSmallDevice = deviceSize === 'small';
    const isMediumDevice = deviceSize === 'medium';
    const isLargeDevice = deviceSize === 'large';
    const isXLargeDevice = deviceSize === 'xlarge';
    
    // Orientation
    const isPortrait = height >= width;
    const isLandscape = width > height;

    // Scaling factors
    const widthScale = width / BASE_WIDTH;
    const heightScale = height / BASE_HEIGHT;
    const scale = Math.min(widthScale, heightScale);
    const fontScale = PixelRatio.getFontScale();

    /**
     * Width percentage - converts percentage to actual width
     * @param percentage - percentage of screen width (0-100)
     */
    const wp = (percentage: number): number => {
      return (width * percentage) / 100;
    };

    /**
     * Height percentage - converts percentage to actual height
     * @param percentage - percentage of screen height (0-100)
     */
    const hp = (percentage: number): number => {
      return (height * percentage) / 100;
    };

    /**
     * Moderate scale - scales size with optional factor
     * @param size - base size to scale
     * @param factor - scaling factor (default 0.5)
     */
    const moderateScale = (size: number, factor: number = 0.5): number => {
      return size + (scale * size - size) * factor;
    };

    /**
     * Scale font size based on device
     * @param size - base font size
     */
    const scaleFont = (size: number): number => {
      // Adjust for device size
      const deviceFactor = 
        isSmallDevice ? 0.9 :
        isMediumDevice ? 1 :
        isLargeDevice ? 1.05 : 1.1;
      
      return Math.round(size * deviceFactor);
    };

    /**
     * Scale any size proportionally
     * @param size - base size
     */
    const scaleSize = (size: number): number => {
      return Math.round(size * scale);
    };

    return {
      width,
      height,
      deviceSize,
      isSmallDevice,
      isMediumDevice,
      isLargeDevice,
      isXLargeDevice,
      isPortrait,
      isLandscape,
      scale,
      fontScale,
      wp,
      hp,
      moderateScale,
      scaleFont,
      scaleSize,
    };
  }, [width, height]);
};

/**
 * Responsive spacing utility
 */
export const useResponsiveSpacing = () => {
  const { scale, deviceSize } = useResponsive();

  return useMemo(() => {
    const baseSpacing = deviceSize === 'small' ? 6 : 8;
    
    return {
      xs: Math.round(baseSpacing * 0.5 * scale),
      sm: Math.round(baseSpacing * scale),
      md: Math.round(baseSpacing * 2 * scale),
      lg: Math.round(baseSpacing * 3 * scale),
      xl: Math.round(baseSpacing * 4 * scale),
      xxl: Math.round(baseSpacing * 6 * scale),
    };
  }, [scale, deviceSize]);
};

/**
 * Responsive font sizes
 */
export const useResponsiveFonts = () => {
  const { scaleFont } = useResponsive();

  return useMemo(() => ({
    tiny: scaleFont(10),
    small: scaleFont(12),
    regular: scaleFont(14),
    medium: scaleFont(16),
    large: scaleFont(18),
    xlarge: scaleFont(22),
    xxlarge: scaleFont(28),
    xxxlarge: scaleFont(34),
    huge: scaleFont(42),
  }), [scaleFont]);
};

/**
 * Get safe dimensions with min/max constraints
 */
export const getSafeDimensions = (
  baseSize: number,
  min?: number,
  max?: number
): number => {
  let size = baseSize;
  if (min !== undefined) size = Math.max(size, min);
  if (max !== undefined) size = Math.min(size, max);
  return Math.round(size);
};

/**
 * Calculate aspect ratio safe size
 */
export const getAspectRatioSize = (
  width: number,
  height: number,
  aspectRatio: number
): { width: number; height: number } => {
  const currentRatio = width / height;
  
  if (currentRatio > aspectRatio) {
    // Width is too large
    return {
      width: Math.round(height * aspectRatio),
      height: height,
    };
  } else {
    // Height is too large
    return {
      width: width,
      height: Math.round(width / aspectRatio),
    };
  }
};

/**
 * Platform-specific value selector
 */
export const platformSelect = <T,>(values: {
  ios?: T;
  android?: T;
  default: T;
}): T => {
  if (Platform.OS === 'ios' && values.ios !== undefined) {
    return values.ios;
  }
  if (Platform.OS === 'android' && values.android !== undefined) {
    return values.android;
  }
  return values.default;
};

/**
 * Generate responsive shadow styles
 */
export const getResponsiveShadow = (elevation: number = 5) => {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: Math.round(elevation / 2),
      },
      shadowOpacity: 0.15 + (elevation / 100),
      shadowRadius: elevation,
    },
    android: {
      elevation: elevation,
    },
  });
};

/**
 * Hook for responsive button sizing
 */
export const useResponsiveButton = () => {
  const { wp, hp, deviceSize, scaleFont } = useResponsive();

  return useMemo(() => {
    const height = deviceSize === 'small' ? 48 : 56;
    const minWidth = wp(40);
    const maxWidth = wp(85);
    
    return {
      height,
      minWidth,
      maxWidth,
      paddingHorizontal: wp(6),
      paddingVertical: hp(1.5),
      fontSize: scaleFont(16),
      borderRadius: height / 2,
    };
  }, [wp, hp, deviceSize, scaleFont]);
};

/**
 * Hook for responsive image sizing
 */
export const useResponsiveImage = (aspectRatio: number = 1) => {
  const { width, height, wp, hp } = useResponsive();

  return useMemo(() => {
    const maxWidth = wp(90);
    const maxHeight = hp(40);
    
    const size = getAspectRatioSize(maxWidth, maxHeight, aspectRatio);
    
    return {
      width: size.width,
      height: size.height,
      aspectRatio,
    };
  }, [width, height, wp, hp, aspectRatio]);
};

/**
 * Responsive grid calculation
 */
export const useResponsiveGrid = (
  itemMinWidth: number = 150,
  gap: number = 16
) => {
  const { width } = useResponsive();

  return useMemo(() => {
    const availableWidth = width - (gap * 2); // Account for container padding
    const columns = Math.max(1, Math.floor((availableWidth + gap) / (itemMinWidth + gap)));
    const itemWidth = (availableWidth - (gap * (columns - 1))) / columns;
    
    return {
      columns,
      itemWidth: Math.floor(itemWidth),
      gap,
    };
  }, [width, itemMinWidth, gap]);
};