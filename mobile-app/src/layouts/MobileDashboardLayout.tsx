import React from 'react';
import { View } from 'react-native';

const MobileDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // This component might eventually include shared UI like a custom header or tab bar
  // For now, it just renders children. The actual dashboard navigation will be a nested navigator.
  return <View style={{ flex: 1 }}>{children}</View>;
};

export default MobileDashboardLayout;
