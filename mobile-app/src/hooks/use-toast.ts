import Toast from 'react-native-toast-message';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | string; // shadcn uses variant, react-native-toast-message uses type
  // Add other props if needed from the original shadcn toast type
};

const showToast = (props: ToastProps) => {
  const { title, description, variant } = props;

  let type: 'success' | 'error' | 'info' = 'success'; // Default type
  if (variant === 'destructive') {
    type = 'error';
  }
  // Add more mappings if other variants are used, e.g. "warning" -> "info"

  Toast.show({
    type: type,
    text1: title,
    text2: description,
    position: 'top', // Default position
    visibilityTime: 4000, // Default visibility time
    // autoHide: true, // Default
    // topOffset: 30, // Default
    // bottomOffset: 40, // Default
    // props: {}, // Additional props for custom toast types
  });
};

// This hook doesn't need to return the full state management like shadcn's useToast
// if react-native-toast-message is used imperatively.
// We just need the `toast` function.
// If components need to dismiss toasts programmatically or manage state, this hook could be expanded.
export const toast = showToast;

// If a hook `useToast` is explicitly called (e.g. `const { toast } = useToast()`),
// we can provide it like this:
export const useToast = () => {
  return {
    toast: showToast,
    // dismiss: (toastId?: string) => Toast.hide(), // General dismiss, not by ID without more complex state mgmt
  };
};

// For compatibility with shadcn/ui's direct `toast()` import:
// export { toast }; // This is already achieved by `export const toast = showToast;`
// The original shadcn/ui `useToast` also returns the list of toasts, etc.
// which is not needed here as `react-native-toast-message` handles its own state.
// So, the `useToast` hook here is simplified.
// `AuthContext` calls `toast({...})` directly, so exporting `toast` function is key.
