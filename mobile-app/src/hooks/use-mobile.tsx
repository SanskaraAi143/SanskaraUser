// Placeholder for useIsMobile hook
import { useWindowDimensions } from 'react-native';

// A simple implementation, can be refined
export const useIsMobile = () => {
  const { width } = useWindowDimensions();
  return width < 768; // Example breakpoint
};
