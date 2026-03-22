/**
 * Production-optimized logging utility
 * Manages console output based on environment
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEVELOPMENT = import.meta.env.DEV;

export class Logger {
  static info(message: string, ...args: any[]) {
    if (IS_DEVELOPMENT) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`⚠️ ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(`❌ ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]) {
    if (IS_DEVELOPMENT) {
      console.debug(`🔍 ${message}`, ...args);
    }
  }

  // Keep memory system logging even in production for user transparency
  static memory(message: string, ...args: any[]) {
    console.log(`✅ ${message}`, ...args);
  }

  // Keep pricing updates in production for transparency
  static pricing(message: string, ...args: any[]) {
    console.log(`✅ ${message}`, ...args);
  }
}

export default Logger;