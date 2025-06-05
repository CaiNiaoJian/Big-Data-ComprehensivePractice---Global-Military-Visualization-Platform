/// <reference types="react-scripts" />

declare global {
  interface Window {
    AMap: any; // Declaring AMap as 'any' to resolve TS errors for now
  }
}
