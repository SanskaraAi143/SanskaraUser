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
      // User is logged in, perform the intended action
      if (loggedInAction) {
        loggedInAction();
      } else if (navigateTo) {
        navigate(navigateTo);
      }
    } else {
      // User is not logged in, navigate to the unified auth page
      // We'll default to signup mode as this is usually for new users
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
