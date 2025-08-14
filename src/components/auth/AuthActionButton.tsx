import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button, ButtonProps } from '@/components/ui/button';

interface AuthActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  loggedInAction?: () => void;
  navigateTo?: string;
  children: React.ReactNode;
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
    } else {
      // If not logged in, navigate to the auth page to sign up or sign in.
      navigate('/auth?mode=signup');
    }
  };

  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default AuthActionButton;
