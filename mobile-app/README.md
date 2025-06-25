# Sanskara AI - Mobile Application

This is the Expo-based mobile application for Sanskara AI, migrated from the original web application.

## Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds and submissions): `npm install -g eas-cli`
- Git

## Getting Started

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-root>/mobile-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Set Up Environment Variables (Supabase):**
    The application uses Supabase for backend services. Credentials are managed via `app.config.js`.
    *   Open `mobile-app/app.config.js`.
    *   Update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` constants with your project's actual Supabase URL and Anon Key.
    *   If you plan to use EAS Build, update `extra.eas.projectId` in `mobile-app/app.json` with your EAS project ID (you can get this by running `eas project:init` in the `mobile-app` directory if you haven't already).

4.  **Prepare Blog Data (One-time or when blog content changes):**
    The blog posts are generated from Markdown files. Run the script to prepare the data:
    ```bash
    node scripts/prepare-blog-data.js
    ```
    (Consider adding this to your `package.json` scripts, e.g., `"prepare:blog": "node scripts/prepare-blog-data.js"`)

5.  **Acquire and Add Custom Fonts:**
    The application is configured to use 'Playfair Display' and 'Poppins' fonts (see `tailwind.config.js`). These font files (`.ttf` or `.otf`) are not included in the repository.
    *   Download these fonts (e.g., from Google Fonts).
    *   Place the font files into `mobile-app/assets/fonts/`.
    *   Update `mobile-app/App.tsx` to load these fonts using `expo-font`. Search for the `useEffect` hook that loads fonts (a placeholder might exist or you'll need to add it). Example:
        ```javascript
        // In App.tsx
        // ...
        // const [fontsLoaded, error] = useFonts({
        //   'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
        //   'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        //   // Add other weights/styles if used
        // });

        // if (!fontsLoaded && !error) {
        //   return null; // Or an AppLoading component
        // }
        // ...
        ```
    *(This font loading part needs to be implemented in App.tsx)*

## Running the Application (Development)

1.  **Start the Metro Bundler:**
    ```bash
    npm start
    # OR
    expo start
    ```

2.  **Run on a Device/Simulator:**
    *   **Expo Go App (Recommended for quick iteration):**
        *   Install the "Expo Go" app on your iOS or Android device.
        *   Scan the QR code shown in the terminal after running `npm start`.
    *   **iOS Simulator (macOS only):**
        Press `i` in the terminal after `npm start`, or run `npm run ios`. (Requires Xcode)
    *   **Android Emulator:**
        Press `a` in the terminal after `npm start`, or run `npm run android`. (Requires Android Studio and an emulator setup)
    *   **Web (Limited native functionality):**
        Press `w` in the terminal, or run `npm run web`.

## Available Scripts

In the `mobile-app/package.json`, you'll find scripts like:
- `npm start`: Starts the development server.
- `npm run android`: Runs the app on an Android emulator/device.
- `npm run ios`: Runs the app on an iOS simulator/device.
- `npm run web`: Runs the app in a web browser.

## Building for Production (EAS Build)

Refer to the Expo Application Services (EAS) documentation for detailed instructions.

1.  **Login to EAS:**
    ```bash
    eas login
    ```
2.  **Configure Build Profiles (if needed):**
    Modify `eas.json` to suit your needs.
3.  **Ensure App Configuration is Correct:**
    Update `app.json` with your final `bundleIdentifier`, `package`, `owner`, `name`, `version`, and ensure all assets (icons, splash screen) are correctly placed and referenced.
4.  **Start a Build:**
    ```bash
    eas build -p android --profile production
    eas build -p ios --profile production
    # Or for specific profiles:
    # eas build -p all --profile preview
    ```
5.  **Submit to Stores (EAS Submit):**
    After a successful build, you can submit it to the app stores:
    ```bash
    eas submit -p android --latest
    eas submit -p ios --latest
    ```

## Project Structure

- `assets/`: Static assets like images, fonts.
  - `assets/blog/`: Markdown files for blog posts.
- `src/`: Application source code.
  - `components/`: Shared UI components.
    - `ui/`: Generic UI primitives (Button, Card, etc.).
  - `context/`: React Context API providers (e.g., `AuthContext`).
  - `hooks/`: Custom React hooks.
  - `layouts/`: Layout components for screens.
  - `lib/`: Utility functions, data processing (e.g., `blog-posts.ts`).
  - `navigation/`: Navigation setup and types.
  - `pages/`: Screen components.
  - `services/`: API interaction logic (e.g., Supabase client).
- `scripts/`: Utility scripts (e.g., `prepare-blog-data.js`).
- `App.tsx`: Main application entry point.
- `app.config.js`: Dynamic app configuration (merges with `app.json`).
- `app.json`: Static app configuration for Expo.
- `babel.config.js`: Babel configuration (includes NativeWind).
- `eas.json`: EAS Build and Submit configuration.
- `tailwind.config.js`: Tailwind CSS (NativeWind) configuration.

## Contributing

[Details about contributing to the project, if applicable]

## License

[Project License, if applicable]
