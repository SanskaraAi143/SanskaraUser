// Defines the parameter lists for each navigator.
// undefined means the route doesn't take params.
// For routes like BlogDetail, you'd specify { slug: string } etc.

export type RootStackParamList = {
  Index: undefined;
  DashboardStack: undefined; // This will be a nested stack
  BlogStack: undefined;      // This could also be a nested stack
  NotFound: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Chat: undefined;
  Tasks: undefined;
  Timeline: undefined;
  MoodBoard: undefined;
  Budget: undefined;
  Guests: undefined;
  Vendors: undefined;
  Settings: undefined;
};

export type BlogStackParamList = {
  BlogList: undefined;
  BlogDetail: { slug: string }; // Example if slug is passed
};

// You can also define composite navigation props if you need to jump between nested navigators
// For example, from a screen in DashboardStack to a screen in BlogStack.
// See React Navigation documentation for advanced typing.
