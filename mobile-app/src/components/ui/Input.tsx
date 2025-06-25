import * as React from 'react';
import { TextInput, View, Text } from 'react-native';
import { styled } from 'nativewind';
import { cn } from '@/lib/utils';

const StyledTextInput = styled(TextInput);
const StyledView = styled(View);
const StyledText = styled(Text);

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string; // For displaying error messages
  inputClassName?: string; // To style the TextInput itself
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, inputClassName, ...props }, ref) => {
    return (
      <StyledView className={cn('mb-4', className)}>
        {label && <StyledText className="text-sm font-medium text-gray-700 mb-1">{label}</StyledText>}
        <StyledTextInput
          ref={ref}
          className={cn(
            'h-10 border border-input bg-background px-3 py-2 text-sm rounded-md focus:border-primary',
            // Basic styling for focus, actual ring effect is harder in RN without extra work
            // Placeholder for error styling
            error ? 'border-destructive' : 'border-input',
            inputClassName
          )}
          placeholderTextColor="#a1a1aa" // zinc-400, good placeholder color
          {...props}
        />
        {error && <StyledText className="text-xs text-destructive mt-1">{error}</StyledText>}
      </StyledView>
    );
  }
);
Input.displayName = 'Input';

export { Input };
