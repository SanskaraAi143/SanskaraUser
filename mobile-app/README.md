# Sanskara AI Mobile App

This is the mobile application for Sanskara AI, built with Expo.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm
- Expo CLI
  ```sh
  npm install -g expo-cli
  ```

### Installation

1. Clone the repo
2. Navigate to the `mobile-app` directory
   ```sh
   cd mobile-app
   ```
3. Install NPM packages
   ```sh
   npm install
   ```

### Running the Application

To run the app, you can use the following commands:

- **To run on an Android device or emulator:**
  ```sh
  npm run android
  ```

- **To run on an iOS device or simulator (requires a Mac):**
  ```sh
  npm run ios
  ```

- **To run in a web browser:**
  ```sh
  npm run web
  ```

This will start the Metro Bundler. You can then scan the QR code with the Expo Go app on your phone to run the app on your device.

## Environment Variables

The application requires a `.env` file in the `mobile-app` directory with the following environment variables:

```
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase URL and anon key.
