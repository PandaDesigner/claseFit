// jest.setup.ts — runs after the test framework is loaded for each file.
// Importing React Native Testing Library auto-extends expect with built-in matchers
// (toBeOnTheScreen, toHaveTextContent, etc.) since RNTL v12.2+.
import '@testing-library/react-native';

// Silence noisy logs from React Native and third-party libraries during tests.
jest.spyOn(console, 'warn').mockImplementation(() => {});