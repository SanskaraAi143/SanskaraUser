import React from 'react';
import { View, Text, Image, Pressable, Linking } from 'react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Linkedin, Instagram, Mail, Github } from 'lucide-react-native'; // Assuming these are available
import { useNavigation } from '@react-navigation/native'; // If any links are internal

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledPressable = styled(Pressable);

interface FooterLinkProps {
  href?: string; // For external links
  screenName?: string; // For internal navigation
  label: string;
  isNavLink?: boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, screenName, label, isNavLink }) => {
  const navigation = useNavigation<any>();
  const handlePress = () => {
    if (href) {
      Linking.openURL(href).catch(err => console.error("Couldn't load page", err));
    } else if (screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <StyledPressable onPress={handlePress} className="py-1">
      <StyledText className={cn("text-gray-600 active:text-wedding-red", isNavLink ? "text-base" : "text-sm")}>
        {label}
      </StyledText>
    </StyledPressable>
  );
};

interface SocialIconProps {
  href: string;
  icon: React.ElementType;
  label: string;
}
const SocialIcon: React.FC<SocialIconProps> = ({ href, icon: Icon, label }) => (
  <StyledPressable
    onPress={() => Linking.openURL(href)}
    className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
    aria-label={label}
  >
    <LinearGradient colors={['#FFD700', '#FF8F00']} className="h-full w-full items-center justify-center rounded-full">
      <Icon size={20} color="white" />
    </LinearGradient>
  </StyledPressable>
);


const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Simplified structure: stacked sections
  // Glass effect and complex bg omitted for brevity, can be added like Navbar
  return (
    <StyledView className="bg-wedding-cream/50 border-t border-wedding-gold/20 pt-8 pb-6">
      <StyledView className="container mx-auto px-6">
        {/* Logo and Description */}
        <StyledView className="items-center mb-8">
          <StyledView className="flex-row items-center gap-2 mb-3">
            <LinearGradient
              colors={['#FFD700', '#FF8F00']}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <StyledImage source={require('@/assets/images/logo.jpeg')} className="h-8 w-8 rounded-full" />
            </LinearGradient>
            <StyledText className="text-xl font-playfair font-semibold text-yellow-800">
              Sanskara<StyledText className="font-bold text-wedding-red">AI</StyledText>
            </StyledText>
          </StyledView>
          <StyledText className="text-gray-600 text-center text-base max-w-md">
            Your AI-powered guide to planning a beautiful, authentic Hindu wedding.
          </StyledText>
        </StyledView>

        {/* Social Media Links */}
        <StyledView className="flex-row justify-center gap-4 mb-8">
          <SocialIcon href="https://www.linkedin.com/company/sanskaraai/" icon={Linkedin} label="LinkedIn" />
          <SocialIcon href="https://www.instagram.com/sanskaraai/" icon={Instagram} label="Instagram" />
          <SocialIcon href="mailto:admin@sanskaraai.com" icon={Mail} label="Email Admin" />
          <SocialIcon href="https://vendors.sanskaraai.com/" icon={Github} label="Vendors GitHub" />
        </StyledView>

        {/* Link Sections (Simplified to one column for now or two smaller ones) */}
        <StyledView className="flex-row justify-around mb-8">
          <StyledView>
            <StyledText className="text-lg font-playfair font-bold text-yellow-800 mb-3">Company</StyledText>
            <FooterLink label="About Us" screenName="AboutUs" isNavLink /> {/* Assuming 'AboutUs' screen exists */}
            <FooterLink label="Blog" screenName="BlogStack" isNavLink />
            {/* Add more as placeholder screens are made */}
          </StyledView>
          <StyledView>
            <StyledText className="text-lg font-playfair font-bold text-yellow-800 mb-3">Resources</StyledText>
            <FooterLink label="Wedding Guides" screenName="Guides" isNavLink />
            <FooterLink label="FAQs" screenName="FAQ" isNavLink />
          </StyledView>
        </StyledView>

        {/* Copyright and Legal */}
        <StyledView className="pt-6 border-t border-wedding-gold/10 items-center">
          <StyledText className="text-gray-500 text-xs mb-2">
            © {currentYear} SanskaraAI. All rights reserved.
          </StyledText>
          <StyledView className="flex-row gap-4">
            <FooterLink label="Privacy Policy" screenName="PrivacyPolicy" />
            <FooterLink label="Terms of Service" screenName="TermsOfService" />
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

import { cn } from '@/lib/utils'; // Import cn from global utils

export default Footer;
