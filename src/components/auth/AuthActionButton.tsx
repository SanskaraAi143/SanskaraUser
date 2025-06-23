import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SignInDialog from '@/components/auth/SignInDialog';
import { Button, ButtonProps } from '@/components/ui/button'; // Assuming ButtonProps can be imported

interface AuthActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  loggedInAction?: () => void; // Action to perform if the user is logged in
  navigateTo?: string; // Optional: path to navigate to if logged in (alternative to loggedInAction)
  children: React.ReactNode;
  // We can add specific props for SignInDialog if needed, or assume SignInDialog takes its trigger as children
}

const AuthActionButton: React.FC<AuthActionButtonProps> = ({
  loggedInAction,
  navigateTo,
  children,
  ...buttonProps
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      if (loggedInAction) {
        loggedInAction();
      } else if (navigateTo) {
        navigate(navigateTo);
      }
    }
    // If not logged in, the SignInDialog will be triggered by its parent structure
  };

  if (user) {
    return (
      <Button {...buttonProps} onClick={handleClick}>
        {children}
      </Button>
    );
  }

  // If not logged in, wrap the button content with SignInDialog
  // The actual button rendering will be handled by SignInDialog's trigger
  return (
    <SignInDialog>
      <Button {...buttonProps}>
        {children}
      </Button>
    </SignInDialog>
  );
};

export default AuthActionButton;
