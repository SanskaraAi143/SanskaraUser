import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext'; // Uncommented

// Import navigation types
import { RootStackParamList, DashboardStackParamList, BlogStackParamList } from './src/navigation/types';

// Import pages
import IndexPage from './src/pages/Index';
import DashboardPage from './src/pages/DashboardPage';
import ProfilePage from './src/pages/ProfilePage';
import ChatPage from './src/pages/ChatPage';
import TasksPage from './src/pages/TasksPage';
import TimelinePage from './src/pages/TimelinePage';
import MoodBoardPage from './src/pages/MoodBoardPage';
import BudgetPage from './src/pages/BudgetPage';
import GuestsPage from './src/pages/GuestsPage';
import VendorsPage from './src/pages/VendorsPage';
import SettingsPage from './src/pages/SettingsPage';
import BlogListPage from './src/pages/BlogListPage';
import BlogDetailPage from './src/pages/BlogDetailPage'; // Assuming it takes a slug
import NotFoundPage from './src/pages/NotFoundPage';

// Placeholder for MobileDashboardLayout - in React Navigation, a layout isn't a route.
// Instead, we create a navigator for the dashboard screens.
// The web's <MobileDashboardLayout> wrapping <Route index... /> is handled by grouping screens in a navigator.

const queryClient = new QueryClient();

const RootStack = createNativeStackNavigator<RootStackParamList>();
const DashboardStackNav = createNativeStackNavigator<DashboardStackParamList>();
const BlogStackNav = createNativeStackNavigator<BlogStackParamList>();

// Dashboard Stack Navigator
function DashboardNavigator() {
  return (
    // The MobileDashboardLayout component from web could be integrated here if it provided
    // a common UI wrapper (like a custom header) for all dashboard screens.
    // For now, it's a simple stack.
    // We could also use a TabNavigator or DrawerNavigator here.
    <DashboardStackNav.Navigator initialRouteName="Dashboard">
      <DashboardStackNav.Screen name="Dashboard" component={DashboardPage} />
      <DashboardStackNav.Screen name="Profile" component={ProfilePage} />
      <DashboardStackNav.Screen name="Chat" component={ChatPage} />
      <DashboardStackNav.Screen name="Tasks" component={TasksPage} />
      <DashboardStackNav.Screen name="Timeline" component={TimelinePage} />
      <DashboardStackNav.Screen name="MoodBoard" component={MoodBoardPage} />
      <DashboardStackNav.Screen name="Budget" component={BudgetPage} />
      <DashboardStackNav.Screen name="Guests" component={GuestsPage} />
      <DashboardStackNav.Screen name="Vendors" component={VendorsPage} />
      <DashboardStackNav.Screen name="Settings" component={SettingsPage} />
    </DashboardStackNav.Navigator>
  );
}

// Blog Stack Navigator
function BlogNavigator() {
  return (
    <BlogStackNav.Navigator initialRouteName="BlogList">
      <BlogStackNav.Screen name="BlogList" component={BlogListPage} options={{ title: 'Blog' }} />
      <BlogStackNav.Screen
        name="BlogDetail"
        component={BlogDetailPage}
        // Options can be configured to show slug or title from params
        // options={({ route }) => ({ title: `Post: ${route.params.slug}` })}
      />
    </BlogStackNav.Navigator>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native'; // Import View
import Toast from 'react-native-toast-message'; // Import Toast

// Main App Navigator (Root Stack)
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <View style={{ flex: 1 }}>{/* Outer view for gradient and app content */}
        <LinearGradient
          colors={['#FFF8E1', '#FFFFFF', 'rgba(255, 248, 225, 0.8)']}
          style={{ flex: 1 }}
        >
          <NavigationContainer>
            <RootStack.Navigator
              initialRouteName="Index"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }
              }}
            >
              <RootStack.Screen name="Index" component={IndexPage} />
              <RootStack.Screen name="DashboardStack" component={DashboardNavigator} />
              <RootStack.Screen name="BlogStack" component={BlogNavigator} />
              <RootStack.Screen name="NotFound" component={NotFoundPage} />
            </RootStack.Navigator>
          </NavigationContainer>
        </LinearGradient>
        <StatusBar style="auto" />
      </View>
      <Toast /> {/* Toast rendered here will overlay on top of everything else */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// To use typed navigation props in your components:
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// type Props = NativeStackScreenProps<RootStackParamList, 'Index'>; // For Index screen
// type DashboardProps = NativeStackScreenProps<DashboardStackParamList, 'Dashboard'>; // For Dashboard screen in DashboardStack
// const navigation = useNavigation<Props['navigation']>();
// const route = useRoute<Props['route']>();
// This ensures type safety when calling navigation.navigate or accessing route.params.
// The useNavigation hook in Index.tsx was `useNavigation<any>()`. It should be updated with proper types.
// e.g. `useNavigation<NativeStackNavigationProp<RootStackParamList>>();`
// This detail can be refined when migrating each component that uses navigation.
