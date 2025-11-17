/**
 * Application configuration utility
 * Reads environment variables and provides typed access
 */

interface AppConfig {
  apiUrl: string;
  appName: string;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
};

export const config: AppConfig = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3001'),
  appName: getEnvVar('VITE_APP_NAME', 'STEM Lab Assistant'),
};
