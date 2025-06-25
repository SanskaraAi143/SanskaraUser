import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/Button';
import SignInDialog from '@/components/auth/SignInDialog'; // Ensure this is imported
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
// import { useIsMobile } from '@/hooks/use-mobile'; // Might not be as relevant for layout decisions here

import { Sparkles, CalendarDays, Heart } from 'lucide-react-native'; // CalendarDays is a closer match
import { cn } from '@/lib/utils';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const screenHeight = Dimensions.get('window').height;

const Hero = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  // const isMobile = useIsMobile(); // Assuming mobile-first design, so less conditional sizing based on this.

  const handleStartPlanning = () => {
    if (user) {
      navigation.navigate('DashboardStack', { screen: 'Dashboard' }); // Navigate to main Dashboard or Chat
    }
    // If not user, SignInDialog handles opening itself when its child button is pressed.
  };

  const handleSamplePlan = () => {
    // Placeholder for navigating to a sample plan or feature
    console.log("Navigate to Sample Plan");
  };

  return (
    // Main container with gradient background
    <StyledView className="relative">
      <LinearGradient
        colors={['rgba(255,248,225,0.2)', 'rgba(255,255,255,0.3)', 'rgba(255,248,225,0.5)']} // Soft gradient like web's gradient-bg
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: screenHeight * 0.9 }}
      />
      <StyledView className="px-4 pt-10 pb-10" style={{ minHeight: screenHeight * 0.8 }}> {/* Adjusted minHeight */}
        <StyledView className="items-center">
          {/* Section 1: Text content and CTA (was left column) */}
          <StyledView className="w-full items-center mb-12">
            {/* Glass card effect simplified to a styled View with padding and rounded corners */}
            <StyledView className="bg-white/80 p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md">
              <StyledText className="text-3xl md:text-4xl font-playfair font-bold leading-tight text-center text-gray-800">
                Plan Your Dream {'\n'}
                <StyledText className="text-wedding-red">Hindu Wedding</StyledText>{'\n'}
                With AI
              </StyledText>
              <StyledText className="mt-4 text-base md:text-lg text-gray-700 text-center">
                Sanskara AI is your virtual wedding planner that helps you navigate Hindu wedding
                rituals, vendors, and traditions to create your perfect ceremony.
              </StyledText>

              <StyledView className="mt-6 space-y-3 items-center">
                {user ? (
                  <Button
                    className="bg-wedding-red active:bg-opacity-80 w-full max-w-xs" // cta-button style
                    textClassName="text-white text-lg"
                    onPress={handleStartPlanning}
                  >
                    <View className="flex-row items-center">
                      <Sparkles size={20} color="white" className="mr-2" />
                      <Text className="text-white">Chat with Sanskara</Text>
                    </View>
                  </Button>
                ) : (
                  <SignInDialog>
                    <Button
                      className="bg-wedding-red active:bg-opacity-80 w-full max-w-xs"
                      textClassName="text-white text-lg"
                    >
                       <View className="flex-row items-center">
                        <Sparkles size={20} color="white" className="mr-2" />
                        <Text className="text-white">Chat with Sanskara</Text>
                       </View>
                    </Button>
                  </SignInDialog>
                )}
                <Button
                  variant="outline"
                  className="border-wedding-red active:bg-wedding-red/10 w-full max-w-xs"
                  textClassName="text-wedding-red text-lg"
                  onPress={handleSamplePlan}
                >
                  <View className="flex-row items-center">
                    <CalendarDays size={20} className="text-wedding-red mr-2" />
                    <Text className="text-wedding-red">See Sample Plan</Text>
                  </View>
                </Button>
              </StyledView>
            </StyledView>

            <StyledView className="mt-6 flex-row items-center gap-2">
              {/* Simplified social proof */}
              <StyledView className="flex-row -space-x-2">
                {[1,2,3].map(i =>
                  <StyledView key={i} className="h-8 w-8 rounded-full bg-wedding-red/20 border-2 border-white items-center justify-center">
                    <StyledText className="text-xs font-semibold text-wedding-red">{String.fromCharCode(64 + i)}</StyledText>
                  </StyledView>
                )}
              </StyledView>
              <StyledText className="text-sm text-gray-600">
                <StyledText className="font-semibold">500+</StyledText> couples planned their dream wedding
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Section 2: Image (was right column) */}
          <StyledView className="w-full items-center max-w-md">
            {/* Decorative elements omitted for simplicity in first pass */}
            <StyledView className="relative bg-white p-2 rounded-2xl shadow-lg">
              <StyledImage
                source={require('@/assets/images/lovable-uploads/ef091a6d-01c3-422d-9dac-faf459fb74ab.png')}
                className="w-full aspect-[4/5] rounded-xl"
                resizeMode="cover"
              />
              <StyledView className="absolute -bottom-3 -right-3 bg-white p-2 rounded-xl shadow-md flex-row items-center gap-1">
                <Heart size={18} className="text-wedding-red" fill="#D62F32" />
                <StyledText className="text-xs font-medium">Perfect match</StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default Hero;
