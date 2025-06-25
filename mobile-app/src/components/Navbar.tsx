import React, { useState } from 'react';
import { View, Text, Image, Pressable, Modal, SafeAreaView, Platform } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur'; // For glass effect
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import SignInDialog from '@/components/auth/SignInDialog';
// UserProfileDropdown will be a placeholder or simplified
const UserProfileDropdownPlaceholder = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    return (
        <View>
            <Button variant="ghost" onPress={() => navigation.navigate('Profile')}>
                <Text className="text-gray-700">{user?.name || 'Profile'}</Text>
            </Button>
            {/* <Button variant="ghost" onPress={signOut}><Text className="text-red-500">Sign Out</Text></Button> */}
        </View>
    );
};

import { Menu, MessageCircle, User, X, Home, List, MessageSquareText } from 'lucide-react-native'; // MessageSquareText for Blog
import { cn } from '@/lib/utils';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledPressable = styled(Pressable);
const StyledSafeAreaView = styled(SafeAreaView); // For modal content

// Colors from tailwind.config.js (for gradient, if needed, or direct use)
// wedding-cream: '#FFF8E1', wedding-gold: '#FFD700'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();

  const isBlogPage = route.name === 'BlogList' || route.name === 'BlogDetail'; // Example check

  // Simplified nav links for mobile context
  const navLinks = [
    { name: 'Home', navigateTo: 'Index', icon: Home },
    { name: 'Blog', navigateTo: 'BlogStack', icon: List }, // Navigate to BlogStack
    // Add other key navigation items here if needed for the drawer
  ];

  const handleChatNavigation = () => {
    navigation.navigate('DashboardStack', { screen: 'Chat' });
    setMobileMenuOpen(false);
  }

  const handleSignOut = () => {
    signOut();
    setMobileMenuOpen(false);
  }

  const renderLogoAndTitle = (onPress?: () => void) => (
    <StyledPressable onPress={onPress || (() => navigation.navigate('Index'))} className="flex-row items-center gap-2">
      <LinearGradient
        colors={['#FFD700', '#FF8F00']} // wedding-gold to wedding-secondaryGold (from web's gradient-primary)
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <StyledImage source={require('@/assets/images/logo.jpeg')} className="h-8 w-8 rounded-full" />
      </LinearGradient>
      <StyledText className="text-xl font-playfair font-semibold text-yellow-800">
        Sanskara<StyledText className="font-bold text-wedding-red">AI</StyledText>
      </StyledText>
    </StyledPressable>
  );


  return (
    <StyledView style={{ paddingTop: Platform.OS === 'android' ? 25 : 0 }}>
      {/* Actual Navbar content with BlurView and LinearGradient for glass effect */}
      {/* Note: BlurView might need specific parent styling to work as expected across platforms */}
      <StyledView className="absolute top-0 left-0 right-0 z-10">
        <LinearGradient colors={['rgba(255, 248, 225, 0.7)', 'rgba(255, 253, 231, 0.6)']} start={{x:0, y:0}} end={{x:1, y:1}}>
         {Platform.OS === 'ios' && <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10} />}
          <StyledSafeAreaView className="flex-row items-center justify-between p-3 border-b border-wedding-gold/30">
            {renderLogoAndTitle()}

            <StyledView className="flex-row items-center gap-2">
              {user ? (
                <>
                  {/* <Button variant="ghost" size="icon" onPress={handleChatNavigation}>
                    <MessageCircle size={22} className="text-gray-700" />
                  </Button> */}
                  {/* For now, UserProfileDropdown is simplified or non-existent. Access profile via drawer. */}
                </>
              ) : (
                <SignInDialog>
                  <Button variant="outline" size="sm" className="border-wedding-red active:bg-wedding-cream">
                    <StyledText className="text-wedding-red">Sign In</StyledText>
                  </Button>
                </SignInDialog>
              )}
              <StyledPressable onPress={() => setMobileMenuOpen(true)} className="p-2">
                <Menu size={26} className="text-gray-700" />
              </StyledPressable>
            </StyledView>
          </StyledSafeAreaView>
        </LinearGradient>
      </StyledView>

      {/* Spacer to push content below the fixed/absolute navbar */}
      <StyledView className="h-[70px]" />

      {/* Mobile Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={mobileMenuOpen}
        onRequestClose={() => setMobileMenuOpen(false)}
      >
        <StyledView className="flex-1 justify-end" onTouchEnd={() => setMobileMenuOpen(false)}>
          <TouchableWithoutFeedback>
            <StyledSafeAreaView className="bg-wedding-cream w-full rounded-t-2xl shadow-lg p-4 border-t-2 border-wedding-gold">
                <StyledView className="flex-row justify-between items-center mb-6">
                    {renderLogoAndTitle(() => {
                        setMobileMenuOpen(false);
                        navigation.navigate('Index');
                    })}
                    <StyledPressable onPress={() => setMobileMenuOpen(false)} className="p-2">
                        <X size={26} className="text-gray-700" />
                    </StyledPressable>
                </StyledView>

                {navLinks.map(link => (
                    <StyledPressable
                        key={link.name}
                        onPress={() => {
                            navigation.navigate(link.navigateTo);
                            setMobileMenuOpen(false);
                        }}
                        className="flex-row items-center py-3 px-2 rounded-lg active:bg-wedding-gold/20"
                    >
                        <link.icon size={22} className="text-yellow-800 mr-4" />
                        <StyledText className="text-lg font-medium text-yellow-800">{link.name}</StyledText>
                    </StyledPressable>
                ))}

                <StyledView className="h-px bg-wedding-gold/30 my-4" />

                {user ? (
                    <>
                        <StyledPressable
                            onPress={() => { navigation.navigate('Profile'); setMobileMenuOpen(false); }}
                            className="flex-row items-center py-3 px-2 rounded-lg active:bg-wedding-gold/20"
                        >
                            <User size={22} className="text-yellow-800 mr-4" />
                            <StyledText className="text-lg font-medium text-yellow-800">Profile</StyledText>
                        </StyledPressable>
                        <StyledPressable
                            onPress={handleChatNavigation}
                            className="flex-row items-center py-3 px-2 rounded-lg active:bg-wedding-gold/20"
                        >
                            <MessageSquareText size={22} className="text-yellow-800 mr-4" />
                            <StyledText className="text-lg font-medium text-yellow-800">Chat with AI</StyledText>
                        </StyledPressable>
                        <StyledPressable
                            onPress={handleSignOut}
                            className="flex-row items-center py-3 px-2 mt-2 rounded-lg active:bg-red-100"
                        >
                            <User size={22} className="text-red-600 mr-4" />
                            <StyledText className="text-lg font-medium text-red-600">Sign Out</StyledText>
                        </StyledPressable>
                    </>
                ) : (
                    <SignInDialog>
                        <StyledPressable
                            className="flex-row items-center py-3 px-2 rounded-lg active:bg-wedding-gold/20"
                            onPress={() => setMobileMenuOpen(false)} // SignInDialog handles its own open
                        >
                            <User size={22} className="text-yellow-800 mr-4" />
                            <StyledText className="text-lg font-medium text-yellow-800">Sign In</StyledText>
                        </StyledPressable>
                    </SignInDialog>
                )}
                 <Button
                    className="mt-6 bg-wedding-red active:bg-opacity-80"
                    textClassName="text-white"
                    onPress={handleChatNavigation} // Or a primary CTA
                  >
                    Start Planning
                  </Button>
            </StyledSafeAreaView>
          </TouchableWithoutFeedback>
        </StyledView>
      </Modal>
    </StyledView>
  );
};

// Need to import StyleSheet for absoluteFill and TouchableWithoutFeedback
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';


export default Navbar;
