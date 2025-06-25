import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { styled } from 'nativewind';

import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Loader2, LogIn, X } from 'lucide-react-native'; // Using react-native icons
// SignUpDialog will be a separate component/modal trigger
// const SignUpDialog = () => <Text className="text-blue-500">Sign Up</Text>;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type SignInFormValues = z.infer<typeof formSchema>;

interface SignInDialogProps {
  children?: React.ReactNode; // This will be the trigger element
}

const SignInDialog = ({ children }: SignInDialogProps) => {
  const { signIn } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      setModalVisible(false);
      reset(); // Reset form after successful submission
    } catch (error) {
      // Error toast is handled by AuthContext's signIn method
      console.error("Sign in error in dialog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The web version uses DialogTrigger which automatically handles open/close via its child.
  // In RN, we need to wrap the child and handle onPress to set modalVisible.
  const trigger = children ? React.cloneElement(children as React.ReactElement, {
    onPress: () => setModalVisible(true),
  }) : (
    <Button variant="outline" onPress={() => setModalVisible(true)} className="flex-row items-center gap-2">
      <User size={18} color="gray" /> {/* Adjust color as needed */}
      <StyledText>Sign In</StyledText>
    </Button>
  );

  return (
    <>
      {trigger}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          reset(); // Reset form if modal is closed manually
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexGrow}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <StyledView className="flex-1 justify-center items-center bg-black/50 p-4">
              <StyledView className="bg-white p-6 rounded-lg w-full max-w-sm">
                <StyledView className="flex-row justify-between items-center mb-4">
                  <StyledText className="text-xl font-playfair text-gray-800"> {/* font-playfair needs to be loaded */}
                    Sign In to SanskaraAI
                  </StyledText>
                  <StyledPressable onPress={() => { setModalVisible(false); reset(); }}>
                    <X size={24} color="gray" />
                  </StyledPressable>
                </StyledView>

                <StyledText className="text-sm text-gray-600 mb-4">
                  Enter your credentials to access your wedding planning account.
                </StyledText>

                {/* Simple Separator */}
                <StyledView className="h-px bg-gray-200 my-2" />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email"
                      placeholder="your.email@example.com"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Password"
                      placeholder="******"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.password?.message}
                      secureTextEntry
                    />
                  )}
                />

                <StyledView className="flex-row justify-between items-center mt-1 mb-3">
                  <Button variant="link" className="p-0 h-auto" textClassName="text-wedding-red">
                    Forgot password?
                  </Button>
                </StyledView>

                <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}
                  className="bg-wedding-red active:bg-opacity-80" // Custom class for Sign In button
                  textClassName="text-white" // Ensure text is white for this button
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                  {/* Icons can be added as children if Button supports it, or via specific props */}
                  {/* {!isSubmitting && <LogIn size={18} color="white" className="ml-2" />} */}
                </Button>

                <StyledView className="items-center pt-4">
                  <StyledText className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    {/* Replace with actual SignUpDialog trigger when available */}
                    <StyledText className="text-wedding-red font-semibold">Sign Up</StyledText>
                  </StyledText>
                </StyledView>

              </StyledView>
            </StyledView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

// Minimal styles needed if mostly using NativeWind, but useful for KeyboardAvoidingView
const styles = StyleSheet.create({
  flexGrow: {
    flex: 1,
  },
});

export default SignInDialog;
