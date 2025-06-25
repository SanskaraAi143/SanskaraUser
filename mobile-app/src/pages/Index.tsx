import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native'; // Image import removed as it's not directly used here now
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero"; // Import the new Hero
const Features = () => <View className="p-4 bg-gray-200"><Text>Features Placeholder</Text></View>;
const RitualGuide = () => <View className="p-4 bg-gray-300"><Text>RitualGuide Placeholder</Text></View>;
const ChatDemo = () => <View className="p-4 bg-gray-200"><Text>ChatDemo Placeholder</Text></View>;
const Pricing = () => <View className="p-4 bg-gray-300"><Text>Pricing Placeholder</Text></View>;
import Footer from "@/components/Footer"; // Import the new Footer

// SignInDialog will be imported
import SignInDialog from "@/components/auth/SignInDialog"; // Import the new SignInDialog
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from '@react-navigation/native';
// import { useIsMobile } from "@/hooks/use-mobile"; // Placeholder useIsMobile created

// Type for navigation stack
type RootStackParamList = {
  Dashboard: undefined;
  // other routes...
};
// It's better to define this in a central navigation types file eventually

const Index = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>(); // Use 'any' for now, or define proper types
  // const isMobile = useIsMobile(); // Not immediately used in this simplified version

  const handleGetStarted = () => {
    if (user) {
      navigation.navigate('Dashboard'); // Navigate to Dashboard if user exists
    } else {
      // Here, the original code uses SignInDialog, which is a modal.
      // For now, let's just log or navigate to a placeholder sign-in screen if we had one.
      console.log("User not signed in, show sign-in dialog/screen");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <Navbar />
      <Hero />
      <Features />
      <RitualGuide />
      <ChatDemo />
      <Pricing />

      {/* Divine Planning Crew Section */}
      <View className="py-16 bg-wedding-cream items-center">
        <View className="planning-crew glass-card max-w-5xl w-full mx-auto flex-col md:flex-row items-center gap-10 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
          <View className="crew-image-container flex-1 items-center">
            {/* For local images in React Native, use require or import and set width/height explicitly if not using aspect ratio */}
            {/* <Image source={require('@/assets/crew-bitemoji.jpeg')} className="crew-image rounded-2xl w-full max-w-md object-cover shadow-lg" style={{ minHeight: 320, backgroundColor: '#fff8e1' }} /> */}
            <View className="w-full max-w-md h-80 bg-gray-400 rounded-2xl shadow-lg items-center justify-center">
              <Text>Image Placeholder (crew-bitemoji.jpeg)</Text>
            </View>
          </View>
          <View className="crew-description flex-1 mt-6 md:mt-0">
            <Text className="text-2xl md:text-3xl font-bold mb-4 text-wedding-gold">Meet Your Divine Planning Crew</Text>
            <Text className="mb-4 text-gray-700">Your dedicated team of AI assistants, each specializing in different aspects of your wedding journey:</Text>
            <View className="space-y-3">
              <Text className="text-base md:text-lg"><Text className="text-2xl">👨‍🍳</Text> Chef Arjun - <Text className="font-normal">Your culinary excellence guide</Text></Text>
              <Text className="text-base md:text-lg"><Text className="text-2xl">💃</Text> Priya - <Text className="font-normal">Your tradition & decoration specialist</Text></Text>
              <Text className="text-base md:text-lg"><Text className="text-2xl">🧘‍♂️</Text> Pandit Ji - <Text className="font-normal">Your sacred ritual advisor</Text></Text>
              <Text className="text-base md:text-lg">
                <Text className="px-3 py-1 rounded-xl bg-yellow-100 text-wedding-gold font-semibold"><Text className="text-xl mr-2">🎧</Text>Tech Guide - Your digital planning assistant</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      {/* Gradients require a specific component like Expo's LinearGradient */}
      <View className="py-12 md:py-20 bg-wedding-gold text-white">
        <View className="container mx-auto px-4 items-center">
          <Text className="text-2xl md:text-4xl font-playfair font-bold mb-4 md:mb-6 text-white text-center">
            Begin Your Wedding Journey Today
          </Text>
          <Text className="text-white opacity-90 text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 text-center">
            Start planning your perfect Hindu wedding with personalized guidance,
            vendor recommendations, and cultural insights.
          </Text>
          {user ? (
            <Button
              variant="outline"
              size="lg" // Corresponds to h-11 px-8, web was py-2/3 px-6/8
              className="bg-white border-wedding-gold rounded-full active:bg-wedding-cream"
              textClassName="text-wedding-gold font-medium text-base md:text-lg" // md:text-lg might not work directly on textClassName
              onPress={handleGetStarted}
            >
              Go to Dashboard
            </Button>
          ) : (
            <SignInDialog>
              <Button
                variant="outline"
                size="lg"
                className="bg-white border-wedding-red rounded-full active:bg-wedding-cream"
                textClassName="text-wedding-red font-medium text-base md:text-lg"
                onPress={handleGetStarted} // This will effectively be the trigger for SignInDialog if it captures onPress
              >
                Get Started For Free
              </Button>
            </SignInDialog>
          )}
        </View>
      </View>
      <Footer />
    </ScrollView>
  );
};

export default Index;
