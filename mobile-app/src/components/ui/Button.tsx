import * as React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { styled } from 'nativewind';
import { cn } from '@/lib/utils'; // Assuming cn (tailwind-merge + clsx) is or will be in mobile-app/src/lib/utils.ts

// Define base styles for Pressable (the button itself)
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary active:bg-primary/90',
        destructive: 'bg-destructive active:bg-destructive/90',
        outline: 'border border-input bg-background active:bg-accent',
        secondary: 'bg-secondary active:bg-secondary/80',
        ghost: 'active:bg-accent',
        link: 'underline-offset-4 active:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Define base styles for the Text inside the button
const buttonTextVariants = cva(
  'text-sm font-medium text-center',
  {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-accent-foreground', // This might need to be text-foreground or similar depending on theme
      secondary: 'text-secondary-foreground',
      ghost: 'text-accent-foreground', // Or text-foreground
      link: 'text-primary',
    },
    size: { // Text size usually doesn't change with button size, but can be added if needed
        default: '',
        sm: '',
        lg: '',
        icon: '',
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  },
});

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable>, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
  textClassName?: string; // Allow passing custom class for text
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, isLoading, textClassName, onPress, disabled, ...props }, ref) => {

    // If children is a string, wrap it in a Text component
    // Otherwise, render children directly (e.g. if an Icon is passed)
    const content = isLoading ? (
      <ActivityIndicator
        size="small"
        color={
          variant === 'default' || variant === 'destructive' || variant === 'secondary'
          ? 'white' // Example, ideally use theme colors from text variants
          : 'black' // Example
        } />
    ) : typeof children === 'string' ? (
      <StyledText className={cn(buttonTextVariants({ variant, size }), textClassName)}>
        {children}
      </StyledText>
    ) : (
      children
    );

    return (
      <StyledPressable
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onPress={onPress}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </StyledPressable>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants, buttonTextVariants };
